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


def test_job_crud_endpoints(db_session):
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
    all_jobs = jobs.list_jobs(0, 100, db_session)
    assert any(j.job_id == job_id for j in all_jobs)


def test_resume_processing_and_ranking_flow(db_session):
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
    rankings_resp = matches.get_job_rankings_endpoint(job.job_id, db_session)
    assert rankings_resp.total_candidates >= 1
    assert rankings_resp.rankings[0].candidate_name == "Sarah Jenkins"

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
    assert overview["total_jobs"] > 0
    assert overview["total_candidates"] > 0
    assert "score_distribution" in overview
