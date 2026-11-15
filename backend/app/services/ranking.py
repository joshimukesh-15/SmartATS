from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database.models import Application, MatchResult, Candidate, Job
from app.schemas.match import RankingItem, JobRankingsResponse


def get_job_rankings(db: Session, job_id: int) -> JobRankingsResponse:
    """
    Fetches and ranks all candidates who applied to a specific job opening.
    Orders by final_score descending, assigning sequential rank positions.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise ValueError(f"Job with ID {job_id} not found.")

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

        final_score = match.final_score if match else 0.0
        keyword_score = match.keyword_score if match else 0.0
        tfidf_score = match.tfidf_score if match else 0.0
        matched_skills = match.matched_skills if match else []
        missing_skills = match.missing_skills if match else []
        pref_skills = match.preferred_matched_skills if match else []
        explanation = match.score_explanation if match else None

        if app.processing_status == "COMPLETED":
            processed_count += 1

        ranking_items.append(
            RankingItem(
                rank=0,  # assigned after sorting
                application_id=app.application_id,
                candidate_id=app.candidate_id,
                candidate_name=cand.name if cand and cand.name else "Unknown Candidate",
                candidate_email=cand.email if cand else None,
                candidate_phone=cand.phone if cand else None,
                processing_status=app.processing_status,
                final_score=final_score,
                keyword_score=keyword_score,
                tfidf_score=tfidf_score,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                preferred_matched_skills=pref_skills,
                score_explanation=explanation,
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
        rankings=ranking_items
    )
