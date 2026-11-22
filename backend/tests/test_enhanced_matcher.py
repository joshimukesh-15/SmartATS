import pytest
from app.services.extractor import (
    extract_experience_years,
    extract_seniority_level,
    extract_education
)
from app.services.taxonomy import get_equivalent_skill_match
from app.services.matcher import run_hybrid_matching
from app.schemas.job import JobCreate, JobWeightsUpdateRequest
from app.api import jobs, matches
from app.database.database import SessionLocal, Base, engine


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_experience_and_seniority_extraction():
    resume_1 = """
    Jane Doe
    Senior Staff Software Engineer
    Over 7 years of professional experience building cloud microservices.
    Experience: 2017 - 2024 at TechCorp.
    """
    exp = extract_experience_years(resume_1)
    assert exp >= 7.0

    seniority = extract_seniority_level(resume_1, exp)
    assert seniority == "Lead / Principal"


def test_education_extraction():
    resume_text = """
    Education:
    Master of Science in Computer Science, Stanford University (2020)
    Bachelor of Science in Electrical Engineering (2018)
    """
    edu = extract_education(resume_text)
    assert edu["degree"] == "Master's Degree"
    assert edu["field"] == "Computer Science"
    assert edu["degree_level"] == 4


def test_equivalent_skill_family_recognition():
    # PostgreSQL required; candidate has MySQL
    cand_skills = ["Python", "FastAPI", "MySQL", "Docker"]
    eq = get_equivalent_skill_match("PostgreSQL", cand_skills)
    assert eq == "MySQL"

    # React required; candidate has Next.js
    cand_skills_2 = ["Next.js", "TypeScript"]
    eq_react = get_equivalent_skill_match("React", cand_skills_2)
    assert eq_react == "Next.js"


def test_run_hybrid_matching_with_equivalent_skills_and_weights():
    resume_text = """
    Alex Rivera
    Senior Software Engineer with 6 years experience.
    MS in Computer Science.
    Skills: Python, FastAPI, MySQL, Docker.
    Built scalable distributed backends.
    """
    res = run_hybrid_matching(
        resume_text=resume_text,
        candidate_skills=["Python", "FastAPI", "MySQL", "Docker"],
        job_description="Seeking a Senior Engineer with 5+ years experience. Knowledge of PostgreSQL, Python, FastAPI.",
        required_skills=["Python", "FastAPI", "PostgreSQL"],
        preferred_skills=["Docker"],
        weight_keyword=0.40,
        weight_tfidf=0.20,
        weight_experience=0.25,
        weight_education=0.15
    )

    assert "PostgreSQL" in res["equivalent_skills"]
    assert res["equivalent_skills"]["PostgreSQL"] == "MySQL"
    assert res["experience_years"] >= 6.0
    assert res["experience_score"] >= 85.0
    assert res["final_score"] > 75.0
    assert "Multi-Factor Fit Formula" in res["score_explanation"]


def test_job_weights_persistence_endpoint(db_session, client):
    job_in = JobCreate(
        title="Weights Tuning Engineer",
        description="Testing weight customization",
        required_skills=["Python", "Go"],
        preferred_skills=["Docker"]
    )
    created_job = jobs.create_job(job_in, db_session)
    job_id = created_job.job_id

    # Update weights via PATCH /jobs/{job_id}/weights
    weights_req = JobWeightsUpdateRequest(
        weight_skills=0.60,
        weight_text=0.10,
        weight_experience=0.20,
        weight_education=0.10
    )
    updated_job = jobs.update_job_weights(job_id, weights_req, db_session)
    assert updated_job.custom_weights is not None
    assert updated_job.custom_weights["weight_skills"] == 0.6
    assert updated_job.custom_weights["weight_experience"] == 0.2

    # Query rankings with custom weights
    res = client.get(f"/api/v1/jobs/{job_id}/rankings/?w_skills=0.70&w_text=0.10&w_exp=0.10&w_edu=0.10")
    assert res.status_code == 200
    rankings = res.json()
    assert rankings["weights_applied"]["weight_skills"] == 0.7


def test_experience_range_matching_2_to_4_years():
    from app.services.matcher import compute_experience_score

    jd_with_range = "We are seeking a Backend Engineer with 2 - 4 years experience in Python and microservices."

    # In target range: 2.0, 3.0, 4.0 years -> 100%
    assert compute_experience_score(2.0, "Mid-Level", jd_with_range) == 100.0
    assert compute_experience_score(3.0, "Mid-Level", jd_with_range) == 100.0
    assert compute_experience_score(4.0, "Mid-Level", jd_with_range) == 100.0

    # Above target: 5.5 years -> 100%
    assert compute_experience_score(5.5, "Senior", jd_with_range) == 100.0

    # Near minimum threshold (1.5 - 1.9 yrs) -> 85%
    assert compute_experience_score(1.6, "Junior / Entry", jd_with_range) == 85.0

    # Partial / emerging (1.0 - 1.4 yrs) -> 65%
    assert compute_experience_score(1.0, "Junior / Entry", jd_with_range) == 65.0

    # No documented experience -> 30%
    assert compute_experience_score(0.0, "Junior / Entry", jd_with_range) == 30.0

