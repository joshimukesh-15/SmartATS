import math
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.database.models import Application, Job, MatchResult, Candidate
from app.services.taxonomy import normalize_skill_name, get_equivalent_skill_match
from app.services.extractor import (
    extract_experience_years,
    extract_seniority_level,
    extract_education
)
from app.services.matcher import (
    compute_keyword_score,
    compute_experience_score,
    compute_education_score
)

DEFAULT_SCORING_WEIGHTS: Dict[str, float] = {
    "weight_skills": 0.40,
    "weight_text": 0.20,
    "weight_experience": 0.25,
    "weight_education": 0.15,
}


def resolve_scoring_weights(
    job_custom_weights: Optional[Dict[str, float]] = None,
    w_skills: Optional[float] = None,
    w_text: Optional[float] = None,
    w_exp: Optional[float] = None,
    w_edu: Optional[float] = None
) -> Dict[str, float]:
    """
    Resolves, sanitizes, and normalizes scoring weights across Leaderboard and Comparison views.
    Enforces documented recruiter defaults: 40% skills, 20% text similarity, 25% experience, 15% education.
    Rejects negatives, NaN, and zero sums; normalizes all weights to sum to 1.0.
    """
    job_weights = job_custom_weights or {}

    def sanitize(val: Any, default: float) -> float:
        if val is None or not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val) or val < 0.0:
            return default
        return float(val)

    def_s = DEFAULT_SCORING_WEIGHTS["weight_skills"]
    def_t = DEFAULT_SCORING_WEIGHTS["weight_text"]
    def_x = DEFAULT_SCORING_WEIGHTS["weight_experience"]
    def_e = DEFAULT_SCORING_WEIGHTS["weight_education"]

    raw_s = sanitize(w_skills, sanitize(job_weights.get("weight_skills"), def_s))
    raw_t = sanitize(w_text, sanitize(job_weights.get("weight_text"), def_t))
    raw_x = sanitize(w_exp, sanitize(job_weights.get("weight_experience"), def_x))
    raw_e = sanitize(w_edu, sanitize(job_weights.get("weight_education"), def_e))

    total = raw_s + raw_t + raw_x + raw_e
    if total <= 0.0:
        return DEFAULT_SCORING_WEIGHTS.copy()

    return {
        "weight_skills": round(raw_s / total, 3),
        "weight_text": round(raw_t / total, 3),
        "weight_experience": round(raw_x / total, 3),
        "weight_education": round(raw_e / total, 3),
    }


