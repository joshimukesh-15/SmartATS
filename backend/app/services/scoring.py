import os
import math
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
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

DEFAULT_WEIGHTS_4PILLAR: Dict[str, float] = {
    "skills": 0.40,
    "text": 0.20,
    "experience": 0.25,
    "education": 0.15,
}

FORMULA_DESCRIPTION_4PILLAR: str = (
    "Final Score = (Skills % × 0.40) + (Semantic Text % × 0.20) + "
    "(Experience Fit % × 0.25) + (Education % × 0.15)"
)


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

    provided = [w for w in (w_skills, w_text, w_exp, w_edu) if w is not None]
    if len(provided) == 4 and sum(provided) <= 0.0:
        raise ValueError("Weights cannot all be zero.")

    total = raw_s + raw_t + raw_x + raw_e
    if total <= 0.0:
        raise ValueError("Weights cannot all be zero.")

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
    raw_s = applied_weights.get("skills", applied_weights.get("weight_skills", DEFAULT_SCORING_WEIGHTS["weight_skills"]))
    raw_t = applied_weights.get("text", applied_weights.get("weight_text", DEFAULT_SCORING_WEIGHTS["weight_text"]))
    raw_x = applied_weights.get("experience", applied_weights.get("weight_experience", DEFAULT_SCORING_WEIGHTS["weight_experience"]))
    raw_e = applied_weights.get("education", applied_weights.get("weight_education", DEFAULT_SCORING_WEIGHTS["weight_education"]))

    total_w = raw_s + raw_t + raw_x + raw_e
    if total_w <= 0.0:
        w_s = DEFAULT_WEIGHTS_4PILLAR["skills"]
        w_t = DEFAULT_WEIGHTS_4PILLAR["text"]
        w_x = DEFAULT_WEIGHTS_4PILLAR["experience"]
        w_e = DEFAULT_WEIGHTS_4PILLAR["education"]
    else:
        w_s = round(raw_s / total_w, 3)
        w_t = round(raw_t / total_w, 3)
        w_x = round(raw_x / total_w, 3)
        w_e = round(raw_e / total_w, 3)

    weights = {
        "skills": float(w_s),
        "text": float(w_t),
        "experience": float(w_x),
        "education": float(w_e),
    }

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

        # 5. Composite Final Score using components and weights
        components = {
            "skills": {
                "percentage": float(effective_kw_score),
                "weight": float(w_s),
                "points": round(float(effective_kw_score) * float(w_s), 2),
            },
            "text": {
                "percentage": float(tfidf_score),
                "weight": float(w_t),
                "points": round(float(tfidf_score) * float(w_t), 2),
            },
            "experience": {
                "percentage": float(exp_score),
                "weight": float(w_x),
                "points": round(float(exp_score) * float(w_x), 2),
            },
            "education": {
                "percentage": float(edu_score),
                "weight": float(w_e),
                "points": round(float(edu_score) * float(w_e), 2),
            },
        }
        calculated_composite = round(sum(c["points"] for c in components.values()), 2)
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

        components = {
            "skills": {
                "percentage": 0.0,
                "weight": float(w_s),
                "points": 0.0,
            },
            "text": {
                "percentage": 0.0,
                "weight": float(w_t),
                "points": 0.0,
            },
            "experience": {
                "percentage": 0.0,
                "weight": float(w_x),
                "points": 0.0,
            },
            "education": {
                "percentage": 0.0,
                "weight": float(w_e),
                "points": 0.0,
            },
        }

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
        elif status_str in ("PENDING", "PROCESSING", "RE-SCORING", "RE_SCORING"):
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
        "weights": weights,
        "components": components,
        "score_breakdown": score_breakdown,
        "score_explanation": explanation,
    }


def attach_scoring_to_application(
    app: Application,
    job: Optional[Job] = None,
    db: Optional[Session] = None,
    applied_weights: Optional[Dict[str, float]] = None
) -> Application:
    """
    Attaches unified scoring weights, components, and final_score to an Application ORM instance
    and its nested MatchResult instance (if present).
    """
    if job is None:
        job = getattr(app, "job", None)
        if job is None and db is not None and getattr(app, "job_id", None):
            job = db.query(Job).filter(Job.job_id == app.job_id).first()

    if job is not None:
        if applied_weights is None:
            applied_weights = resolve_scoring_weights(job_custom_weights=getattr(job, "custom_weights", None))
        eval_res = evaluate_application_scoring(app, job, applied_weights)
        app.weights = eval_res["weights"]
        app.components = eval_res["components"]
        app.final_score = eval_res["final_score"]
        if getattr(app, "match_result", None) is not None:
            app.match_result.weights = eval_res["weights"]
            app.match_result.components = eval_res["components"]
            app.match_result.final_score = eval_res["final_score"]
    else:
        def_weights = {"skills": 0.40, "text": 0.20, "experience": 0.25, "education": 0.15}
        app.weights = def_weights
        app.components = {
            k: {"percentage": 0.0, "weight": v, "points": 0.0}
            for k, v in def_weights.items()
        }
        app.final_score = 0.0
        if getattr(app, "match_result", None) is not None:
            app.match_result.weights = def_weights
            app.match_result.components = app.components
            app.match_result.final_score = getattr(app.match_result, "final_score", 0.0) or 0.0

    return app


