import io
import pytest
from unittest.mock import patch, MagicMock

from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Candidate, Application, MatchResult
from app.schemas.job import JobCreate
from app.api import jobs, matches, resumes
from app.services.ranking import get_job_rankings


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def make_mock_file(filename: str, content: bytes):
    f = MagicMock()
    f.filename = filename
    f.read.return_value = content
    return f


def run_coro(coro):
    """Synchronous generator-based coroutine runner avoiding Windows Proactor loop issues in tests."""
    try:
        while True:
            coro.send(None)
    except StopIteration as e:
        return e.value


# ---------------------------------------------------------------------------
# 1. Test 5 Upload Outcomes (ACCEPTED, DUPLICATE, REJECTED, ERROR, Partial Batch)
# ---------------------------------------------------------------------------

def test_upload_outcome_accepted(db_session):
    job_in = JobCreate(
        title="Upload Test Job - Accepted",
        description="Testing single accepted resume upload.",
        required_skills=["Python", "FastAPI"],
        preferred_skills=["Docker"]
    )
    job = jobs.create_job(job_in, db_session)

    pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF - unique accepted content 1"
    upload_file = make_mock_file("test_candidate_1.pdf", pdf_content)
    bg_tasks = MagicMock()

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file],
        db=db_session
    ))

    assert len(results) == 1
    assert results[0].filename == "test_candidate_1.pdf"
    assert results[0].status == "ACCEPTED"
    assert results[0].application_id is not None
    assert bg_tasks.add_task.called

    # Verify application was created in PENDING status
    app_record = db_session.query(Application).filter(Application.application_id == results[0].application_id).first()
    assert app_record is not None
    assert app_record.processing_status == "PENDING"


def test_upload_outcome_duplicate(db_session):
    job_in = JobCreate(
        title="Upload Test Job - Duplicate",
        description="Testing duplicate detection.",
        required_skills=["Python"],
        preferred_skills=[]
    )
    job = jobs.create_job(job_in, db_session)

    pdf_content = b"%PDF-1.4\nDuplicate resume content for candidate testing hash."
    bg_tasks = MagicMock()

    # First upload -> ACCEPTED
    file1 = make_mock_file("candidate_dup.pdf", pdf_content)
    res1 = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[file1],
        db=db_session
    ))
    assert res1[0].status == "ACCEPTED"

    # Second upload with same content to same job -> DUPLICATE
    file2 = make_mock_file("candidate_dup.pdf", pdf_content)
    res2 = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[file2],
        db=db_session
    ))

    assert len(res2) == 1
    assert res2[0].filename == "candidate_dup.pdf"
    assert res2[0].status == "DUPLICATE"
    assert "duplicate" in res2[0].message.lower()


def test_upload_outcome_rejected_invalid_extension(db_session):
    job_in = JobCreate(
        title="Upload Test Job - Rejected",
        description="Testing invalid file extension rejection.",
        required_skills=["Python"],
        preferred_skills=[]
    )
    job = jobs.create_job(job_in, db_session)

    upload_file = make_mock_file("malicious.exe", b"executable payload")
    bg_tasks = MagicMock()

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file],
        db=db_session
    ))
    assert len(results) == 1
    assert results[0].filename == "malicious.exe"
    assert results[0].status == "REJECTED"
    assert "unsupported" in results[0].message.lower() or "not allowed" in results[0].message.lower() or "only pdf" in results[0].message.lower()


def test_upload_outcome_error(db_session):
    job_in = JobCreate(
        title="Upload Test Job - Error",
        description="Testing upload error handling.",
        required_skills=["Python"],
        preferred_skills=[]
    )
    job = jobs.create_job(job_in, db_session)

    pdf_content = b"%PDF-1.4\nTest error content"
    upload_file = make_mock_file("error_test.pdf", pdf_content)
    bg_tasks = MagicMock()

    with patch("app.api.resumes.calculate_bytes_hash", side_effect=RuntimeError("Disk I/O failure")):
        results = run_coro(resumes.upload_resumes(
            job_id=job.job_id,
            background_tasks=bg_tasks,
            files=[upload_file],
            db=db_session
        ))
        assert len(results) == 1
        assert results[0].filename == "error_test.pdf"
        assert results[0].status == "ERROR"
        assert "Upload failed" in results[0].message


