import os
import io
import pytest
from unittest.mock import MagicMock, patch
from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Application, Candidate, ApplicationStatusHistory
from app.services.processor import process_resume_application
from app.schemas.job import JobCreate
from app.api import jobs, resumes
from app.core.config import settings


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def run_coro(coro):
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did not terminate")


def make_mock_file(filename: str, content: bytes):
    f = MagicMock()
    f.filename = filename
    f.read = MagicMock(return_value=content)
    return f


def test_upload_outcome_accepted(db_session):
    job_in = JobCreate(
        title="Upload Test - Accepted Job",
        description="Testing single accepted resume upload in ATS system.",
        required_skills=["Python", "FastAPI"]
    )
    job = jobs.create_job(job_in, db_session)

    pdf_content = b"%PDF-1.4 unique content for upload accepted test"
    upload_file = make_mock_file("sync_candidate_1.pdf", pdf_content)
    bg_tasks = MagicMock()

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file],
        db=db_session
    ))

    assert len(results) == 1
    assert results[0].filename == "sync_candidate_1.pdf"
    assert results[0].status == "ACCEPTED"
    assert results[0].application_id is not None
    assert "queued" in results[0].message.lower()

    # Verify background task was queued
    assert bg_tasks.add_task.called

    # Verify application created in PENDING status
    app_rec = db_session.query(Application).filter(Application.application_id == results[0].application_id).first()
    assert app_rec is not None
    assert app_rec.processing_status == "PENDING"


def test_upload_outcome_duplicate(db_session):
    job_in = JobCreate(
        title="Upload Test - Duplicate Job",
        description="Testing duplicate resume detection in ATS system.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)

    pdf_content = b"%PDF-1.4 duplicate test content 998877"
    bg_tasks = MagicMock()

    # 1. First upload -> ACCEPTED
    file1 = make_mock_file("sync_dup.pdf", pdf_content)
    res1 = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[file1],
        db=db_session
    ))
    assert res1[0].status == "ACCEPTED"

    # 2. Duplicate upload with same content -> DUPLICATE
    file2 = make_mock_file("sync_dup_copy.pdf", pdf_content)
    res2 = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[file2],
        db=db_session
    ))

    assert len(res2) == 1
    assert res2[0].status == "DUPLICATE"
    assert res2[0].application_id == res1[0].application_id
    assert "duplicate" in res2[0].message.lower()


def test_upload_outcome_rejected_invalid_extension(db_session):
    job_in = JobCreate(
        title="Upload Test - Rejected Ext Job",
        description="Testing invalid extension rejection in ATS system.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)

    upload_file = make_mock_file("malicious.sh", b"#!/bin/bash\nrm -rf /")
    bg_tasks = MagicMock()

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file],
        db=db_session
    ))

    assert len(results) == 1
    assert results[0].filename == "malicious.sh"
    assert results[0].status == "REJECTED"
    assert "unsupported file format" in results[0].message.lower()


def test_upload_outcome_rejected_oversize(db_session, monkeypatch):
    job_in = JobCreate(
        title="Upload Test - Rejected Size Job",
        description="Testing oversize rejection in ATS system.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)

    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_MB", 0)

    upload_file = make_mock_file("huge_file.pdf", b"%PDF-1.4 oversize payload")
    bg_tasks = MagicMock()

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file],
        db=db_session
    ))

    assert len(results) == 1
    assert results[0].status == "REJECTED"
    assert "maximum allowed size" in results[0].message.lower()


