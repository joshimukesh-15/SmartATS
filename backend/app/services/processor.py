import logging
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database.models import Application, Candidate, Job, MatchResult
from app.services.parser import extract_resume_text
from app.services.extractor import extract_email, extract_phone, extract_name, extract_skills
from app.services.matcher import run_hybrid_matching

logger = logging.getLogger(__name__)


def process_resume_application(application_id: int):
    """
    Synchronous/Background worker function that parses a resume, extracts entities,
    computes hybrid matching against the job description, and updates the database.
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

        # 1. Parse resume text
        try:
            resume_text, used_ocr = extract_resume_text(app.resume_path)
        except Exception as e:
            logger.error(f"Failed to extract text from {app.resume_path}: {e}")
            app.processing_status = "FAILED"
            db.commit()
            return

        # 2. Extract contacts if missing
        if cand:
            if not cand.email:
                cand.email = extract_email(resume_text)
            if not cand.phone:
                cand.phone = extract_phone(resume_text)
            if not cand.name or cand.name.startswith("Candidate_"):
                extracted_n = extract_name(resume_text)
                if extracted_n:
                    cand.name = extracted_n

            # 3. Extract technical skills
            skills = extract_skills(resume_text)
            cand.extracted_skills = skills
            cand.raw_text = resume_text
            db.commit()

        # 4. Perform hybrid matching
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

        # 5. Persist MatchResult
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
        logger.info(f"Successfully processed application {application_id} with score {match_data['final_score']}%.")

    except Exception as e:
        logger.exception(f"Unhandled error processing application {application_id}: {e}")
        db.rollback()
        try:
            app = db.query(Application).filter(Application.application_id == application_id).first()
            if app:
                app.processing_status = "FAILED"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
