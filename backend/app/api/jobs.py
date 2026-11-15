from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Job, Application
from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobResponse,
    JobQualityCheckRequest,
    JobQualityCheckResponse,
    JobWeightsUpdateRequest
)
from app.services.taxonomy import normalize_skill_name
from app.services.job_quality import check_job_description_quality
from app.api.deps import get_current_recruiter

router = APIRouter(prefix="/jobs", tags=["Jobs"])


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
    return job_dict


@router.get("/", response_model=List[JobResponse])
def list_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves all job openings with application counts."""
    jobs = db.query(Job).order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for j in jobs:
        count = db.query(Application).filter(Application.job_id == j.job_id).count()
        j_resp = JobResponse.model_validate(j)
        j_resp.application_count = count
        j_resp.applications_count = count
        results.append(j_resp)
    return results


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
    return resp


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """Updates an existing job opening."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")

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

    count = db.query(Application).filter(Application.job_id == job.job_id).count()
    resp = JobResponse.model_validate(job)
    resp.application_count = count
    resp.applications_count = count
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
    db.delete(job)
    db.commit()
    return None
