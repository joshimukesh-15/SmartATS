from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Job, Application
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.services.taxonomy import normalize_skill_name

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """Creates a new job opening with required and preferred skills."""
    # Normalize skill names
    normalized_req = [normalize_skill_name(s) for s in job_in.required_skills if s.strip()]
    normalized_pref = [normalize_skill_name(s) for s in job_in.preferred_skills if s.strip()]

    job = Job(
        title=job_in.title.strip(),
        description=job_in.description.strip(),
        required_skills=list(dict.fromkeys(normalized_req)),
        preferred_skills=list(dict.fromkeys(normalized_pref))
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    job_dict = JobResponse.model_validate(job)
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
        j_resp.applications_count = count
        results.append(j_resp)
    return results


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Fetches details for a specific job opening."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")
    
    count = db.query(Application).filter(Application.job_id == job.job_id).count()
    resp = JobResponse.model_validate(job)
    resp.applications_count = count
    return resp


@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_update: JobUpdate, db: Session = Depends(get_db)):
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

    db.commit()
    db.refresh(job)

    count = db.query(Application).filter(Application.job_id == job.job_id).count()
    resp = JobResponse.model_validate(job)
    resp.applications_count = count
    return resp


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Deletes a job opening and its associated applications and match results."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")
    db.delete(job)
    db.commit()
    return None
