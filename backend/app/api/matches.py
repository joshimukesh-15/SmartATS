from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.database.models import Job, Application, Candidate, MatchResult, ApplicationStatusHistory
from app.schemas.match import (
    JobRankingsResponse,
    MatchResultResponse,
    CandidateCompareRequest,
    CandidateCompareResponse
)
from app.services.ranking import get_job_rankings
from app.services.comparison import compare_candidates_service
from app.utils.exporters import export_rankings_to_csv
from app.api.deps import get_current_recruiter

router = APIRouter(tags=["Screening, Matching & Analytics"])


@router.get("/jobs/{job_id}/rankings/", response_model=JobRankingsResponse)
def get_job_rankings_endpoint(
    job_id: int,
    db: Session = Depends(get_db),
    w_skills: Optional[float] = None,
    w_text: Optional[float] = None,
    w_exp: Optional[float] = None,
    w_edu: Optional[float] = None
):
    """
    Returns ranked candidates for a specific job with complete score breakdowns,
    formula justifications, matched/missing skill lists, equivalent skill credits,
    and dynamically adjustable scoring weights.
    """
    try:
        return get_job_rankings(
            db=db,
            job_id=job_id,
            w_skills=w_skills,
            w_text=w_text,
            w_exp=w_exp,
            w_edu=w_edu
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/applications/{application_id}/match/", response_model=MatchResultResponse)
def get_application_match_endpoint(application_id: int, db: Session = Depends(get_db)):
    """Retrieves detailed explainable match results for a single application."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    if not app.match_result:
        raise HTTPException(status_code=400, detail="Match result not yet computed for this application.")
    return app.match_result


@router.post("/jobs/{job_id}/compare/", response_model=CandidateCompareResponse)
def compare_candidates_endpoint(
    job_id: int,
    req: CandidateCompareRequest,
    db: Session = Depends(get_db)
):
    """
    Compares 2 to 5 candidates side-by-side:
    - Score breakdown (Final, Keyword, TF-IDF)
    - Common matched skills
    - Visual skill matrix across required & preferred skills
    """
    try:
        return compare_candidates_service(db, job_id, req.application_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/jobs/{job_id}/export/csv")
def export_job_rankings_csv(
    job_id: int,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """Generates and downloads a CSV spreadsheet of the job candidate leaderboard."""
    try:
        rankings_data = get_job_rankings(db, job_id)
        csv_content = export_rankings_to_csv(rankings_data.job_title, rankings_data.rankings)
        
        filename = f"SmartATS_Job_{job_id}_Rankings.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/analytics/overview")
def get_platform_overview_analytics(db: Session = Depends(get_db)):
    """Returns system-wide metrics and distributions for recruiter dashboard."""
    total_jobs = db.query(Job).count()
    total_candidates = db.query(Candidate).count()
    total_applications = db.query(Application).count()

    status_counts = dict(
        db.query(Application.processing_status, func.count(Application.application_id))
        .group_by(Application.processing_status)
        .all()
    )

    # Score distribution for completed matches
    all_scores = [
        m[0] for m in db.query(MatchResult.final_score).all() if m[0] is not None
    ]
    
    score_ranges = {
        "80-100%": len([s for s in all_scores if s >= 80]),
        "60-79%": len([s for s in all_scores if 60 <= s < 80]),
        "<60%": len([s for s in all_scores if s < 60]),
        "90-100%": len([s for s in all_scores if s >= 90]),
        "75-89%": len([s for s in all_scores if 75 <= s < 90]),
        "50-74%": len([s for s in all_scores if 50 <= s < 75]),
        "<50%": len([s for s in all_scores if s < 50])
    }

    stage_counts_raw = dict(
        db.query(Application.review_stage, func.count(Application.application_id))
        .group_by(Application.review_stage)
        .all()
    )
    stage_counts = {
        "New": stage_counts_raw.get("New", 0),
        "Reviewing": stage_counts_raw.get("Reviewing", 0),
        "Interview": stage_counts_raw.get("Interview", 0),
        "Hired": stage_counts_raw.get("Hired", 0),
        "Rejected": stage_counts_raw.get("Rejected", 0)
    }

    avg_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0.0

    # Duplicate counts include any explicit DUPLICATE application records plus tracked duplicate upload events
    overview_dup_events = (
        db.query(ApplicationStatusHistory)
        .filter(ApplicationStatusHistory.note.like("%Duplicate resume upload%"))
        .count()
    )
    total_duplicates = status_counts.get("DUPLICATE", 0) + overview_dup_events

    return {
        "total_jobs": total_jobs,
        "total_candidates": total_candidates,
        "total_applications": total_applications,
        "processed_resumes": status_counts.get("COMPLETED", 0),
        "pending_resumes": status_counts.get("PENDING", 0) + status_counts.get("PROCESSING", 0),
        "failed_resumes": status_counts.get("FAILED", 0),
        "duplicate_resumes": total_duplicates,
        "duplicate_count": total_duplicates,
        "average_score": avg_score,
        "avg_final_score": avg_score,
        "score_distribution": score_ranges,
        "score_buckets": {
            "80-100%": len([s for s in all_scores if s >= 80]),
            "60-79%": len([s for s in all_scores if 60 <= s < 80]),
            "40-59%": len([s for s in all_scores if 40 <= s < 60]),
            "<40%": len([s for s in all_scores if s < 40]),
            "<60%": len([s for s in all_scores if s < 60])
        },
        "stage_distribution": stage_counts
    }


@router.get("/jobs/{job_id}/analytics")
def get_job_specific_analytics(job_id: int, db: Session = Depends(get_db)):
    """Returns analytics specific to a job opening."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    apps = db.query(Application).filter(Application.job_id == job_id).all()
    matches = [a.match_result for a in apps if a.match_result]

    scores = [m.final_score for m in matches]
    
    # Missing skills aggregation
    missing_freq: Dict[str, int] = {}
    matched_freq: Dict[str, int] = {}

    for m in matches:
        for sk in m.missing_skills:
            missing_freq[sk] = missing_freq.get(sk, 0) + 1
        for sk in m.matched_skills:
            matched_freq[sk] = matched_freq.get(sk, 0) + 1

    job_stage_counts = {
        "New": 0, "Reviewing": 0, "Interview": 0, "Hired": 0, "Rejected": 0
    }
    for a in apps:
        st = a.review_stage or "New"
        job_stage_counts[st] = job_stage_counts.get(st, 0) + 1

    app_ids = [a.application_id for a in apps]
    duplicate_events = 0
    if app_ids:
        duplicate_events = (
            db.query(ApplicationStatusHistory)
            .filter(
                ApplicationStatusHistory.application_id.in_(app_ids),
                ApplicationStatusHistory.note.like("%Duplicate resume upload%")
            )
            .count()
        )
    duplicate_count = sum(1 for a in apps if a.processing_status == "DUPLICATE") + duplicate_events
    keyword_scores = [m.keyword_score for m in matches if m.keyword_score is not None]
    avg_keyword_score = round(sum(keyword_scores) / len(keyword_scores), 1) if keyword_scores else 0.0
    avg_final = round(sum(scores) / len(scores), 1) if scores else 0.0

    return {
        "job_id": job.job_id,
        "job_title": job.title,
        "total_applications": len(apps),
        "total_processed": len(matches),
        "average_final_score": avg_final,
        "avg_final_score": avg_final,
        "average_keyword_score": avg_keyword_score,
        "avg_keyword_score": avg_keyword_score,
        "duplicate_count": duplicate_count,
        "stage_distribution": job_stage_counts,
        "score_buckets": {
            "80-100%": len([s for s in scores if s >= 80]),
            "60-79%": len([s for s in scores if 60 <= s < 80]),
            "40-59%": len([s for s in scores if 40 <= s < 60]),
            "<40%": len([s for s in scores if s < 40])
        },
        "most_common_matched_skills": sorted(
            [{"skill": k, "count": v} for k, v in matched_freq.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10],
        "most_frequently_missing_skills": sorted(
            [{"skill": k, "count": v} for k, v in missing_freq.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]
    }
