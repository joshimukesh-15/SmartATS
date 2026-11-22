import os
import io
import zipfile
import inspect
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Job, Application, Candidate, ApplicationStatusHistory, ApplicationNote
from app.schemas.application import (
    ApplicationResponse,
    ApplicationUploadResult,
    ApplicationStatusUpdateRequest,
    ApplicationNoteCreateRequest,
    ApplicationNoteResponse,
    ApplicationWorkflowDetailsResponse,
    PaginatedApplicationsResponse
)
from app.schemas.pagination import resolve_param
from app.core.config import settings
from app.core.security import sanitize_filename, validate_file_extension
from app.services.duplicate import calculate_bytes_hash, check_duplicate_application
from app.services.processor import process_resume_application, process_resume_batch
from app.services.scoring import attach_scoring_to_application, resolve_scoring_weights, rescore_job_applications
from app.ml.vectorizer import vectorizer_cache
from app.api.deps import get_current_recruiter

router = APIRouter(tags=["Resumes & Applications"])

ALLOWED_REVIEW_STAGES = ["New", "Reviewing", "Interview", "Interviewing", "Offer", "Hired", "Rejected"]
STAGE_CANONICAL_MAP = {
    "new": "New",
    "reviewing": "Reviewing",
    "interview": "Interview",
    "interviewing": "Interview",
    "offer": "Offer",
    "hired": "Hired",
    "rejected": "Rejected",
}