def test_upload_outcome_error_with_rollback(db_session):
    job_in = JobCreate(
        title="Upload Test - Error Rollback Job",
        description="Testing error handling with db rollback in ATS system.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)

    upload_file = make_mock_file("error_test.pdf", b"%PDF-1.4 error payload")
    bg_tasks = MagicMock()

    with patch("app.api.resumes.calculate_bytes_hash", side_effect=RuntimeError("Simulated disk/hash failure")):
        results = run_coro(resumes.upload_resumes(
            job_id=job.job_id,
            background_tasks=bg_tasks,
            files=[upload_file],
            db=db_session
        ))

    assert len(results) == 1
    assert results[0].status == "ERROR"
    assert "Upload failed" in results[0].message


def test_upload_outcome_partial_batch(db_session):
    job_in = JobCreate(
        title="Upload Test - Partial Batch Job",
        description="Testing partial batch upload with multiple outcomes.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)
    bg_tasks = MagicMock()

    dup_content = b"%PDF-1.4 initial existing content for partial batch"
    init_file = make_mock_file("init_existing.pdf", dup_content)

    # Initial upload
    res_init = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[init_file],
        db=db_session
    ))
    assert res_init[0].status == "ACCEPTED"

    # Batch with: 1 new (ACCEPTED), 1 duplicate (DUPLICATE), 1 invalid (REJECTED)
    f_new = make_mock_file("brand_new.pdf", b"%PDF-1.4 new user content " + os.urandom(8))
    f_dup = make_mock_file("existing_copy.pdf", dup_content)
    f_rej = make_mock_file("bad_executable.exe", b"MZ...")

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[f_new, f_dup, f_rej],
        db=db_session
    ))

    assert len(results) == 3
    status_by_name = {r.filename: r.status for r in results}
    assert status_by_name["brand_new.pdf"] == "ACCEPTED"
    assert status_by_name["existing_copy.pdf"] == "DUPLICATE"
    assert status_by_name["bad_executable.exe"] == "REJECTED"


def test_corrupt_pdf_fails_with_readable_message_and_retry_works(db_session, client, tmp_path):
    # 1. Create Job
    job = jobs.create_job(JobCreate(
        title="Corrupt Resume Handling Engineer",
        description="Testing that corrupt PDF marks application FAILED and retry works.",
        required_skills=["Python"]
    ), db_session)

    # 2. Create a corrupted PDF file on disk
    corrupt_pdf_path = tmp_path / "corrupt_resume.pdf"
    corrupt_pdf_path.write_bytes(b"%PDF-1.4\ncorrupted-random-binary-not-a-valid-pdf-stream\x00\xff\xfe")

    # 3. Create Candidate & Application
    cand = Candidate(name="Corrupt Candidate")
    db_session.add(cand)
    db_session.commit()
    db_session.refresh(cand)

    app = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path=str(corrupt_pdf_path),
        file_hash="corrupt_hash_test_12345",
        processing_status="PENDING"
    )
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    # 4. Process application
    process_resume_application(app.application_id)
    db_session.refresh(app)

    # 5. Assert marked FAILED with readable message
    assert app.processing_status == "FAILED"
    history = db_session.query(ApplicationStatusHistory).filter(
        ApplicationStatusHistory.application_id == app.application_id
    ).order_by(ApplicationStatusHistory.created_at.desc()).first()
    assert history is not None
    assert "Could not read PDF document" in history.note or "failed" in history.note.lower()

    # 6. Check GET /applications/{id}/status
    res_status = client.get(f"/api/v1/applications/{app.application_id}/status")
    assert res_status.status_code == 200
    status_json = res_status.json()
    assert status_json["processing_status"] == "FAILED"
    assert status_json["message"] is not None

    # 7. Check root /applications/{id}/status alias
    res_root_status = client.get(f"/applications/{app.application_id}/status")
    assert res_root_status.status_code == 200
    assert res_root_status.json()["processing_status"] == "FAILED"

    # 8. Check retry with corrected PDF file works end-to-end
    import fitz
    valid_doc = fitz.open()
    page = valid_doc.new_page()
    page.insert_text((50, 72), "Candidate Name: Retry Success Candidate\nSkills: Python, FastAPI\nExperience: 5 years")
    valid_doc.save(str(corrupt_pdf_path))
    valid_doc.close()

    res_retry = client.post(f"/api/v1/applications/{app.application_id}/retry")
    assert res_retry.status_code == 200
    db_session.refresh(app)
    assert app.processing_status == "COMPLETED"

    # Verify status endpoint reflects COMPLETED
    res_completed_status = client.get(f"/api/v1/applications/{app.application_id}/status")
    assert res_completed_status.status_code == 200
    assert res_completed_status.json()["processing_status"] == "COMPLETED"


def test_ready_and_request_id_endpoints(client):
    # Test /ready endpoint
    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"
    assert res_ready.json()["database"] == "connected"

    # Test X-Request-ID propagation
    custom_id = "test-custom-req-id-12345"
    res_req = client.get("/health", headers={"X-Request-ID": custom_id})
    assert res_req.status_code == 200
    assert res_req.headers.get("X-Request-ID") == custom_id

    # Test global exception handler format {error, message, request_id}
    res_404 = client.get("/api/v1/applications/99999999")
    assert res_404.status_code == 404
    err_json = res_404.json()
    assert "error" in err_json
    assert "message" in err_json
    assert "request_id" in err_json
