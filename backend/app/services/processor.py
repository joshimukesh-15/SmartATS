import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.database import SessionLocal
from app.database.models import Application, Candidate, Job, MatchResult, ApplicationStatusHistory
from app.services.parser import extract_resume_text
from app.services.extractor import extract_email, extract_phone, extract_name, extract_skills
from app.services.matcher import run_hybrid_matching
from app.services.duplicate import find_candidate_by_email

logger = logging.getLogger(__name__)

# Bounded thread pool for concurrent resume parsing
_parsing_executor = ThreadPoolExecutor(
    max_workers=settings.MAX_CONCURRENT_PARSING,
    thread_name_prefix="resume-parser"
)


def process_resume_application(application_id: int, rescore: bool = True):
    """
    Synchronous/Background worker function that parses a resume, extracts entities,
    computes hybrid matching against the job description, and updates the database.
    Guarantees failure audit logging in ApplicationStatusHistory.
    """
    db: Session = SessionLocal()
    try:
        app = db.query(Application).filter(Application.application_id == application_id).first()
        if not app:
            logger.error(f"Application {application_id} not found.")
            return

        app.processing_status = "PROCESSING"
        db.commit()

        job = app.job
        cand = app.candidate

        # 1. Parse resume text with bounded concurrency and timeout
        try:
            future = _parsing_executor.submit(extract_resume_text, app.resume_path)
            resume_text, used_ocr = future.result(timeout=settings.PARSE_TIMEOUT_SECONDS)
        except FuturesTimeoutError:
            err_msg = f"Resume parsing timed out after {settings.PARSE_TIMEOUT_SECONDS}s. File may be excessively complex or malformed."
            logger.exception("Application %s text extraction timed out: %s", application_id, err_msg)
            app.processing_status = "FAILED"
            audit = ApplicationStatusHistory(
                application_id=app.application_id,
                from_stage=app.review_stage or "New",
                to_stage=app.review_stage or "New",
                note=err_msg[:500],
                changed_by="System"
            )
            db.add(audit)
            db.commit()
            return
        except (ValueError, FileNotFoundError, OSError) as e:
            err_msg = f"Failed to extract resume text: {str(e)}"
            logger.exception("Application %s text extraction failed: %s", application_id, err_msg)
            app.processing_status = "FAILED"
            audit = ApplicationStatusHistory(
                application_id=app.application_id,
                from_stage=app.review_stage or "New",
                to_stage=app.review_stage or "New",
                note=err_msg[:500],
                changed_by="System"
            )
            db.add(audit)
            db.commit()
            return

        # 2. Extract contacts, name, and skills from resume text
        extracted_email = extract_email(resume_text)
        extracted_phone = extract_phone(resume_text)
        extracted_n = extract_name(resume_text)
        file_stem = Path(app.resume_path).stem
        fallback_name = f"Unnamed candidate {file_stem}"
        new_skills = extract_skills(resume_text)

        # 3. Candidate resolution and deduplication
        existing_candidate = find_candidate_by_email(db, extracted_email) if extracted_email else None
        current_cand = app.candidate

        if existing_candidate:
            if current_cand and current_cand.candidate_id != existing_candidate.candidate_id:
                # Reuse existing candidate and merge newly extracted skills (deduped)
                merged_skills = list(existing_candidate.extracted_skills or [])
                seen_skills = {s.lower() for s in merged_skills}
                for s in new_skills:
                    if s.lower() not in seen_skills:
                        merged_skills.append(s)
                        seen_skills.add(s.lower())
                existing_candidate.extracted_skills = merged_skills

                # Update existing candidate details if empty or placeholder
                if extracted_n and (
                    not existing_candidate.name
                    or existing_candidate.name.startswith("Unnamed candidate")
                    or existing_candidate.name.startswith("Candidate_")
                ):
                    existing_candidate.name = extracted_n
                if extracted_phone and not existing_candidate.phone:
                    existing_candidate.phone = extracted_phone
                if resume_text and not existing_candidate.raw_text:
                    existing_candidate.raw_text = resume_text

                # Attach application to the existing candidate
                app.candidate_id = existing_candidate.candidate_id
                app.candidate = existing_candidate
                db.flush()

                # Clean up orphaned temporary placeholder candidate
                cand_apps_count = (
                    db.query(Application)
                    .filter(Application.candidate_id == current_cand.candidate_id)
                    .count()
                )
                if cand_apps_count == 0:
                    db.delete(current_cand)
                    db.flush()

                cand = existing_candidate
            else:
                cand = existing_candidate
                merged_skills = list(cand.extracted_skills or [])
                seen_skills = {s.lower() for s in merged_skills}
                for s in new_skills:
                    if s.lower() not in seen_skills:
                        merged_skills.append(s)
                        seen_skills.add(s.lower())
                cand.extracted_skills = merged_skills
                if extracted_n:
                    cand.name = extracted_n
                elif not cand.name or cand.name.startswith("Candidate_"):
                    cand.name = fallback_name
                if extracted_phone and not cand.phone:
                    cand.phone = extracted_phone
                cand.raw_text = resume_text
        else:
            if current_cand:
                cand = current_cand
                cand.email = extracted_email
                if extracted_phone:
                    cand.phone = extracted_phone
                if extracted_n:
                    cand.name = extracted_n
                elif not cand.name or cand.name.startswith("Candidate_"):
                    cand.name = fallback_name
                cand.extracted_skills = new_skills
                cand.raw_text = resume_text
            else:
                cand = Candidate(
                    name=extracted_n if extracted_n else fallback_name,
                    email=extracted_email,
                    phone=extracted_phone,
                    raw_text=resume_text,
                    extracted_skills=new_skills
                )
                db.add(cand)
                db.flush()
                app.candidate_id = cand.candidate_id
                app.candidate = cand

        db.commit()

        # 4. Generate hybrid match result for current application
        candidate_name = cand.name if cand and cand.name else "Candidate"
        candidate_skills = cand.extracted_skills if cand else []

        match_data = run_hybrid_matching(
            resume_text=resume_text,
            candidate_skills=candidate_skills,
            job_description=job.description,
            required_skills=job.required_skills,
            preferred_skills=job.preferred_skills,
            candidate_name=candidate_name
        )

        match = db.query(MatchResult).filter(MatchResult.application_id == app.application_id).first()
        if not match:
            match = MatchResult(
                application_id=app.application_id,
                keyword_score=match_data["keyword_score"],
                tfidf_score=match_data["tfidf_score"],
                final_score=match_data["final_score"],
                matched_skills=match_data["matched_skills"],
                missing_skills=match_data["missing_skills"],
                preferred_matched_skills=match_data["preferred_matched_skills"],
                score_explanation=match_data["score_explanation"]
            )
            db.add(match)
        else:
            match.keyword_score = match_data["keyword_score"]
            match.tfidf_score = match_data["tfidf_score"]
            match.final_score = match_data["final_score"]
            match.matched_skills = match_data["matched_skills"]
            match.missing_skills = match_data["missing_skills"]
            match.preferred_matched_skills = match_data["preferred_matched_skills"]
            match.score_explanation = match_data["score_explanation"]

        app.processing_status = "COMPLETED"
        db.commit()

        # 5. Perform per-job re-scoring across all applications if requested
        if rescore:
            from app.services.scoring import rescore_job_applications
            rescore_job_applications(job.job_id, db=db)

        logger.info(f"Successfully processed application {application_id}.")

    except (SQLAlchemyError, ValueError, KeyError, RuntimeError, OSError) as e:
        err_msg = f"Unhandled error during resume processing: {str(e)}"
        logger.exception("Application %s processing failed with error: %s", application_id, e)
        db.rollback()
        try:
            app = db.query(Application).filter(Application.application_id == application_id).first()
            if app:
                app.processing_status = "FAILED"
                audit = ApplicationStatusHistory(
                    application_id=app.application_id,
                    from_stage=app.review_stage or "New",
                    to_stage=app.review_stage or "New",
                    note=err_msg[:500],
                    changed_by="System"
                )
                db.add(audit)
                db.commit()
        except (SQLAlchemyError, OSError) as inner_e:
            logger.exception("Failed to record failure status and audit for application %s: %s", application_id, inner_e)
    finally:
        db.close()


def process_resume_batch(application_ids: list[int], job_id: int):
    """
    Processes a batch of resume applications, then executes a single
    per-job rescoring pass across all applications at the end.
    """
    for app_id in application_ids:
        process_resume_application(app_id, rescore=False)

    from app.services.scoring import rescore_job_applications
    rescore_job_applications(job_id)
