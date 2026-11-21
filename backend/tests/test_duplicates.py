import uuid
import pytest
from unittest.mock import patch
from sqlalchemy.exc import IntegrityError
from app.services.duplicate import calculate_bytes_hash
from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Candidate, Application, MatchResult
from app.schemas.job import JobCreate
from app.api import jobs
from app.services.processor import process_resume_application


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_calculate_bytes_hash():
    sample_bytes_1 = b"Sample resume content for John Doe."
    sample_bytes_2 = b"Sample resume content for John Doe."
    sample_bytes_3 = b"Different resume content for Jane Smith."

    hash1 = calculate_bytes_hash(sample_bytes_1)
    hash2 = calculate_bytes_hash(sample_bytes_2)
    hash3 = calculate_bytes_hash(sample_bytes_3)

    assert hash1 == hash2
    assert hash1 != hash3
    assert len(hash1) == 64


def test_candidate_dedupe_across_jobs_merges_skills(db_session):
    """
    Verifies that uploading the same candidate email to two different jobs
    results in exactly 1 candidate record with merged, deduped skills.
    """
    uid = uuid.uuid4().hex[:8]
    candidate_email = f"alex.mercer.{uid}@example.com"

    # 1. Create Job 1 and Job 2
    job1_in = JobCreate(
        title=f"Backend Engineer - Dedupe 1 {uid}",
        description="Looking for Python and Django engineers with PostgreSQL experience.",
        required_skills=["Python", "Django", "PostgreSQL"]
    )
    job1 = jobs.create_job(job1_in, db_session)

    job2_in = JobCreate(
        title=f"Cloud Architect - Dedupe 2 {uid}",
        description="Looking for Python and Cloud engineers with FastAPI, Docker, and AWS.",
        required_skills=["Python", "FastAPI", "Docker", "AWS"]
    )
    job2 = jobs.create_job(job2_in, db_session)

    resume_1_text = f"""Alex Mercer
{candidate_email}
(555) 010-1234

Experienced Backend Developer.
Skills: Python, Django, PostgreSQL
"""
    resume_2_text = f"""Alex Mercer
{candidate_email}
(555) 010-1234

Experienced Cloud Developer.
Skills: Python, FastAPI, Docker, AWS
"""

    # 2. Simulate Application 1 for Job 1
    cand_placeholder1 = Candidate(
        name="Unnamed candidate resume_job1",
        extracted_skills=[]
    )
    db_session.add(cand_placeholder1)
    db_session.commit()
    app1_job_id = job1.job_id
    app1_file_hash = f"unique_hash_alex_job1_{uid}"

    app1 = Application(
        job_id=app1_job_id,
        candidate_id=cand_placeholder1.candidate_id,
        resume_path="dummy/path/resume_job1.pdf",
        file_hash=app1_file_hash,
        processing_status="PENDING"
    )
    db_session.add(app1)
    db_session.commit()
    app1_id = app1.application_id

    with patch("app.services.processor.extract_resume_text", return_value=(resume_1_text, False)):
        process_resume_application(app1_id)

    db_session.expire_all()
    app1 = db_session.query(Application).filter(Application.application_id == app1_id).first()
    assert app1.processing_status == "COMPLETED"
    cand1 = db_session.query(Candidate).filter(Candidate.email == candidate_email).first()
    assert cand1 is not None
    assert cand1.name == "Alex Mercer"
    assert "Python" in cand1.extracted_skills
    assert "Django" in cand1.extracted_skills
    assert "PostgreSQL" in cand1.extracted_skills

    # 3. Simulate Application 2 for Job 2 (different job, same candidate email)
    cand_placeholder2 = Candidate(
        name="Unnamed candidate resume_job2",
        extracted_skills=[]
    )
    db_session.add(cand_placeholder2)
    db_session.commit()
    placeholder2_id = cand_placeholder2.candidate_id
    app2_job_id = job2.job_id
    app2_file_hash = f"unique_hash_alex_job2_{uid}"

    app2 = Application(
        job_id=app2_job_id,
        candidate_id=placeholder2_id,
        resume_path="dummy/path/resume_job2.pdf",
        file_hash=app2_file_hash,
        processing_status="PENDING"
    )
    db_session.add(app2)
    db_session.commit()
    app2_id = app2.application_id

    with patch("app.services.processor.extract_resume_text", return_value=(resume_2_text, False)):
        process_resume_application(app2_id)

    db_session.expire_all()
    app2 = db_session.query(Application).filter(Application.application_id == app2_id).first()
    assert app2.processing_status == "COMPLETED"

    # 4. Verify candidate deduplication
    matching_candidates = db_session.query(Candidate).filter(Candidate.email == candidate_email).all()
    # Exactly 1 candidate record must exist!
    assert len(matching_candidates) == 1
    deduped_cand = matching_candidates[0]

    # Verify both applications point to the single candidate record
    assert app1.candidate_id == deduped_cand.candidate_id
    assert app2.candidate_id == deduped_cand.candidate_id

    # Verify skills from both resumes were merged without duplicates
    skills = deduped_cand.extracted_skills
    assert len(skills) == len(set(s.lower() for s in skills))  # No duplicates
    assert "Python" in skills
    assert "Django" in skills
    assert "PostgreSQL" in skills
    assert "FastAPI" in skills
    assert "Docker" in skills
    assert "AWS" in skills

    # Temporary placeholder was cleaned up
    assert db_session.query(Candidate).filter(Candidate.candidate_id == placeholder2_id).first() is None


