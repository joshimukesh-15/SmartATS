from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.ml.vectorizer import compute_tfidf_similarity
from app.services.taxonomy import normalize_skill_name


def evaluate_skill_gaps(
    candidate_skills: List[str],
    required_skills: List[str],
    preferred_skills: List[str]
) -> Tuple[List[str], List[str], List[str]]:
    """
    Normalizes and categorizes candidate skills into:
    - matched_required: required skills possessed by candidate
    - missing_required: required skills candidate is missing
    - matched_preferred: optional preferred skills possessed by candidate
    """
    cand_norm_set = {normalize_skill_name(s).lower() for s in candidate_skills}
    
    matched_required = []
    missing_required = []
    matched_preferred = []

    for req in required_skills:
        req_norm = normalize_skill_name(req)
        if req_norm.lower() in cand_norm_set:
            matched_required.append(req_norm)
        else:
            missing_required.append(req_norm)

    for pref in preferred_skills:
        pref_norm = normalize_skill_name(pref)
        if pref_norm.lower() in cand_norm_set:
            matched_preferred.append(pref_norm)

    return (
        sorted(list(set(matched_required))),
        sorted(list(set(missing_required))),
        sorted(list(set(matched_preferred)))
    )


def compute_keyword_score(matched_count: int, total_required: int) -> float:
    """Computes keyword score as percentage of matched required skills."""
    if total_required == 0:
        return 100.0
    return round((matched_count / total_required) * 100.0, 2)


def generate_explanation(
    candidate_name: str,
    final_score: float,
    keyword_score: float,
    tfidf_score: float,
    matched_required: List[str],
    missing_required: List[str],
    matched_preferred: List[str],
    total_required: int,
    w_keyword: float,
    w_tfidf: float
) -> str:
    """
    Constructs an objective, evidence-based explanation for the ranking score.
    Avoids subjective claims; highlights exact skill match ratios and text similarity.
    """
    explanation_parts = []
    
    # 1. Scoring Formula Breakdown
    explanation_parts.append(
        f"Hybrid Score Formula: ({w_keyword:.0%} × Keyword Match) + ({w_tfidf:.0%} × TF-IDF Text Similarity) = "
        f"({w_keyword:.2f} × {keyword_score:.1f}%) + ({w_tfidf:.2f} × {tfidf_score:.1f}%) = {final_score:.1f}%."
    )

    # 2. Skill Match Summary
    if total_required > 0:
        explanation_parts.append(
            f"Skill Match: The candidate matched {len(matched_required)} of {total_required} required skills "
            f"({keyword_score:.1f}% keyword coverage)."
        )
    else:
        explanation_parts.append("Skill Match: No mandatory skills were specified for this job.")

    if matched_required:
        explanation_parts.append(f"Matched Required Skills: {', '.join(matched_required)}.")

    # 3. Missing Skills
    if missing_required:
        explanation_parts.append(f"Missing Required Skills: {', '.join(missing_required)}.")
    else:
        explanation_parts.append("Missing Required Skills: None. The candidate satisfies all mandatory skill requirements.")

    # 4. Preferred Skills
    if matched_preferred:
        explanation_parts.append(f"Preferred Skills Identified: {', '.join(matched_preferred)}.")

    # 5. TF-IDF Contextual Analysis
    if tfidf_score >= 60.0:
        explanation_parts.append(
            f"Contextual Relevance: High vocabulary and technical domain overlap with the job description ({tfidf_score:.1f}% similarity)."
        )
    elif tfidf_score >= 35.0:
        explanation_parts.append(
            f"Contextual Relevance: Moderate lexical alignment with the job description terminology ({tfidf_score:.1f}% similarity)."
        )
    else:
        explanation_parts.append(
            f"Contextual Relevance: Low general vocabulary overlap with the job description ({tfidf_score:.1f}% similarity)."
        )

    return "\n\n".join(explanation_parts)


def run_hybrid_matching(
    resume_text: str,
    candidate_skills: List[str],
    job_description: str,
    required_skills: List[str],
    preferred_skills: List[str],
    candidate_name: str = "Candidate",
    weight_keyword: float = None,
    weight_tfidf: float = None
) -> Dict[str, Any]:
    """
    Executes full hybrid matching pipeline:
    1. Skill gap analysis
    2. Keyword score calculation
    3. TF-IDF text similarity
    4. Weighted hybrid scoring
    5. Explainable breakdown generation
    """
    w_kw = weight_keyword if weight_keyword is not None else settings.WEIGHT_KEYWORD
    w_tfidf = weight_tfidf if weight_tfidf is not None else settings.WEIGHT_TFIDF

    # Skill gaps
    matched_req, missing_req, matched_pref = evaluate_skill_gaps(
        candidate_skills=candidate_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills
    )

    # Keyword score
    keyword_score = compute_keyword_score(len(matched_req), len(required_skills))

    # TF-IDF cosine similarity
    # Combine job description and required skills for richer job text
    job_full_text = f"{job_description}\n" + " ".join(required_skills) + " " + " ".join(preferred_skills)
    tfidf_score = compute_tfidf_similarity(resume_text, job_full_text)

    # Weighted final score
    final_score = round((w_kw * keyword_score) + (w_tfidf * tfidf_score), 2)
    final_score = max(0.0, min(100.0, final_score))

    # Generate explainability report
    explanation = generate_explanation(
        candidate_name=candidate_name,
        final_score=final_score,
        keyword_score=keyword_score,
        tfidf_score=tfidf_score,
        matched_required=matched_req,
        missing_required=missing_req,
        matched_preferred=matched_pref,
        total_required=len(required_skills),
        w_keyword=w_kw,
        w_tfidf=w_tfidf
    )

    return {
        "keyword_score": keyword_score,
        "tfidf_score": tfidf_score,
        "final_score": final_score,
        "matched_skills": matched_req,
        "missing_skills": missing_req,
        "preferred_matched_skills": matched_pref,
        "score_explanation": explanation
    }