logger = logging.getLogger(__name__)


def rescore_job_applications(job_id: int, db: Optional[Session] = None) -> List[int]:
    """
    Recomputes text similarity and 4-pillar multi-factor scores for ALL applications of a job.
    1. Sets job status to 'Re-scoring' and application status to 'Re-scoring'.
    2. Builds per-job TF-IDF corpus from job description + all resumes for this job (+ neutral corpus if < 5 resumes).
    3. Fits deterministic TfidfVectorizer (sublinear_tf=True, smooth_idf=True, min_df=1, sorted vocabulary).
    4. Caches fitted vectorizer in-memory with current job version.
    5. Re-scores all applications of the job and persists updated MatchResult records.
    6. Resets application status to 'COMPLETED' and job status to 'Active'.
    """
    should_close_db = False
    if db is None:
        db = SessionLocal()
        should_close_db = True

    try:
        from app.ml.vectorizer import vectorizer_cache, fit_job_vectorizer
        from app.services.matcher import run_hybrid_matching
        from app.services.parser import extract_resume_text

        job = db.query(Job).filter(Job.job_id == job_id).first()
        if not job:
            logger.warning("rescore_job_applications: Job %s not found.", job_id)
            return []

        # 1. Set job status to Re-scoring
        vectorizer_cache.set_job_status(job_id, "Re-scoring")

        applications = db.query(Application).filter(Application.job_id == job_id).all()
        if not applications:
            vectorizer_cache.set_job_status(job_id, "Active")
            return []

        # Mark non-failed applications as Re-scoring in DB
        for app in applications:
            if app.processing_status != "FAILED":
                app.processing_status = "Re-scoring"
        db.commit()

        # 2. Gather resume texts
        resume_texts: List[str] = []
        for app in applications:
            cand = app.candidate
            r_text = cand.raw_text if cand and cand.raw_text else ""
            if not r_text and app.resume_path and os.path.exists(app.resume_path):
                try:
                    r_text, _ = extract_resume_text(app.resume_path)
                    if cand:
                        cand.raw_text = r_text
                except Exception:
                    pass
            if r_text:
                resume_texts.append(r_text)

        # 3. Fit per-job vectorizer
        job_full_text = (
            f"{job.description}\n"
            + " ".join(job.required_skills or [])
            + " "
            + " ".join(job.preferred_skills or [])
        )
        vectorizer = fit_job_vectorizer(job_text=job_full_text, resume_texts=resume_texts)

        # 4. Cache fitted vectorizer with current version
        version = vectorizer_cache.get_version(job_id)
        vectorizer_cache.set_vectorizer(job_id, vectorizer, version=version)

        # 5. Recompute scores for all applications
        updated_ids: List[int] = []
        custom_w = job.custom_weights or {}

        for app in applications:
            cand = app.candidate
            r_text = cand.raw_text if cand and cand.raw_text else ""
            if not r_text:
                app.processing_status = "FAILED"
                continue

            c_name = cand.name if cand and cand.name else "Candidate"
            c_skills = cand.extracted_skills if cand and cand.extracted_skills else []

            match_data = run_hybrid_matching(
                resume_text=r_text,
                candidate_skills=c_skills,
                job_description=job.description,
                required_skills=job.required_skills or [],
                preferred_skills=job.preferred_skills or [],
                candidate_name=c_name,
                weight_keyword=custom_w.get("weight_skills"),
                weight_tfidf=custom_w.get("weight_text"),
                weight_experience=custom_w.get("weight_experience"),
                weight_education=custom_w.get("weight_education"),
                vectorizer=vectorizer
            )

            match = app.match_result
            if not match:
                match = MatchResult(application_id=app.application_id)
                db.add(match)
            match.keyword_score = match_data["keyword_score"]
            match.tfidf_score = match_data["tfidf_score"]
            match.final_score = match_data["final_score"]
            match.matched_skills = match_data["matched_skills"]
            match.missing_skills = match_data["missing_skills"]
            match.preferred_matched_skills = match_data["preferred_matched_skills"]
            match.score_explanation = match_data["score_explanation"]

            app.processing_status = "COMPLETED"
            updated_ids.append(app.application_id)

        # 6. Set job status back to Active
        vectorizer_cache.set_job_status(job_id, "Active")
        db.commit()
        return updated_ids

    except Exception as e:
        logger.exception("Error during rescore_job_applications for job %s: %s", job_id, e)
        db.rollback()
        try:
            from app.ml.vectorizer import vectorizer_cache
            vectorizer_cache.set_job_status(job_id, "Active")
        except Exception:
            pass
        return []
    finally:
        if should_close_db:
            db.close()