@router.post("/jobs/{job_id}/upload-resumes/", response_model=List[ApplicationUploadResult], status_code=status.HTTP_202_ACCEPTED)
async def upload_resumes(
    job_id: int,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
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
    enqueued_app_ids: List[int] = []

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
            # 2. Bounded streaming read up to max limit + 1 byte
            max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
            if isinstance(file, UploadFile):
                chunks = []
                total_read = 0
                is_oversize = False
                file.file.seek(0)
                while True:
                    chunk = file.file.read(65536)
                    if not chunk:
                        break
                    total_read += len(chunk)
                    if total_read > max_bytes:
                        is_oversize = True
                        break
                    chunks.append(chunk)

                if is_oversize:
                    results.append(ApplicationUploadResult(
                        filename=filename,
                        status="REJECTED",
                        message=f"File exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB}MB)."
                    ))
                    continue
                content = b"".join(chunks)
            else:
                raw_read = file.read()
                content = await raw_read if inspect.isawaitable(raw_read) else raw_read
                if len(content) > max_bytes:
                    results.append(ApplicationUploadResult(
                        filename=filename,
                        status="REJECTED",
                        message=f"File exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB}MB)."
                    ))
                    continue

            # 3. Magic bytes / file signature validation
            ext = os.path.splitext(filename.lower())[1]
            if ext == ".pdf":
                if not content.startswith(b"%PDF-"):
                    results.append(ApplicationUploadResult(
                        filename=filename,
                        status="REJECTED",
                        message="Invalid PDF signature. File content does not match standard PDF specification."
                    ))
                    continue
            elif ext == ".docx":
                if not content.startswith(b"PK\x03\x04"):
                    results.append(ApplicationUploadResult(
                        filename=filename,
                        status="REJECTED",
                        message="Invalid DOCX signature. File content does not match OpenXML zip container."
                    ))
                    continue

                # Defend against zip decompression bombs in DOCX
                try:
                    with zipfile.ZipFile(io.BytesIO(content)) as zf:
                        uncompressed_size = sum(info.file_size for info in zf.infolist())
                        compressed_size = sum(info.compress_size for info in zf.infolist()) or 1
                        if uncompressed_size > 50 * 1024 * 1024:
                            results.append(ApplicationUploadResult(
                                filename=filename,
                                status="REJECTED",
                                message="DOCX rejected: uncompressed payload exceeds safe limits (decompression bomb protection)."
                            ))
                            continue
                        if (uncompressed_size / compressed_size) > 100:
                            results.append(ApplicationUploadResult(
                                filename=filename,
                                status="REJECTED",
                                message="DOCX rejected: abnormal compression ratio detected."
                            ))
                            continue
                except zipfile.BadZipFile:
                    results.append(ApplicationUploadResult(
                        filename=filename,
                        status="REJECTED",
                        message="Corrupt or malformed DOCX archive."
                    ))
                    continue

            file_hash = calculate_bytes_hash(content)

            # 4. Check for duplicate resume in this job
            existing_app = check_duplicate_application(db, job_id, file_hash)
            if existing_app:
                cand_name = existing_app.candidate.name if existing_app.candidate else "Existing Candidate"
                # Record duplicate attempt for audit & analytics
                dup_history = ApplicationStatusHistory(
                    application_id=existing_app.application_id,
                    from_stage=existing_app.review_stage,
                    to_stage=existing_app.review_stage,
                    note=f"Duplicate resume upload detected ({filename}). Skipped redundant processing.",
                    changed_by="System"
                )
                db.add(dup_history)
                db.commit()

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
            with open(saved_path, "wb") as f:
                f.write(content)

            # 5. Create Candidate record with fallback name until parsed
            file_stem = Path(filename).stem
            candidate = Candidate(
                name=f"Unnamed candidate {file_stem}",
                extracted_skills=[]
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            # 6. Create Application record with default "New" review stage
            application = Application(
                job_id=job.job_id,
                candidate_id=candidate.candidate_id,
                resume_path=saved_path,
                file_hash=file_hash,
                processing_status="PENDING",
                review_stage="New"
            )
            db.add(application)
            db.commit()
            db.refresh(application)

            # Log initial status history
            init_history = ApplicationStatusHistory(
                application_id=application.application_id,
                from_stage=None,
                to_stage="New",
                note="Application submitted and queued for screening",
                changed_by="System"
            )
            db.add(init_history)
            db.commit()

            # Increment vectorizer cache version, invalidate cache, set job & app status to Re-scoring
            vectorizer_cache.increment_version(job.job_id)
            vectorizer_cache.set_job_status(job.job_id, "Re-scoring")
            db.query(Application).filter(
                Application.job_id == job.job_id,
                Application.application_id != application.application_id,
                Application.processing_status == "COMPLETED"
            ).update({"processing_status": "Re-scoring"})
            db.commit()

            # 7. Collect for background batch processing
            enqueued_app_ids.append(application.application_id)

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
            db.rollback()
            results.append(ApplicationUploadResult(
                filename=filename,
                status="ERROR",
                message=f"Upload failed: {str(e)}"
            ))

    if enqueued_app_ids:
        background_tasks.add_task(process_resume_batch, enqueued_app_ids, job.job_id)

    return results


@router.get("/jobs/{job_id}/applications/", response_model=PaginatedApplicationsResponse)
def get_job_applications(
    job_id: int,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves paginated applications submitted for a job with candidates, match results, and review stage."""
    limit = resolve_param(limit, 50)
    offset = resolve_param(offset, 0)

    if limit < 1 or limit > 200:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 200")

    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")

    query = db.query(Application).filter(Application.job_id == job_id)
    total = query.count()
    applications = query.order_by(Application.applied_at.desc()).offset(offset).limit(limit).all()
    applied_weights = resolve_scoring_weights(job_custom_weights=job.custom_weights)
    for app in applications:
        attach_scoring_to_application(app, job=job, applied_weights=applied_weights)
    return PaginatedApplicationsResponse(
        items=[ApplicationResponse.model_validate(app) for app in applications],
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/applications/", response_model=PaginatedApplicationsResponse)
def list_applications(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    job_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves paginated applications across all jobs or filtered by job_id."""
    limit = resolve_param(limit, 50)
    offset = resolve_param(offset, 0)

    if limit < 1 or limit > 200:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 200")
    job_id = resolve_param(job_id, None)

    query = db.query(Application)
    if job_id is not None:
        query = query.filter(Application.job_id == job_id)
    total = query.count()
    applications = query.order_by(Application.applied_at.desc()).offset(offset).limit(limit).all()
    for app in applications:
        attach_scoring_to_application(app, db=db)
    return PaginatedApplicationsResponse(
        items=[ApplicationResponse.model_validate(app) for app in applications],
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    """Retrieves a single application by ID with status history and notes."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    attach_scoring_to_application(app, db=db)
    return app


@router.patch("/applications/{application_id}/stage", response_model=ApplicationResponse)
@router.patch("/applications/{application_id}/status", response_model=ApplicationResponse)
@router.put("/applications/{application_id}/stage", response_model=ApplicationResponse)
@router.put("/applications/{application_id}/status", response_model=ApplicationResponse)
def update_application_stage(
    application_id: int,
    payload: ApplicationStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """
    Updates the candidate's review stage in the hiring pipeline.
    Valid stages: New, Reviewing, Interview, Interviewing, Offer, Rejected, Hired.
    Records an entry in the timestamped status history and optionally appends a recruiter note.
    """
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    target_stage = payload.stage.strip().lower()
    matched_stage = STAGE_CANONICAL_MAP.get(target_stage)
    if not matched_stage:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage '{payload.stage}'. Must be one of: {', '.join(ALLOWED_REVIEW_STAGES)}"
        )

    old_stage = app.review_stage or "New"
    app.review_stage = matched_stage

    # Record status history audit trail
    history = ApplicationStatusHistory(
        application_id=app.application_id,
        from_stage=old_stage,
        to_stage=matched_stage,
        note=payload.note,
        changed_by=payload.changed_by or "Recruiter"
    )
    db.add(history)

    # If note provided with status update, add to recruiter notes thread
    if payload.note and payload.note.strip():
        note_entry = ApplicationNote(
            application_id=app.application_id,
            content=f"Stage changed to {matched_stage}: {payload.note.strip()}",
            author=payload.changed_by or "Recruiter"
        )
        db.add(note_entry)

    db.commit()
    db.refresh(app)
    attach_scoring_to_application(app, db=db)
    return app


@router.post("/applications/{application_id}/notes", response_model=ApplicationNoteResponse, status_code=status.HTTP_201_CREATED)
def add_application_note(
    application_id: int,
    payload: ApplicationNoteCreateRequest,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """Adds a recruiter note to an application with timestamp and author."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")

    note = ApplicationNote(
        application_id=app.application_id,
        content=content,
        author=payload.author or "Recruiter"
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/applications/{application_id}/history", response_model=ApplicationWorkflowDetailsResponse)
def get_application_workflow_history(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Retrieves full workflow history and notes for an application."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    return ApplicationWorkflowDetailsResponse(
        application_id=app.application_id,
        review_stage=app.review_stage or "New",
        status_history=app.status_history or [],
        notes=app.notes or []
    )


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """Deletes an application and cleans up the stored file."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    job_id = app.job_id

    # Remove stored file if exists
    if app.resume_path and os.path.exists(app.resume_path):
        try:
            os.remove(app.resume_path)
        except OSError:
            pass

    db.delete(app)
    db.commit()

    # Trigger corpus re-scoring for remaining applications of that job
    vectorizer_cache.increment_version(job_id)
    vectorizer_cache.set_job_status(job_id, "Re-scoring")
    db.query(Application).filter(
        Application.job_id == job_id,
        Application.processing_status != "FAILED"
    ).update({"processing_status": "Re-scoring"})
    db.commit()

    if background_tasks:
        background_tasks.add_task(rescore_job_applications, job_id)
    else:
        rescore_job_applications(job_id)

    return None


@router.get("/applications/{application_id}/download")
def download_resume(application_id: int, db: Session = Depends(get_db)):
    """Securely downloads candidate resume file without exposing internal filesystem paths."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    if not app.resume_path or not os.path.exists(app.resume_path):
        raise HTTPException(status_code=404, detail="Resume file not found on server.")

    cand_name = (app.candidate.name if app.candidate and app.candidate.name else "Candidate").replace(" ", "_")
    ext = os.path.splitext(app.resume_path)[1]
    filename = f"{cand_name}_Resume{ext}"
    return FileResponse(
        path=app.resume_path,
        filename=filename,
        media_type="application/octet-stream"
    )


@router.get("/applications/{application_id}/preview")
def preview_resume(application_id: int, db: Session = Depends(get_db)):
    """Streams resume document directly for secure browser preview."""
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    if not app.resume_path or not os.path.exists(app.resume_path):
        raise HTTPException(status_code=404, detail="Resume file not found on server.")

    ext = os.path.splitext(app.resume_path)[1].lower()
    media_type = "application/pdf" if ext == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(
        path=app.resume_path,
        media_type=media_type
    )


@router.post("/applications/{application_id}/retry", response_model=ApplicationResponse)
def retry_application_processing(
    application_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_recruiter: dict = Depends(get_current_recruiter)
):
    """
    Recruiter action to retry processing for a candidate application that failed or stalled.
    Resets status to PENDING, logs audit history, and enqueues background processing.
    """
    app = db.query(Application).filter(Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if not app.resume_path or not os.path.exists(app.resume_path):
        raise HTTPException(status_code=400, detail="Resume file is missing or inaccessible on server.")

    app.processing_status = "PENDING"
    audit = ApplicationStatusHistory(
        application_id=app.application_id,
        from_stage=app.review_stage or "New",
        to_stage=app.review_stage or "New",
        note="Manual processing retry initiated by recruiter",
        changed_by=current_recruiter.get("email", "Recruiter")
    )
    db.add(audit)
    db.commit()
    db.refresh(app)

    background_tasks.add_task(process_resume_application, app.application_id)
    attach_scoring_to_application(app, db=db)
    return app