def test_upload_outcome_partial_batch(db_session):
    job_in = JobCreate(
        title="Upload Test Job - Partial Batch",
        description="Testing partial batch upload with multiple outcomes.",
        required_skills=["Python", "FastAPI"],
        preferred_skills=[]
    )
    job = jobs.create_job(job_in, db_session)

    bg_tasks = MagicMock()

    # Pre-upload a file so it can be used as duplicate
    dup_content = b"%PDF-1.4\nExisting candidate file content for batch test"
    init_file = make_mock_file("initial.pdf", dup_content)
    init_res = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[init_file],
        db=db_session
    ))
    assert init_res[0].status == "ACCEPTED"

    # Batch with: 1 valid new file, 1 duplicate, 1 invalid extension
    new_content = b"%PDF-1.4\nBrand new unique content for batch"
    batch_files = [
        make_mock_file("new_cand.pdf", new_content),
        make_mock_file("existing_dup.pdf", dup_content),
        make_mock_file("invalid.txt", b"plain text resume"),
    ]

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=batch_files,
        db=db_session
    ))

    assert len(results) == 3
    statuses = {r.filename: r.status for r in results}
    assert statuses["new_cand.pdf"] == "ACCEPTED"
    assert statuses["existing_dup.pdf"] == "DUPLICATE"
    assert statuses["invalid.txt"] == "REJECTED"


# ---------------------------------------------------------------------------
# 2. Test Unprocessed Candidates Not Receiving Fake or Inflated Scores
# ---------------------------------------------------------------------------

def test_unprocessed_candidates_no_fake_scores(db_session):
    job_in = JobCreate(
        title="Scoring Integrity Job",
        description="Job requiring Python and FastAPI with 5 years experience.",
        required_skills=["Python", "FastAPI"],
        preferred_skills=["Docker"]
    )
    job = jobs.create_job(job_in, db_session)

    # 1. Candidate COMPLETED with legitimate MatchResult
    c_completed = Candidate(
        name="Completed Candidate",
        extracted_skills=["Python", "FastAPI"],
        raw_text="5 years experience in Python and FastAPI. BS in Computer Science."
    )
    db_session.add(c_completed)
    db_session.commit()

    app_completed = Application(
        job_id=job.job_id,
        candidate_id=c_completed.candidate_id,
        resume_path="/dummy/completed.pdf",
        file_hash="hash_completed_1",
        processing_status="COMPLETED"
    )
    db_session.add(app_completed)
    db_session.commit()

    m_completed = MatchResult(
        application_id=app_completed.application_id,
        keyword_score=100.0,
        tfidf_score=80.0,
        final_score=85.0,
        matched_skills=["Python", "FastAPI"],
        missing_skills=[]
    )
    db_session.add(m_completed)
    db_session.commit()

    # 2. Candidate PENDING (has resume text with experience, but processing not completed)
    c_pending = Candidate(
        name="Pending Candidate",
        extracted_skills=["Python", "FastAPI"],
        raw_text="10 years experience Senior Lead Developer Python FastAPI. PhD Computer Science."
    )
    db_session.add(c_pending)
    db_session.commit()

    app_pending = Application(
        job_id=job.job_id,
        candidate_id=c_pending.candidate_id,
        resume_path="/dummy/pending.pdf",
        file_hash="hash_pending_1",
        processing_status="PENDING"
    )
    db_session.add(app_pending)
    db_session.commit()

    # 3. Candidate PROCESSING
    c_proc = Candidate(
        name="Processing Candidate",
        extracted_skills=["Python"],
        raw_text="8 years experience Python developer."
    )
    db_session.add(c_proc)
    db_session.commit()

    app_proc = Application(
        job_id=job.job_id,
        candidate_id=c_proc.candidate_id,
        resume_path="/dummy/processing.pdf",
        file_hash="hash_proc_1",
        processing_status="PROCESSING"
    )
    db_session.add(app_proc)
    db_session.commit()

    # 4. Candidate FAILED
    c_failed = Candidate(
        name="Failed Candidate",
        extracted_skills=[],
        raw_text="Corrupted text"
    )
    db_session.add(c_failed)
    db_session.commit()

    app_failed = Application(
        job_id=job.job_id,
        candidate_id=c_failed.candidate_id,
        resume_path="/dummy/failed.pdf",
        file_hash="hash_failed_1",
        processing_status="FAILED"
    )
    db_session.add(app_failed)
    db_session.commit()

    # Fetch rankings
    rankings_resp = get_job_rankings(db_session, job.job_id)
    items_by_name = {item.candidate_name: item for item in rankings_resp.rankings}

    # Verify processed_count only counts COMPLETED
    assert rankings_resp.processed_count == 1
    assert rankings_resp.total_candidates == 4

    # Verify COMPLETED candidate has legitimate score and is rank 1
    assert items_by_name["Completed Candidate"].rank == 1
    assert items_by_name["Completed Candidate"].final_score > 0.0

    # Unprocessed candidates must have 0.0 final_score (no fake / inflated scores)
    assert items_by_name["Pending Candidate"].final_score == 0.0
    assert items_by_name["Processing Candidate"].final_score == 0.0
    assert items_by_name["Failed Candidate"].final_score == 0.0

    # Completed candidate ranked above all unprocessed candidates
    assert items_by_name["Completed Candidate"].rank < items_by_name["Pending Candidate"].rank
    assert items_by_name["Completed Candidate"].rank < items_by_name["Processing Candidate"].rank
    assert items_by_name["Completed Candidate"].rank < items_by_name["Failed Candidate"].rank