def evaluate_application_scoring(
    app: Application,
    job: Job,
    applied_weights: Dict[str, float]
) -> Dict[str, Any]:
    """
    Unified evaluation and multi-pillar scoring formula shared by both Leaderboard and Comparison.
    Only computes valid scores for applications with processing_status == 'COMPLETED' and valid MatchResult.
    Unprocessed, pending, or failed applications are assigned 0.0 to prevent misleading scores.
    """
    match = app.match_result
    cand = app.candidate

    is_completed = bool(
        app.processing_status
        and app.processing_status.upper() == "COMPLETED"
        and match is not None
    )

    raw_resume = cand.raw_text if cand and cand.raw_text else ""
    w_s = applied_weights["weight_skills"]
    w_t = applied_weights["weight_text"]
    w_x = applied_weights["weight_experience"]
    w_e = applied_weights["weight_education"]

    if is_completed:
        # 1. Experience & Seniority
        exp_years = extract_experience_years(raw_resume)
        seniority = extract_seniority_level(raw_resume, exp_years)
        exp_score = compute_experience_score(exp_years, seniority, job.description)

        # 2. Education
        edu_data = extract_education(raw_resume)
        edu_score = compute_education_score(edu_data, job.description)
        edu_level = edu_data.get("degree", "Unspecified")

        # 3. Match Result skills & text similarity
        matched_skills = list(match.matched_skills) if match.matched_skills else []
        missing_skills = list(match.missing_skills) if match.missing_skills else []
        pref_skills = list(match.preferred_matched_skills) if match.preferred_matched_skills else []
        tfidf_score = float(match.tfidf_score or 0.0)

        cand_all_skills = cand.extracted_skills if cand and cand.extracted_skills else []
        if not matched_skills and cand_all_skills and job.required_skills:
            matched_skills = [
                req for req in job.required_skills
                if any(cand_s.lower() == req.lower() for cand_s in cand_all_skills)
            ]
            missing_skills = [
                req for req in job.required_skills
                if req not in matched_skills
            ]

        # Equivalent skills (75% credit for genuine technology family equivalents)
        eq_skills: Dict[str, str] = {}
        for req in (job.required_skills or []):
            if req not in matched_skills:
                eq = get_equivalent_skill_match(req, cand_all_skills)
                if eq:
                    eq_skills[req] = eq

        # 4. Refined keyword score
        effective_kw_score = compute_keyword_score(
            matched_count=len(matched_skills),
            total_required=len(job.required_skills or []),
            equivalent_count=len(eq_skills)
        )

        # 5. Composite Final Score using active normalized recruiter weights
        calculated_composite = round(
            (w_s * effective_kw_score)
            + (w_t * tfidf_score)
            + (w_x * exp_score)
            + (w_e * edu_score),
            2
        )
        final_score = max(0.0, min(100.0, calculated_composite))

        score_breakdown = {
            "skills": effective_kw_score,
            "text": tfidf_score,
            "experience": exp_score,
            "education": edu_score,
            "weight_skills": w_s,
            "weight_text": w_t,
            "weight_experience": w_x,
            "weight_education": w_e,
        }

        explanation = match.score_explanation or (
            f"Multi-Factor Score: ({w_s:.0%} Skills) + ({w_t:.0%} Text) + "
            f"({w_x:.0%} Experience) + ({w_e:.0%} Education) = {final_score:.1f}%."
        )

    else:
        # Unprocessed (PENDING, PROCESSING), FAILED, or missing MatchResult records:
        final_score = 0.0
        effective_kw_score = 0.0
        tfidf_score = 0.0
        exp_score = 0.0
        edu_score = 0.0
        matched_skills = []
        missing_skills = []
        pref_skills = []
        eq_skills = {}

        exp_years = extract_experience_years(raw_resume) if raw_resume else 0.0
        seniority = extract_seniority_level(raw_resume, exp_years) if raw_resume else "Junior / Entry"
        edu_data = extract_education(raw_resume) if raw_resume else {}
        edu_level = edu_data.get("degree", "Unspecified")

        score_breakdown = {
            "skills": 0.0,
            "text": 0.0,
            "experience": 0.0,
            "education": 0.0,
            "weight_skills": w_s,
            "weight_text": w_t,
            "weight_experience": w_x,
            "weight_education": w_e,
        }

        status_str = (app.processing_status or "UNKNOWN").upper()
        if status_str == "FAILED":
            explanation = "Application processing failed. Candidate has not been evaluated."
        elif status_str in ("PENDING", "PROCESSING"):
            explanation = f"Application is currently {status_str.lower()}. Scoring pending evaluation."
        elif match is None:
            explanation = "Match result record is missing. Application has not been evaluated."
        else:
            explanation = f"Application status is {app.processing_status}. Not evaluated."

    return {
        "is_completed": is_completed,
        "final_score": final_score,
        "keyword_score": effective_kw_score,
        "tfidf_score": tfidf_score,
        "experience_score": exp_score,
        "education_score": edu_score,
        "experience_years": exp_years,
        "seniority_level": seniority,
        "education_level": edu_level,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "equivalent_skills": eq_skills,
        "preferred_matched_skills": pref_skills,
        "score_breakdown": score_breakdown,
        "score_explanation": explanation,
    }
