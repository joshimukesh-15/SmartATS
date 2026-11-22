import logging
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Job, Application, Candidate
from app.core.config import settings
from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobResponse,
    JobQualityCheckRequest,
    JobQualityCheckResponse,
    JobWeightsUpdateRequest,
    PaginatedJobsResponse
)
from app.services.taxonomy import normalize_skill_name
from app.services.job_quality import check_job_description_quality
from app.services.scoring import rescore_job_applications
from app.ml.vectorizer import vectorizer_cache
from app.api.deps import get_current_recruiter

router = APIRouter(prefix="/jobs", tags=["Jobs"])
logger = logging.getLogger(__name__)


@router.post("/quality-check/", response_model=JobQualityCheckResponse)
def check_job_quality_endpoint(payload: JobQualityCheckRequest):
    """
    Evaluates job posting text for missing salary/location, vague requirements,
    and unnecessarily restrictive wording before or during creation.
    """
    result = check_job_description_quality(
        title=payload.title,
        description=payload.description,
        required_skills=payload.required_skills,
        preferred_skills=payload.preferred_skills
    )
    return JobQualityCheckResponse(**result)


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """Creates a new job opening with required and preferred skills."""
    # Normalize skill names
    normalized_req = [normalize_skill_name(s) for s in job_in.required_skills if s.strip()]
    normalized_pref = [normalize_skill_name(s) for s in job_in.preferred_skills if s.strip()]

    job = Job(
        title=job_in.title.strip(),
        description=job_in.description.strip(),
        required_skills=list(dict.fromkeys(normalized_req)),
        preferred_skills=list(dict.fromkeys(normalized_pref)),
        custom_weights=job_in.custom_weights
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    job_dict = JobResponse.model_validate(job)
    job_dict.application_count = 0
    job_dict.applications_count = 0
    job_dict.status = vectorizer_cache.get_job_status(job.job_id)
    return job_dict


@router.get("/", response_model=PaginatedJobsResponse)
def list_jobs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves paginated job openings with application counts."""
    if limit < 1 or limit > 200:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 200")

    total = db.query(func.count(Job.job_id)).scalar() or 0
    jobs = db.query(Job).order_by(Job.created_at.desc()).offset(offset).limit(limit).all()
    job_ids = [job.job_id for job in jobs]
    count_by_job = {}
    if job_ids:
        count_by_job = dict(
            db.query(Application.job_id, func.count(Application.application_id))
            .filter(Application.job_id.in_(job_ids))
            .group_by(Application.job_id)
            .all()
        )
    results = []
    for j in jobs:
        count = count_by_job.get(j.job_id, 0)
        j_resp = JobResponse.model_validate(j)
        j_resp.application_count = count
        j_resp.applications_count = count
        j_resp.status = vectorizer_cache.get_job_status(j.job_id)
        results.append(j_resp)
    return PaginatedJobsResponse(
        items=results,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{job_id}/quality-check/", response_model=JobQualityCheckResponse)
def get_existing_job_quality(job_id: int, db: Session = Depends(get_db)):
    """Performs a quality check on an existing job opening."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")

    result = check_job_description_quality(
        title=job.title,
        description=job.description,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or []
    )
    return JobQualityCheckResponse(**result)


@router.patch("/{job_id}/weights", response_model=JobResponse)
def update_job_weights(
    job_id: int,
    payload: JobWeightsUpdateRequest,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """
    Updates and persists the default scoring weights for a specific job opening:
    skills, text, experience, and education.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")

    total_weight = (
        payload.weight_skills
        + payload.weight_text
        + payload.weight_experience
        + payload.weight_education
    )
    if total_weight <= 0:
        raise HTTPException(status_code=400, detail="Weights must sum to greater than 0.")

    # Normalize weights so they sum to 1.0
    normalized_weights = {
        "weight_skills": round(payload.weight_skills / total_weight, 3),
        "weight_text": round(payload.weight_text / total_weight, 3),
        "weight_experience": round(payload.weight_experience / total_weight, 3),
        "weight_education": round(payload.weight_education / total_weight, 3),
    }

    job.custom_weights = normalized_weights
    db.commit()
    db.refresh(job)

    count = db.query(Application).filter(Application.job_id == job.job_id).count()
    resp = JobResponse.model_validate(job)
    resp.application_count = count
    resp.applications_count = count
    resp.status = vectorizer_cache.get_job_status(job.job_id)
    return resp


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Fetches details for a specific job opening."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")
    
    count = db.query(Application).filter(Application.job_id == job.job_id).count()
    resp = JobResponse.model_validate(job)
    resp.application_count = count
    resp.applications_count = count
    resp.status = vectorizer_cache.get_job_status(job.job_id)
    return resp


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """Updates an existing job opening."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")

    description_changed = (
        job_update.description is not None
        and job_update.description.strip() != job.description
    )

    if job_update.title is not None:
        job.title = job_update.title.strip()
    if job_update.description is not None:
        job.description = job_update.description.strip()
    if job_update.required_skills is not None:
        job.required_skills = list(dict.fromkeys(
            [normalize_skill_name(s) for s in job_update.required_skills if s.strip()]
        ))
    if job_update.preferred_skills is not None:
        job.preferred_skills = list(dict.fromkeys(
            [normalize_skill_name(s) for s in job_update.preferred_skills if s.strip()]
        ))
    if job_update.custom_weights is not None:
        job.custom_weights = job_update.custom_weights

    db.commit()
    db.refresh(job)

    if description_changed or job_update.description is not None:
        # Invalidate cached vectorizer, increment version, set status to Re-scoring
        vectorizer_cache.increment_version(job.job_id)
        vectorizer_cache.set_job_status(job.job_id, "Re-scoring")
        db.query(Application).filter(
            Application.job_id == job.job_id,
            Application.processing_status != "FAILED"
        ).update({"processing_status": "Re-scoring"})
        db.commit()

        if background_tasks:
            background_tasks.add_task(rescore_job_applications, job.job_id)
        else:
            rescore_job_applications(job.job_id)

    count = db.query(Application).filter(Application.job_id == job.job_id).count()
    resp = JobResponse.model_validate(job)
    resp.application_count = count
    resp.applications_count = count
    resp.status = vectorizer_cache.get_job_status(job.job_id)
    return resp


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """Deletes a job opening and its associated applications and match results."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")
    applications = list(job.applications)
    resume_paths = [application.resume_path for application in applications if application.resume_path]
    candidate_ids = {application.candidate_id for application in applications}

    try:
        db.delete(job)
        db.flush()

        # Keep shared candidate profiles used by other openings, but remove PII
        # for candidates whose final application was deleted with this job.
        if candidate_ids:
            remaining_candidate_ids = {
                row[0]
                for row in db.query(Application.candidate_id)
                .filter(Application.candidate_id.in_(candidate_ids))
                .distinct()
                .all()
            }
            orphaned_ids = candidate_ids - remaining_candidate_ids
            if orphaned_ids:
                db.query(Candidate).filter(Candidate.candidate_id.in_(orphaned_ids)).delete(synchronize_session=False)
        db.commit()
    except Exception:
        db.rollback()
        raise

    upload_root = Path(settings.UPLOAD_DIR).resolve()
    for resume_path in resume_paths:
        try:
            stored_file = Path(resume_path).resolve()
            if stored_file.is_relative_to(upload_root) and stored_file.is_file():
                stored_file.unlink()
            elif stored_file.exists():
                logger.warning("Skipped resume cleanup outside upload directory: %s", stored_file)
        except OSError:
            logger.exception("Could not remove stored resume for deleted job %s", job_id)
    return None
