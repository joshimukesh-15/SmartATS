from typing import List, Dict
from sqlalchemy.orm import Session
from app.database.models import Application, Job, MatchResult, Candidate
from app.schemas.match import (
    CandidateCompareResponse,
    CandidateCompareItem
)
from app.services.taxonomy import normalize_skill_name


def compare_candidates_service(
    db: Session,
    job_id: int,
    application_ids: List[int]
) -> CandidateCompareResponse:
    """
    Compares 2 to 5 candidates side-by-side:
    - Normalizes requirements and candidate extracted skills.
    - Generates unified comparison matrix across skills.
    - Finds common matched skills.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise ValueError(f"Job with ID {job_id} not found.")

    applications = (
        db.query(Application)
        .filter(
            Application.job_id == job_id,
            Application.application_id.in_(application_ids)
        )
        .all()
    )

    if not applications:
        raise ValueError("No matching applications found for comparison.")

    candidates_list: List[CandidateCompareItem] = []
    all_matched_sets = []

    for app in applications:
        cand = app.candidate
        match = app.match_result
        name = cand.name if cand and cand.name else f"Candidate #{app.candidate_id}"

        matched_skills = match.matched_skills if match else []
        missing_skills = match.missing_skills if match else []
        pref_skills = match.preferred_matched_skills if match else []
        final_score = match.final_score if match else 0.0
        kw_score = match.keyword_score if match else 0.0
        tfidf_score = match.tfidf_score if match else 0.0
        total_extracted = len(cand.extracted_skills) if cand and cand.extracted_skills else 0

        candidates_list.append(
            CandidateCompareItem(
                application_id=app.application_id,
                candidate_id=app.candidate_id,
                candidate_name=name,
                review_stage=app.review_stage or "New",
                final_score=final_score,
                keyword_score=kw_score,
                tfidf_score=tfidf_score,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                preferred_matched_skills=pref_skills,
                total_extracted_skills=total_extracted,
                applied_at=app.applied_at
            )
        )
        all_matched_sets.append(set(matched_skills))

    # Common matched skills (intersection)
    common_matched = list(set.intersection(*all_matched_sets)) if all_matched_sets else []

    # Skill matrix for all required and preferred skills
    skill_matrix: Dict[str, Dict[str, bool]] = {}
    all_job_skills = list(dict.fromkeys(job.required_skills + job.preferred_skills))

    for skill in all_job_skills:
        norm_skill = normalize_skill_name(skill)
        skill_matrix[norm_skill] = {}
        for c in candidates_list:
            has_skill = norm_skill in c.matched_skills or norm_skill in c.preferred_matched_skills
            skill_matrix[norm_skill][c.candidate_name] = has_skill

    return CandidateCompareResponse(
        job_id=job.job_id,
        job_title=job.title,
        required_skills=job.required_skills,
        preferred_skills=job.preferred_skills,
        candidates=candidates_list,
        common_matched_skills=sorted(common_matched),
        skill_matrix=skill_matrix
    )