def test_name_extraction_and_fallback(db_session):
    """
    Verifies that parsed names are extracted as candidate display names,
    and falls back to 'Unnamed candidate <stem>' when no name is identified.
    """
    uid = uuid.uuid4().hex[:8]
    job_in = JobCreate(
        title=f"QA Automation Engineer {uid}",
        description="Testing automated testing skills.",
        required_skills=["Selenium", "Python"]
    )
    job = jobs.create_job(job_in, db_session)

    # A. Resume with extractable name
    named_email = f"jordan.{uid}@example.com"
    resume_with_name = f"""Jordan Taylor
{named_email}
(555) 432-8765
Software QA Engineer with 4 years experience in Selenium and Python.
"""
    c_named = Candidate(name="Unnamed candidate jordan_taylor_cv", extracted_skills=[])
    db_session.add(c_named)
    db_session.commit()
    c_named_id = c_named.candidate_id

    app_named = Application(
        job_id=job.job_id,
        candidate_id=c_named_id,
        resume_path="/resumes/jordan_taylor_cv.pdf",
        file_hash=f"hash_jordan_named_{uid}",
        processing_status="PENDING"
    )
    db_session.add(app_named)
    db_session.commit()
    app_named_id = app_named.application_id

    with patch("app.services.processor.extract_resume_text", return_value=(resume_with_name, False)):
        process_resume_application(app_named_id)

    db_session.expire_all()
    c_named = db_session.query(Candidate).filter(Candidate.candidate_id == c_named_id).first()
    assert c_named is not None
    assert c_named.name == "Jordan Taylor"

    # B. Resume without extractable name (e.g. only email / headers)
    unnamed_email = f"anonymous.{uid}@example.com"
    resume_without_name = f"""{unnamed_email}
(555) 000-1111
Developer with expertise in Python, Selenium.
"""
    c_unnamed = Candidate(name="Unnamed candidate test_candidate_stem", extracted_skills=[])
    db_session.add(c_unnamed)
    db_session.commit()
    c_unnamed_id = c_unnamed.candidate_id

    app_unnamed = Application(
        job_id=job.job_id,
        candidate_id=c_unnamed_id,
        resume_path="/resumes/test_candidate_stem.pdf",
        file_hash=f"hash_unnamed_fallback_{uid}",
        processing_status="PENDING"
    )
    db_session.add(app_unnamed)
    db_session.commit()
    app_unnamed_id = app_unnamed.application_id

    with patch("app.services.processor.extract_resume_text", return_value=(resume_without_name, False)):
        process_resume_application(app_unnamed_id)

    db_session.expire_all()
    c_unnamed = db_session.query(Candidate).filter(Candidate.candidate_id == c_unnamed_id).first()
    assert c_unnamed is not None
    assert c_unnamed.name == "Unnamed candidate test_candidate_stem"


def test_unique_constraint_application_job_id_file_hash(db_session):
    """
    Verifies that UNIQUE(job_id, file_hash) constraint prevents duplicate application records.
    """
    uid = uuid.uuid4().hex[:8]
    job_in = JobCreate(
        title=f"Constraint Job - Duplicate Apps {uid}",
        description="Testing unique constraint on applications.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)

    cand = Candidate(name=f"Unique Constraint Test Cand {uid}", extracted_skills=[])
    db_session.add(cand)
    db_session.commit()

    file_hash = f"unique_sha256_hash_check_{uid}"

    app1 = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path=f"/resumes/unique_hash_test_{uid}.pdf",
        file_hash=file_hash,
        processing_status="COMPLETED"
    )
    db_session.add(app1)
    db_session.commit()

    # Attempting to insert identical (job_id, file_hash) must violate unique constraint
    app2 = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path=f"/resumes/unique_hash_test_copy_{uid}.pdf",
        file_hash=file_hash,
        processing_status="PENDING"
    )
    db_session.add(app2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_unique_constraint_match_results_application_id(db_session):
    """
    Verifies that UNIQUE constraint on match_results.application_id prevents duplicate match rows.
    """
    uid = uuid.uuid4().hex[:8]
    job_in = JobCreate(
        title=f"Constraint Job - Match Results {uid}",
        description="Testing unique constraint on match_results.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)

    cand = Candidate(name=f"Match Unique Cand {uid}", extracted_skills=[])
    db_session.add(cand)
    db_session.commit()

    app = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path=f"/resumes/match_unique_{uid}.pdf",
        file_hash=f"match_unique_hash_{uid}",
        processing_status="COMPLETED"
    )
    db_session.add(app)
    db_session.commit()

    mr1 = MatchResult(
        application_id=app.application_id,
        keyword_score=80.0,
        tfidf_score=70.0,
        final_score=75.0,
        matched_skills=["Python"],
        missing_skills=[]
    )
    db_session.add(mr1)
    db_session.commit()

    # Attempting to insert a second match result for the same application_id must fail
    mr2 = MatchResult(
        application_id=app.application_id,
        keyword_score=90.0,
        tfidf_score=85.0,
        final_score=88.0,
        matched_skills=["Python"],
        missing_skills=[]
    )
    db_session.add(mr2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
