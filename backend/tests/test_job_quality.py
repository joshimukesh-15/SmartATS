import pytest
from app.services.job_quality import check_job_description_quality
from app.schemas.job import JobCreate, JobQualityCheckRequest
from app.api import jobs
from app.database.database import SessionLocal, Base, engine


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_vague_and_restrictive_job_description_flagged():
    bad_description = """
    We are seeking a rockstar ninja developer who can wear many hats in a fast-paced environment.
    Must have a degree from an Ivy League university only.
    You will do whatever it takes to ship features under high pressure.
    """
    result = check_job_description_quality(
        title="Full Stack Wizard",
        description=bad_description,
        required_skills=["Python", "FastAPI", "React", "Docker", "AWS", "K8s", "Go", "Redis", "Kafka", "GraphQL"],
        preferred_skills=[]
    )

    assert result["overall_score"] < 60
    assert result["has_salary"] is False
    assert result["has_location"] is False

    issue_titles = [i["title"] for i in result["issues"]]
    # Should flag missing salary and location
    assert any("Salary" in t for t in issue_titles)
    assert any("Location" in t for t in issue_titles)

    # Should flag vague buzzwords
    assert any("rockstar" in t.lower() for t in issue_titles)
    assert any("wear many hats" in t.lower() for t in issue_titles)

    # Should flag restrictive Ivy League requirement
    assert any("Ivy League" in t for t in issue_titles)

    # Should flag excessive skills (>8)
    assert any("Excessive" in t for t in issue_titles)


def test_high_quality_job_description_scores_high():
    good_description = """
    SmartATS is hiring a Senior Backend Engineer to design scalable resume parsing and matching microservices.
    This is a full-time permanent role.
    Work arrangement: Hybrid, with 2 days per week in our San Francisco, CA headquarters (or Remote within US).
    Compensation: Base salary of $145,000 – $175,000 USD per year, plus equity and full health benefits.
    
    Responsibilities include building REST APIs with FastAPI, maintaining PostgreSQL databases, and mentoring junior engineers.
    Qualifications: Degree in Computer Science or equivalent practical industry software engineering experience.
    """
    result = check_job_description_quality(
        title="Senior Backend Engineer",
        description=good_description,
        required_skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
        preferred_skills=["Redis", "AWS"]
    )

    assert result["overall_score"] >= 85
    assert result["grade"] == "EXCELLENT"
    assert result["has_salary"] is True
    assert result["has_location"] is True
    assert result["has_employment_type"] is True
    assert len(result["issues"]) == 0 or all(i["severity"] != "critical" for i in result["issues"])


def test_quality_check_api_endpoint(db_session):
    # Test POST /jobs/quality-check/
    req = JobQualityCheckRequest(
        title="Frontend Lead",
        description="Looking for an energetic rockstar. $130k - $160k. Remote US.",
        required_skills=["React", "TypeScript"]
    )
    resp = jobs.check_job_quality_endpoint(req)
    assert resp.has_salary is True
    assert resp.has_location is True
    assert any("rockstar" in i.title.lower() for i in resp.issues)

    # Create Job and test GET /jobs/{id}/quality-check/
    job_in = JobCreate(
        title="Cloud Architect",
        description="Remote US. Compensation: $160,000 - $190,000. Full-time position designing AWS cloud infra.",
        required_skills=["AWS", "Terraform", "Docker", "Kubernetes"]
    )
    created_job = jobs.create_job(job_in, db_session)
    job_quality = jobs.get_existing_job_quality(created_job.job_id, db_session)
    assert job_quality.has_salary is True
    assert job_quality.overall_score >= 80
