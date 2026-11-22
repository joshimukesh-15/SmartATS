import os
import pytest
from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Candidate, Application, MatchResult
from app.schemas.job import JobCreate, JobUpdate
from app.schemas.match import CandidateCompareRequest
from app.api import jobs, candidates, matches, resumes
from app.services.processor import process_resume_application


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_job_crud_endpoints(db_session, client):
    # 1. Create Job
    job_in = JobCreate(
        title="Full Stack Cloud Engineer",
        description="Seeking full stack engineer with Python, FastAPI, React, Docker, and PostgreSQL experience.",
        required_skills=["Python", "FastAPI", "React"],
        preferred_skills=["Docker", "PostgreSQL"]
    )
    created_job = jobs.create_job(job_in, db_session)
    assert created_job.job_id is not None
    assert created_job.title == "Full Stack Cloud Engineer"
    assert "Python" in created_job.required_skills

    job_id = created_job.job_id

    # 2. Get Job
    fetched_job = jobs.get_job(job_id, db_session)
    assert fetched_job.job_id == job_id
    assert fetched_job.title == "Full Stack Cloud Engineer"

    # 3. Update Job
    update_in = JobUpdate(title="Lead Cloud Engineer")
    updated_job = jobs.update_job(job_id, update_in, db_session)
    assert updated_job.title == "Lead Cloud Engineer"

    # 4. List Jobs
    response = client.get("/api/v1/jobs/?limit=100&offset=0")
    assert response.status_code == 200
    items = response.json()["items"]
    assert any(j["job_id"] == job_id for j in items)


def test_delete_job_removes_resume_and_orphaned_candidate(db_session, tmp_path, monkeypatch):
    upload_root = tmp_path / "resumes"
    upload_root.mkdir()
    monkeypatch.setattr("app.api.jobs.settings.UPLOAD_DIR", str(upload_root))

    job = jobs.create_job(JobCreate(
        title="Delete cleanup role",
        description="A sufficiently long job description for cleanup testing.",
        required_skills=["Python"]
    ), db_session)
    candidate = Candidate(name="Delete cleanup candidate", raw_text="Sensitive resume text")
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)

    resume_path = upload_root / "delete_cleanup_resume.pdf"
    resume_path.write_bytes(b"resume")
    application = Application(
        job_id=job.job_id,
        candidate_id=candidate.candidate_id,
        resume_path=str(resume_path),
        file_hash="delete-cleanup-unique-hash",
        processing_status="COMPLETED"
    )
    db_session.add(application)
    db_session.commit()
    candidate_id = candidate.candidate_id

    jobs.delete_job(job.job_id, db_session)

    assert not resume_path.exists()
    assert db_session.query(Application).filter(Application.job_id == job.job_id).count() == 0
    assert db_session.query(Candidate).filter(Candidate.candidate_id == candidate_id).first() is None


def test_delete_job_keeps_candidate_shared_with_another_opening(db_session, tmp_path, monkeypatch):
    # This module shares a database session across tests; clear stale identities
    # left by the preceding cleanup test before SQLite reuses deleted row IDs.
    db_session.expunge_all()
    upload_root = tmp_path / "resumes"
    upload_root.mkdir()
    monkeypatch.setattr("app.api.jobs.settings.UPLOAD_DIR", str(upload_root))

    job_to_delete = jobs.create_job(JobCreate(
        title="Shared candidate role one",
        description="A sufficiently long job description for shared candidate testing.",
        required_skills=["Python"]
    ), db_session)
    remaining_job = jobs.create_job(JobCreate(
        title="Shared candidate role two",
        description="Another sufficiently long job description for shared candidate testing.",
        required_skills=["Python"]
    ), db_session)
    candidate = Candidate(name="Shared candidate", raw_text="Candidate resume text")
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)

    first_resume = upload_root / "shared_one.pdf"
    second_resume = upload_root / "shared_two.pdf"
    first_resume.write_bytes(b"resume one")
    second_resume.write_bytes(b"resume two")
    db_session.add_all([
        Application(
            job_id=job_to_delete.job_id,
            candidate_id=candidate.candidate_id,
            resume_path=str(first_resume),
            file_hash="shared-candidate-role-one-hash",
            processing_status="COMPLETED"
        ),
        Application(
            job_id=remaining_job.job_id,
            candidate_id=candidate.candidate_id,
            resume_path=str(second_resume),
            file_hash="shared-candidate-role-two-hash",
            processing_status="COMPLETED"
        )
    ])
    db_session.commit()
    candidate_id = candidate.candidate_id

    jobs.delete_job(job_to_delete.job_id, db_session)

    assert not first_resume.exists()
    assert second_resume.exists()
    assert db_session.query(Candidate).filter(Candidate.candidate_id == candidate_id).first() is not None


