from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from app.database.models import Application, Job
from app.schemas.match import RankingItem, JobRankingsResponse
from app.services.scoring import resolve_scoring_weights, evaluate_application_scoring


def get_job_rankings(
    db: Session,
    job_id: int,
    w_skills: Optional[float] = None,
    w_text: Optional[float] = None,
    w_exp: Optional[float] = None,
    w_edu: Optional[float] = None,
    limit: int = 50,
    offset: int = 0
) -> JobRankingsResponse:
    """
    Fetches and ranks all candidates who applied to a specific job opening.
    Recognizes candidate experience, seniority, education credentials, and equivalent skills.
    Applies configurable recruiter scoring weights dynamically.
    Loads related candidate, match_result, notes, and status_history using selectinload
    to guarantee fixed O(1) query count regardless of candidate count.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise ValueError(f"Job with ID {job_id} not found.")

    applied_weights = resolve_scoring_weights(
        job_custom_weights=job.custom_weights,
        w_skills=w_skills,
        w_text=w_text,
        w_exp=w_exp,
        w_edu=w_edu
    )

    applications = (
        db.query(Application)
        .options(
            selectinload(Application.candidate),
            selectinload(Application.match_result),
            selectinload(Application.notes),
            selectinload(Application.status_history)
        )
        .filter(Application.job_id == job_id)
        .all()
    )

    ranking_items: List[RankingItem] = []
    processed_count = 0
    evaluated_app_ids = set()

    for app in applications:
        cand = app.candidate
        eval_res = evaluate_application_scoring(app, job, applied_weights)

        if eval_res["is_completed"]:
            processed_count += 1
            evaluated_app_ids.add(app.application_id)

        notes = app.notes or []
        notes_count = len(notes)
        last_note_at = max((n.created_at for n in notes if n.created_at), default=None) if notes else None

        history = app.status_history or []
        last_stage_change_at = max((h.created_at for h in history if h.created_at), default=None) if history else None

        ranking_items.append(
            RankingItem(
                rank=0,  # assigned after sorting
                application_id=app.application_id,
                candidate_id=app.candidate_id,
                candidate_name=cand.name if cand and cand.name else "Unknown Candidate",
                candidate_email=cand.email if cand else None,
                candidate_phone=cand.phone if cand else None,
                processing_status=app.processing_status or "PENDING",
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
                notes_count=notes_count,
                last_note_at=last_note_at,
                last_stage_change_at=last_stage_change_at,
                applied_at=app.applied_at
            )
        )

    # Sort descending:
    # 1. Successfully evaluated COMPLETED applications first (1 vs 0)
    # 2. final_score descending
    # 3. keyword_score descending
    # 4. tfidf_score descending
    # 5. applied_at descending
    ranking_items.sort(
        key=lambda x: (
            1 if x.application_id in evaluated_app_ids else 0,
            x.final_score,
            x.keyword_score,
            x.tfidf_score,
            x.applied_at.timestamp() if x.applied_at else 0.0
        ),
        reverse=True
    )

    # Assign 1-based ranks
    for idx, item in enumerate(ranking_items, start=1):
        item.rank = idx

    total_candidates = len(ranking_items)
    paginated_items = ranking_items[offset : offset + limit]

    return JobRankingsResponse(
        job_id=job.job_id,
        job_title=job.title,
        total_candidates=total_candidates,
        processed_count=processed_count,
        weights_applied=applied_weights,
        rankings=paginated_items,
        items=paginated_items,
        total=total_candidates,
        limit=limit,
        offset=offset
    )
