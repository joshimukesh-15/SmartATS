from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Query
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
from app.schemas.analytics import (
    OverviewAnalyticsResponse,
    OverviewTotals,
    ScoreHistogramBucket,
    TopCandidateItem
)
from app.schemas.application import ReviewStage, CANONICAL_STAGES
from app.services.ranking import get_job_rankings
from app.services.comparison import compare_candidates_service
from app.services.scoring import attach_scoring_to_application
from app.utils.exporters import export_rankings_to_csv
from app.api.deps import get_current_recruiter

router = APIRouter(tags=["Screening, Matching & Analytics"])

STAGE_CANONICAL_MAP = {stage.value.lower(): stage.value for stage in ReviewStage}


@router.get("/jobs/{job_id}/rankings/", response_model=JobRankingsResponse)
def get_job_rankings_endpoint(
    job_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    w_skills: Optional[float] = Query(None, ge=0.0, le=1.0),
    w_text: Optional[float] = Query(None, ge=0.0, le=1.0),
    w_exp: Optional[float] = Query(None, ge=0.0, le=1.0),
    w_edu: Optional[float] = Query(None, ge=0.0, le=1.0)
):
    """
    Returns ranked candidates for a specific job with complete score breakdowns,
    formula justifications, matched/missing skill lists, equivalent skill credits,
    and dynamically adjustable scoring weights.
    """
    if limit < 1 or limit > 200:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 200")

    for w_val, w_label in [(w_skills, "w_skills"), (w_text, "w_text"), (w_exp, "w_exp"), (w_edu, "w_edu")]:
        if w_val is not None and (w_val < 0.0 or w_val > 1.0):
            raise HTTPException(status_code=422, detail=f"{w_label} must be between 0.0 and 1.0")

    provided = [w for w in (w_skills, w_text, w_exp, w_edu) if w is not None]
    if len(provided) == 4 and sum(provided) == 0.0:
        raise HTTPException(status_code=422, detail="Weights cannot all be zero.")

    try:
        return get_job_rankings(
            db=db,
            job_id=job_id,
            w_skills=w_skills,
            w_text=w_text,
            w_exp=w_exp,
            w_edu=w_edu,
            limit=limit,
            offset=offset
        )
    except ValueError as e:
        if "Weights cannot all be zero" in str(e):
            raise HTTPException(status_code=422, detail=str(e))
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/applications/{application_id}/match/", response_model=MatchResultResponse)
def get_application_match_endpoint(application_id: int, db: Session = Depends(get_db)):
    """Retrieves detailed explainable match results for a single application."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    if not app.match_result:
        raise HTTPException(status_code=400, detail="Match result not yet computed for this application.")
    job = app.job or db.query(Job).filter(Job.job_id == app.job_id).first()
    attach_scoring_to_application(app, job=job, db=db)
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


@router.get("/analytics/overview", response_model=OverviewAnalyticsResponse)
def get_platform_overview_analytics(db: Session = Depends(get_db)):
    """Returns platform overview analytics adhering to the unified metrics contract."""
    from app.api.resumes import STAGE_CANONICAL_MAP

    total_jobs = db.query(Job).count()
    total_candidates = db.query(Candidate).count()
    total_applications = db.query(Application).count()

    status_counts = dict(
        db.query(Application.processing_status, func.count(Application.application_id))
        .group_by(Application.processing_status)
        .all()
    )

    completed_count = status_counts.get("COMPLETED", 0)
    pending_count = (
        status_counts.get("PENDING", 0)
        + status_counts.get("PROCESSING", 0)
        + status_counts.get("Re-scoring", 0)
    )
    failed_count = status_counts.get("FAILED", 0)

    # Count duplicates blocked from one source only: the status history audit events
    duplicates_blocked = (
        db.query(ApplicationStatusHistory)
        .filter(ApplicationStatusHistory.note.like("%Duplicate resume upload%"))
        .count()
    )

    # Completed match results scores for average and 6 non-overlapping histogram buckets
    completed_match_scores = [
        round(m[0], 1)
        for m in (
            db.query(MatchResult.final_score)
            .join(Application, MatchResult.application_id == Application.application_id)
            .filter(
                Application.processing_status == "COMPLETED",
                MatchResult.final_score.isnot(None)
            )
            .all()
        )
    ]

    total_evals = len(completed_match_scores)
    average_score = round(sum(completed_match_scores) / total_evals, 1) if total_evals > 0 else 0.0

    # 6 non-overlapping histogram buckets: 0-49, 50-59, 60-69, 70-79, 80-89, 90-100
    # Sum of counts equals total number of match results
    b0 = len([s for s in completed_match_scores if s < 50.0])
    b1 = len([s for s in completed_match_scores if 50.0 <= s < 60.0])
    b2 = len([s for s in completed_match_scores if 60.0 <= s < 70.0])
    b3 = len([s for s in completed_match_scores if 70.0 <= s < 80.0])
    b4 = len([s for s in completed_match_scores if 80.0 <= s < 90.0])
    b5 = len([s for s in completed_match_scores if s >= 90.0])

    score_histogram = [
        ScoreHistogramBucket(label="0–49%", min=0.0, max=49.99, count=b0),
        ScoreHistogramBucket(label="50–59%", min=50.0, max=59.99, count=b1),
        ScoreHistogramBucket(label="60–69%", min=60.0, max=69.99, count=b2),
        ScoreHistogramBucket(label="70–79%", min=70.0, max=79.99, count=b3),
        ScoreHistogramBucket(label="80–89%", min=80.0, max=89.99, count=b4),
        ScoreHistogramBucket(label="90–100%", min=90.0, max=100.0, count=b5),
    ]

    # Stage distribution over canonical stages
    stage_counts_raw = dict(
        db.query(Application.review_stage, func.count(Application.application_id))
        .group_by(Application.review_stage)
        .all()
    )

    stage_distribution: Dict[str, int] = {
        ReviewStage.NEW.value: 0,
        ReviewStage.REVIEWING.value: 0,
        ReviewStage.INTERVIEWING.value: 0,
        ReviewStage.OFFER.value: 0,
        ReviewStage.HIRED.value: 0,
        ReviewStage.REJECTED.value: 0,
    }

    for raw_stage, count in stage_counts_raw.items():
        canonical = STAGE_CANONICAL_MAP.get(raw_stage.lower() if raw_stage else "new", ReviewStage.NEW.value)
        stage_distribution[canonical] = stage_distribution.get(canonical, 0) + count

    # Top candidates across ALL jobs (top 5 by final score)
    top_apps = (
        db.query(Application)
        .join(MatchResult, Application.application_id == MatchResult.application_id)
        .join(Job, Application.job_id == Job.job_id)
        .outerjoin(Candidate, Application.candidate_id == Candidate.candidate_id)
        .filter(Application.processing_status == "COMPLETED")
        .order_by(MatchResult.final_score.desc(), Application.applied_at.desc())
        .limit(5)
        .all()
    )

    top_candidates: List[TopCandidateItem] = []
    for app in top_apps:
        cand_name = app.candidate.name if app.candidate and app.candidate.name else "Candidate"
        job_title = app.job.title if app.job and app.job.title else "Position"
        stage = STAGE_CANONICAL_MAP.get(app.review_stage.lower() if app.review_stage else "new", ReviewStage.NEW.value)
        score = round(app.match_result.final_score, 1) if app.match_result else 0.0
        top_candidates.append(
            TopCandidateItem(
                application_id=app.application_id,
                name=cand_name,
                job_title=job_title,
                stage=stage,
                final_score=score
            )
        )

    return OverviewAnalyticsResponse(
        totals=OverviewTotals(
            jobs=total_jobs,
            active_jobs=total_jobs,
            candidates=total_candidates,
            applications=total_applications,
            completed=completed_count,
            pending=pending_count,
            failed=failed_count,
            duplicates_blocked=duplicates_blocked
        ),
        average_score=average_score,
        score_histogram=score_histogram,
        stage_distribution=stage_distribution,
        top_candidates=top_candidates
    )


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

    job_stage_counts = {s.value: 0 for s in ReviewStage}
    for a in apps:
        st = a.review_stage or ReviewStage.NEW.value
        canonical = STAGE_CANONICAL_MAP.get(st.lower(), ReviewStage.NEW.value)
        job_stage_counts[canonical] = job_stage_counts.get(canonical, 0) + 1

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
