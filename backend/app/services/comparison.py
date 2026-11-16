from typing import List, Dict
from sqlalchemy.orm import Session
from app.database.models import Application, Job, MatchResult, Candidate
from app.schemas.match import (
    CandidateCompareResponse,
    CandidateCompareItem
)
from app.services.taxonomy import normalize_skill_name
from app.services.scoring import resolve_scoring_weights, evaluate_application_scoring


def compare_candidates_service(
    db: Session,
    job_id: int,
    application_ids: List[int]
) -> CandidateCompareResponse:
    """
    Compares 2 to 5 candidates side-by-side:
    - Uses identical scoring formula and weights as the Leaderboard.
    - Generates unified comparison matrix across skills with equivalent skill awareness.
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

    # Shared recruiter weights configuration
    applied_weights = resolve_scoring_weights(job_custom_weights=job.custom_weights)

    candidates_list: List[CandidateCompareItem] = []
    all_matched_sets = []

    for app in applications:
        cand = app.candidate
        name = cand.name if cand and cand.name else f"Candidate #{app.candidate_id}"
        eval_res = evaluate_application_scoring(app, job, applied_weights)

        candidates_list.append(
            CandidateCompareItem(
                application_id=app.application_id,
                candidate_id=app.candidate_id,
                candidate_name=name,
                review_stage=app.review_stage or "New",
                final_score=eval_res["final_score"],
                keyword_score=eval_res["keyword_score"],
                tfidf_score=eval_res["tfidf_score"],
                experience_score=eval_res["experience_score"],
                education_score=eval_res["education_score"],
                experience_years=eval_res["experience_years"],
                seniority_level=eval_res["seniority_level"],
                education_level=eval_res["education_level"],
                matched_skills=eval_res["matched_skills"],
                missing_skills=eval_res["missing_skills"],
                equivalent_skills=eval_res["equivalent_skills"],
                preferred_matched_skills=eval_res["preferred_matched_skills"],
                weights=eval_res["weights"],
                components=eval_res["components"],
                score_breakdown=eval_res["score_breakdown"],
                score_explanation=eval_res["score_explanation"],
                total_extracted_skills=len(cand.extracted_skills) if cand and cand.extracted_skills else 0,
                applied_at=app.applied_at
            )
        )
        all_matched_sets.append(set(eval_res["matched_skills"]))

    # Common matched skills (intersection)
    common_matched = list(set.intersection(*all_matched_sets)) if all_matched_sets else []

    # Skill matrix for all required and preferred skills
    skill_matrix: Dict[str, Dict[str, bool]] = {}
    all_job_skills = list(dict.fromkeys(job.required_skills + job.preferred_skills))

    for skill in all_job_skills:
        norm_skill = normalize_skill_name(skill)
        skill_matrix[norm_skill] = {}
        for c in candidates_list:
            has_skill = (
                any(norm_skill.lower() == s.lower() for s in c.matched_skills)
                or any(norm_skill.lower() == s.lower() for s in c.preferred_matched_skills)
                or norm_skill in c.equivalent_skills
            )
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
