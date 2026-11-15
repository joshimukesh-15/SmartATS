from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import Application, MatchResult, Candidate, Job
from app.schemas.match import RankingItem, JobRankingsResponse
from app.schemas.application import ApplicationNoteResponse, ApplicationStatusHistoryResponse
from app.services.taxonomy import get_equivalent_skill_match
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


def get_job_rankings(
    db: Session,
    job_id: int,
    w_skills: Optional[float] = None,
    w_text: Optional[float] = None,
    w_exp: Optional[float] = None,
    w_edu: Optional[float] = None
) -> JobRankingsResponse:
    """
    Fetches and ranks all candidates who applied to a specific job opening.
    Recognizes candidate experience, seniority, education credentials, and equivalent skills.
    Applies configurable recruiter scoring weights dynamically.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise ValueError(f"Job with ID {job_id} not found.")

    # Determine Active Weights (priority: query params -> job.custom_weights -> balanced defaults)
    job_weights = job.custom_weights or {}
    
    raw_w_skills = w_skills if w_skills is not None else job_weights.get("weight_skills", 0.40)
    raw_w_text = w_text if w_text is not None else job_weights.get("weight_text", 0.20)
    raw_w_exp = w_exp if w_exp is not None else job_weights.get("weight_experience", 0.25)
    raw_w_edu = w_edu if w_edu is not None else job_weights.get("weight_education", 0.15)

    total_w = max(0.01, raw_w_skills + raw_w_text + raw_w_exp + raw_w_edu)
    norm_w_skills = round(raw_w_skills / total_w, 3)
    norm_w_text = round(raw_w_text / total_w, 3)
    norm_w_exp = round(raw_w_exp / total_w, 3)
    norm_w_edu = round(raw_w_edu / total_w, 3)

    applied_weights = {
        "weight_skills": norm_w_skills,
        "weight_text": norm_w_text,
        "weight_experience": norm_w_exp,
        "weight_education": norm_w_edu,
    }

    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .all()
    )

    ranking_items: List[RankingItem] = []
    processed_count = 0

    for app in applications:
        match = app.match_result
        cand = app.candidate

        base_final = match.final_score if match else 0.0
        tfidf_score = match.tfidf_score if match else 0.0
        matched_skills = match.matched_skills if match else []
        missing_skills = match.missing_skills if match else []
        pref_skills = match.preferred_matched_skills if match else []
        explanation = match.score_explanation if match else None

        if app.processing_status == "COMPLETED":
            processed_count += 1

        raw_resume = cand.raw_text if cand and cand.raw_text else ""
        
        # 1. Experience & Seniority
        exp_years = extract_experience_years(raw_resume)
        seniority = extract_seniority_level(raw_resume, exp_years)
        exp_score = compute_experience_score(exp_years, seniority, job.description)

        # 2. Education
        edu_data = extract_education(raw_resume)
        edu_score = compute_education_score(edu_data, job.description)

        # 3. Equivalent Skills Mapping & Candidate Skill Fallback
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

        eq_skills = {}
        for req in (job.required_skills or []):
            if req not in matched_skills:
                eq = get_equivalent_skill_match(req, cand_all_skills)
                if eq:
                    eq_skills[req] = eq

        # 4. Refined Skills Score (incorporating 75% equivalent skill credit)
        effective_kw_score = compute_keyword_score(
            matched_count=len(matched_skills),
            total_required=len(job.required_skills or []),
            equivalent_count=len(eq_skills)
        )

        # 5. Composite Final Score using configured weights
        calculated_composite = round(
            (norm_w_skills * effective_kw_score)
            + (norm_w_text * tfidf_score)
            + (norm_w_exp * exp_score)
            + (norm_w_edu * edu_score),
            2
        )
        calculated_composite = max(0.0, min(100.0, calculated_composite))

        if match and app.processing_status == "COMPLETED":
            final_score = calculated_composite
        elif calculated_composite > 0:
            final_score = calculated_composite
        else:
            final_score = base_final

        notes_data = [ApplicationNoteResponse.model_validate(n) for n in (app.notes or [])]
        history_data = [ApplicationStatusHistoryResponse.model_validate(h) for h in (app.status_history or [])]

        score_breakdown = {
            "skills": effective_kw_score,
            "text": tfidf_score,
            "experience": exp_score,
            "education": edu_score,
            "weight_skills": norm_w_skills,
            "weight_text": norm_w_text,
            "weight_experience": norm_w_exp,
            "weight_education": norm_w_edu,
        }

        ranking_items.append(
            RankingItem(
                rank=0,  # assigned after sorting
                application_id=app.application_id,
                candidate_id=app.candidate_id,
                candidate_name=cand.name if cand and cand.name else "Unknown Candidate",
                candidate_email=cand.email if cand else None,
                candidate_phone=cand.phone if cand else None,
                processing_status=app.processing_status,
                review_stage=app.review_stage or "New",
                final_score=final_score,
                keyword_score=effective_kw_score,
                tfidf_score=tfidf_score,
                experience_score=exp_score,
                education_score=edu_score,
                experience_years=exp_years,
                seniority_level=seniority,
                education_level=edu_data.get("degree", "Unspecified"),
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                equivalent_skills=eq_skills,
                preferred_matched_skills=pref_skills,
                score_breakdown=score_breakdown,
                score_explanation=explanation,
                notes=notes_data,
                status_history=history_data,
                applied_at=app.applied_at
            )
        )

    # Sort descending by final_score, then keyword_score
    ranking_items.sort(key=lambda x: (x.final_score, x.keyword_score, x.tfidf_score), reverse=True)

    # Assign 1-based ranks
    for idx, item in enumerate(ranking_items, start=1):
        item.rank = idx

    return JobRankingsResponse(
        job_id=job.job_id,
        job_title=job.title,
        total_candidates=len(ranking_items),
        processed_count=processed_count,
        weights_applied=applied_weights,
        rankings=ranking_items
    )