def test_resume_processing_and_ranking_flow(db_session, client):
    # Create test job
    job_in = JobCreate(
        title="Python Backend Lead",
        description="Lead Python backend developer building FastAPI microservices with PostgreSQL on AWS.",
        required_skills=["Python", "FastAPI", "PostgreSQL"],
        preferred_skills=["Docker", "AWS"]
    )
    job = jobs.create_job(job_in, db_session)

    # Use generated test resume
    pdf_path = os.path.abspath("data/test_resumes/sarah_jenkins_resume.pdf")
    if not os.path.exists(pdf_path):
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "test_resumes", "sarah_jenkins_resume.pdf"))
    assert os.path.exists(pdf_path)

    # Create candidate and application
    cand = Candidate(
        name="Sarah Jenkins",
        email="sarah.jenkins@test.com",
        phone="(415) 555-0192",
        extracted_skills=[]
    )
    db_session.add(cand)
    db_session.commit()
    db_session.refresh(cand)

    app = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path=pdf_path,
        file_hash="test_mock_sha256_hash_12345",
        processing_status="PENDING"
    )
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    # Run processing pipeline
    process_resume_application(app.application_id)

    # Verify application completed
    db_session.refresh(app)
    assert app.processing_status == "COMPLETED"
    assert app.match_result is not None
    assert app.match_result.final_score > 50.0
    assert "Python" in app.match_result.matched_skills

    # Test rankings endpoint
    res = client.get(f"/api/v1/jobs/{job.job_id}/rankings/?limit=50&offset=0")
    assert res.status_code == 200
    rankings_resp = res.json()
    assert rankings_resp["total"] >= 1
    assert rankings_resp["items"][0]["candidate_name"] == "Sarah Jenkins"

    # Test single application match endpoint
    match_resp = matches.get_application_match_endpoint(app.application_id, db_session)
    assert match_resp.final_score == app.match_result.final_score

    # Test CSV export endpoint
    csv_resp = matches.export_job_rankings_csv(job.job_id, db_session)
    assert csv_resp.status_code == 200
    assert "Sarah Jenkins" in csv_resp.body.decode("utf-8")


def test_comparison_endpoint(db_session):
    # Create Job
    job_in = JobCreate(
        title="Fullstack React Developer",
        description="Building web UIs in React, TypeScript, and Node.js.",
        required_skills=["React", "TypeScript", "Node.js"],
        preferred_skills=["Tailwind CSS"]
    )
    job = jobs.create_job(job_in, db_session)

    # Create 2 candidates
    c1 = Candidate(name="Alice Dev", extracted_skills=["React", "TypeScript", "Tailwind CSS"])
    c2 = Candidate(name="Bob Eng", extracted_skills=["React", "Node.js"])
    db_session.add_all([c1, c2])
    db_session.commit()

    a1 = Application(job_id=job.job_id, candidate_id=c1.candidate_id, resume_path="mock1.pdf", file_hash="h1", processing_status="COMPLETED")
    a2 = Application(job_id=job.job_id, candidate_id=c2.candidate_id, resume_path="mock2.pdf", file_hash="h2", processing_status="COMPLETED")
    db_session.add_all([a1, a2])
    db_session.commit()

    m1 = MatchResult(application_id=a1.application_id, keyword_score=66.7, tfidf_score=50.0, final_score=60.0, matched_skills=["React", "TypeScript"], missing_skills=["Node.js"])
    m2 = MatchResult(application_id=a2.application_id, keyword_score=66.7, tfidf_score=45.0, final_score=58.0, matched_skills=["React", "Node.js"], missing_skills=["TypeScript"])
    db_session.add_all([m1, m2])
    db_session.commit()

    # Compare
    req = CandidateCompareRequest(application_ids=[a1.application_id, a2.application_id])
    comp_res = matches.compare_candidates_endpoint(job.job_id, req, db_session)
    assert len(comp_res.candidates) == 2
    assert "React" in comp_res.common_matched_skills
    assert "React" in comp_res.skill_matrix


def test_analytics_endpoints(db_session):
    overview = matches.get_platform_overview_analytics(db_session)
    assert overview.totals.jobs > 0
    assert overview.totals.candidates > 0
    assert len(overview.score_histogram) == 6
    assert "Interviewing" in overview.stage_distribution
    assert "Offer" in overview.stage_distribution
