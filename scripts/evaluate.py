import os
import sys
import json
import time
import pandas as pd
from typing import List, Dict, Any

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.services.extractor import extract_email, extract_phone, extract_name, extract_skills
from app.services.matcher import run_hybrid_matching
from app.ml.evaluation import (
    calculate_precision_at_k,
    calculate_recall_at_k,
    calculate_ndcg_at_k,
    evaluate_extraction_metrics
)

DATASET_FILE = os.path.abspath("data/evaluation_dataset/dataset.json")
REPORT_PATH = os.path.abspath("reports/evaluation_report.csv")


def run_evaluation():
    print("=" * 70)
    print(" SmartATS System Evaluation & Benchmarking Suite ")
    print("=" * 70)

    if not os.path.exists(DATASET_FILE):
        print(f"Dataset file not found at {DATASET_FILE}")
        return

    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    jobs = dataset["jobs"]
    candidates = dataset["candidates"]

    # -------------------------------------------------------------
    # 1. Extraction Evaluation
    # -------------------------------------------------------------
    print("\n[Phase 1] Evaluating Entity Extraction Accuracy...")

    email_matches = 0
    phone_matches = 0
    name_matches = 0
    skill_precisions = []
    skill_recalls = []
    skill_f1s = []

    start_extract_time = time.perf_counter()

    for cand in candidates:
        text = cand["resume_text"]
        
        # Email
        extracted_email = extract_email(text)
        if extracted_email == cand.get("email", "").lower():
            email_matches += 1

        # Phone
        extracted_phone = extract_phone(text)
        # Check digit overlap
        gt_digits = "".join(filter(str.isdigit, cand.get("phone", "")))
        ext_digits = "".join(filter(str.isdigit, extracted_phone or ""))
        if gt_digits and gt_digits in ext_digits:
            phone_matches += 1

        # Name
        extracted_name = extract_name(text)
        if extracted_name and cand.get("name", "").lower() in extracted_name.lower():
            name_matches += 1

        # Skills
        extracted_skills = extract_skills(text)
        gt_skills = cand.get("ground_truth_skills", [])
        p, r, f1 = evaluate_extraction_metrics(extracted_skills, gt_skills)
        skill_precisions.append(p)
        skill_recalls.append(r)
        skill_f1s.append(f1)

    extract_time = (time.perf_counter() - start_extract_time) / len(candidates)

    total_cands = len(candidates)
    email_acc = email_matches / total_cands
    phone_acc = phone_matches / total_cands
    name_acc = name_matches / total_cands
    avg_skill_p = sum(skill_precisions) / len(skill_precisions)
    avg_skill_r = sum(skill_recalls) / len(skill_recalls)
    avg_skill_f1 = sum(skill_f1s) / len(skill_f1s)

    print(f" - Email Extraction Accuracy: {email_acc:.1%} ({email_matches}/{total_cands})")
    print(f" - Phone Extraction Accuracy: {phone_acc:.1%} ({phone_matches}/{total_cands})")
    print(f" - Name Extraction Accuracy:  {name_acc:.1%} ({name_matches}/{total_cands})")
    print(f" - Skill Precision:           {avg_skill_p:.1%}")
    print(f" - Skill Recall:              {avg_skill_r:.1%}")
    print(f" - Skill F1-Score:            {avg_skill_f1:.1%}")
    print(f" - Avg Extraction Latency:    {extract_time*1000:.2f} ms / resume")

    # -------------------------------------------------------------
    # 2. Matching Algorithm Comparison
    # -------------------------------------------------------------
    print("\n[Phase 2] Evaluating Ranking Algorithms & Weight Configurations...")

    configurations = [
        {"name": "Keyword Only (Baseline)", "w_kw": 1.0, "w_tfidf": 0.0},
        {"name": "TF-IDF Only (Baseline)",  "w_kw": 0.0, "w_tfidf": 1.0},
        {"name": "Hybrid (70% KW / 30% TFIDF)", "w_kw": 0.70, "w_tfidf": 0.30},
        {"name": "Hybrid (60% KW / 40% TFIDF)", "w_kw": 0.60, "w_tfidf": 0.40},
        {"name": "Hybrid (50% KW / 50% TFIDF)", "w_kw": 0.50, "w_tfidf": 0.50},
    ]

    report_rows = []

    for config in configurations:
        p_at_1, p_at_2, p_at_3 = [], [], []
        r_at_1, r_at_2, r_at_3 = [], [], []
        ndcg_at_3 = []
        matching_latencies = []

        for job in jobs:
            job_id_str = str(job["job_id"])
            relevance_dict = {
                c["candidate_id"]: c["job_relevance"].get(job_id_str, 0)
                for c in candidates
            }
            # Relevant candidates are those with relevance score >= 2
            relevant_cands = [cid for cid, rel in relevance_dict.items() if rel >= 2]

            candidate_scores = []
            for cand in candidates:
                cand_skills = extract_skills(cand["resume_text"])
                t0 = time.perf_counter()
                res = run_hybrid_matching(
                    resume_text=cand["resume_text"],
                    candidate_skills=cand_skills,
                    job_description=job["description"],
                    required_skills=job["required_skills"],
                    preferred_skills=job["preferred_skills"],
                    weight_keyword=config["w_kw"],
                    weight_tfidf=config["w_tfidf"]
                )
                matching_latencies.append(time.perf_counter() - t0)
                candidate_scores.append((cand["candidate_id"], res["final_score"]))

            # Rank candidates descending by score
            candidate_scores.sort(key=lambda x: x[1], reverse=True)
            ranked_ids = [c[0] for c in candidate_scores]

            p_at_1.append(calculate_precision_at_k(ranked_ids, relevant_cands, 1))
            p_at_2.append(calculate_precision_at_k(ranked_ids, relevant_cands, 2))
            p_at_3.append(calculate_precision_at_k(ranked_ids, relevant_cands, 3))

            r_at_1.append(calculate_recall_at_k(ranked_ids, relevant_cands, 1))
            r_at_2.append(calculate_recall_at_k(ranked_ids, relevant_cands, 2))
            r_at_3.append(calculate_recall_at_k(ranked_ids, relevant_cands, 3))

            ndcg_at_3.append(calculate_ndcg_at_k(ranked_ids, relevance_dict, 3))

        avg_p1 = sum(p_at_1) / len(p_at_1)
        avg_p2 = sum(p_at_2) / len(p_at_2)
        avg_p3 = sum(p_at_3) / len(p_at_3)
        avg_r3 = sum(r_at_3) / len(r_at_3)
        avg_ndcg3 = sum(ndcg_at_3) / len(ndcg_at_3)
        avg_latency_ms = (sum(matching_latencies) / len(matching_latencies)) * 1000

        print(
            f" > {config['name']:<35} | P@1: {avg_p1:.2f} | P@3: {avg_p3:.2f} | "
            f"R@3: {avg_r3:.2f} | NDCG@3: {avg_ndcg3:.3f} | Latency: {avg_latency_ms:.2f}ms"
        )

        report_rows.append({
            "Algorithm": config["name"],
            "Weight_Keyword": config["w_kw"],
            "Weight_TFIDF": config["w_tfidf"],
            "Precision@1": round(avg_p1, 4),
            "Precision@2": round(avg_p2, 4),
            "Precision@3": round(avg_p3, 4),
            "Recall@3": round(avg_r3, 4),
            "NDCG@3": round(avg_ndcg3, 4),
            "Avg_Latency_ms": round(avg_latency_ms, 2),
            "Skill_F1": round(avg_skill_f1, 4),
            "Email_Accuracy": round(email_acc, 4),
            "Phone_Accuracy": round(phone_acc, 4)
        })

    # Save to CSV
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    df = pd.DataFrame(report_rows)
    df.to_csv(REPORT_PATH, index=False)
    print(f"\n[Done] Benchmark report exported successfully to: {REPORT_PATH}")
    print("=" * 70)


if __name__ == "__main__":
    run_evaluation()
