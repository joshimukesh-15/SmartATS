import os
import aiofiles
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Job, Application, Candidate
from app.schemas.application import ApplicationResponse, ApplicationUploadResult
from app.core.config import settings
from app.core.security import sanitize_filename, validate_file_extension
from app.services.duplicate import calculate_bytes_hash, check_duplicate_application
from app.services.processor import process_resume_application

router = APIRouter(tags=["Resumes & Applications"])


@router.post("/jobs/{job_id}/upload-resumes/", response_model=List[ApplicationUploadResult], status_code=status.HTTP_202_ACCEPTED)
async def upload_resumes(
    job_id: int,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts multiple PDF or DOCX resume files for a job.
    Performs duplicate detection via SHA-256 binary hash.
    Enqueues non-duplicate resumes for background parsing and hybrid matching.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")

    results: List[ApplicationUploadResult] = []

    for file in files:
        filename = file.filename or "unknown_file"

        # 1. Validate file extension
        is_valid, err = validate_file_extension(filename)
        if not is_valid:
            results.append(ApplicationUploadResult(
                filename=filename,
                status="REJECTED",
                message=err
            ))
            continue

        try:
            # 2. Read bytes and calculate SHA-256 hash
            content = await file.read()
            if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                results.append(ApplicationUploadResult(
                    filename=filename,
                    status="REJECTED",
                    message=f"File exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB}MB)."
                ))
                continue

            file_hash = calculate_bytes_hash(content)

            # 3. Check for duplicate resume in this job
            existing_app = check_duplicate_application(db, job_id, file_hash)
            if existing_app:
                cand_name = existing_app.candidate.name if existing_app.candidate else "Existing Candidate"
                results.append(ApplicationUploadResult(
                    filename=filename,
                    status="DUPLICATE",
                    application_id=existing_app.application_id,
                    candidate_id=existing_app.candidate_id,
                    candidate_name=cand_name,
                    file_hash=file_hash,
                    message="Exact duplicate resume detected for this job. Skipped processing."
                ))
                continue

            # 4. Save file to disk securely
            safe_name = sanitize_filename(filename)
            saved_path = os.path.join(settings.UPLOAD_DIR, safe_name)
            async with aiofiles.open(saved_path, "wb") as f:
                await f.write(content)

            # 5. Create Candidate record
            base_cand_name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
            candidate = Candidate(
                name=base_cand_name,
                extracted_skills=[]
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            # 6. Create Application record
            application = Application(
                job_id=job.job_id,
                candidate_id=candidate.candidate_id,
                resume_path=saved_path,
                file_hash=file_hash,
                processing_status="PENDING"
            )
            db.add(application)
            db.commit()
            db.refresh(application)

            # 7. Queue background processing
            background_tasks.add_task(process_resume_application, application.application_id)

            results.append(ApplicationUploadResult(
                filename=filename,
                status="ACCEPTED",
                application_id=application.application_id,
                candidate_id=candidate.candidate_id,
                candidate_name=candidate.name,
                file_hash=file_hash,
                message="Resume uploaded successfully. Screening and matching queued in background."
            ))

        except Exception as e:
            results.append(ApplicationUploadResult(
                filename=filename,
                status="ERROR",
                message=f"Upload failed: {str(e)}"
            ))

    return results


@router.get("/jobs/{job_id}/applications/", response_model=List[ApplicationResponse])
def get_job_applications(job_id: int, db: Session = Depends(get_db)):
    """Retrieves all applications submitted for a job with candidates and match results."""
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")

    applications = db.query(Application).filter(Application.job_id == job_id).order_by(Application.applied_at.desc()).all()
    return applications


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    """Retrieves a single application by ID."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return app


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    """Deletes an application and cleans up the stored file."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    # Remove stored file if exists
    if app.resume_path and os.path.exists(app.resume_path):
        try:
            os.remove(app.resume_path)
        except OSError:
            pass

    db.delete(app)
    db.commit()
    return None