# ---------------------------------------------------------------------------
# 3. Test Analytics Returning True Values with Empty States on Fresh DB
# ---------------------------------------------------------------------------

def test_analytics_empty_job_returns_true_zero_states(db_session):
    # Create empty job with 0 applications
    empty_job_in = JobCreate(
        title="Empty Analytics Job",
        description="A job with zero candidates to verify empty analytics.",
        required_skills=["Go", "Kubernetes"],
        preferred_skills=[]
    )
    job = jobs.create_job(empty_job_in, db_session)

    analytics = matches.get_job_specific_analytics(job.job_id, db_session)
    assert analytics["job_id"] == job.job_id
    assert analytics["total_applications"] == 0
    assert analytics["total_processed"] == 0
    assert analytics["average_final_score"] == 0.0
    assert analytics["most_common_matched_skills"] == []
    assert analytics["most_frequently_missing_skills"] == []

    # Score buckets all zero
    for bucket, count in analytics["score_buckets"].items():
        assert count == 0, f"Expected 0 in bucket {bucket}, got {count}"

    # Stage distribution all zero
    for stage, count in analytics["stage_distribution"].items():
        assert count == 0, f"Expected 0 in stage {stage}, got {count}"


# ---------------------------------------------------------------------------
# 4. Test Application Count Consistency
# ---------------------------------------------------------------------------

def test_application_count_consistency(db_session):
    job_in = JobCreate(
        title="Application Count Consistency Job",
        description="Testing application count field consistency across endpoints.",
        required_skills=["TypeScript", "React"],
        preferred_skills=[]
    )
    created_job = jobs.create_job(job_in, db_session)
    job_id = created_job.job_id

    # Check initially 0
    fetched_job = jobs.get_job(job_id, db_session)
    initial_count = getattr(fetched_job, "application_count", getattr(fetched_job, "applications_count", None))
    assert initial_count == 0

    # Add 2 applications
    c1 = Candidate(name="AppCount Candidate 1")
    c2 = Candidate(name="AppCount Candidate 2")
    db_session.add_all([c1, c2])
    db_session.commit()

    a1 = Application(job_id=job_id, candidate_id=c1.candidate_id, resume_path="r1.pdf", file_hash="h_appcount_1")
    a2 = Application(job_id=job_id, candidate_id=c2.candidate_id, resume_path="r2.pdf", file_hash="h_appcount_2")
    db_session.add_all([a1, a2])
    db_session.commit()

    # Verify get_job reflects 2
    fetched_job = jobs.get_job(job_id, db_session)
    count_after = getattr(fetched_job, "application_count", getattr(fetched_job, "applications_count", None))
    assert count_after == 2

    # Verify list_jobs reflects 2
    all_jobs = jobs.list_jobs(0, 100, db_session)
    matching_job = next(j for j in all_jobs if j.job_id == job_id)
    list_count = getattr(matching_job, "application_count", getattr(matching_job, "applications_count", None))
    assert list_count == 2
