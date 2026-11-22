import io
import csv
import pytest
from datetime import datetime, timezone
from app.main import app
from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Candidate, Application, MatchResult
from app.schemas.job import JobCreate
from app.schemas.match import CandidateCompareRequest, ScoringConfigResponse
from app.schemas.application import ApplicationStatusUpdateRequest
from app.api import jobs, matches, resumes, scoring
from app.services.scoring import (
    evaluate_application_scoring,
    resolve_scoring_weights,
    DEFAULT_WEIGHTS_4PILLAR,
    FORMULA_DESCRIPTION_4PILLAR
)
from app.services.matcher import run_hybrid_matching


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def seeded_job_and_apps(db_session):
    # 1. Create a Job
    job_in = JobCreate(
        title="Senior Python Platform Architect",
        description="Seeking Senior Engineer with 5+ years experience and BS/MS in Computer Science. Required: Python, FastAPI, PostgreSQL. Preferred: Docker, Kubernetes.",
        required_skills=["Python", "FastAPI", "PostgreSQL"],
        preferred_skills=["Docker", "Kubernetes"]
    )
    job = jobs.create_job(job_in, db_session)

    # 2. Candidate 1 (Completed with MatchResult)
    cand1 = Candidate(
        name="Elena Rostova",
        email="elena.rostova@example.com",
        phone="+1 555-0101",
        extracted_skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
        raw_text="Elena Rostova. Senior Backend Engineer with 6 years experience. BS in Computer Science. Skills: Python, FastAPI, PostgreSQL, Docker."
    )
    db_session.add(cand1)
    db_session.commit()
    db_session.refresh(cand1)

    app1 = Application(
        job_id=job.job_id,
        candidate_id=cand1.candidate_id,
        resume_path="dummy/path/elena_resume.pdf",
        file_hash="elena_hash_1234567890abcdef",
        processing_status="COMPLETED",
        review_stage="New",
        applied_at=datetime.now(timezone.utc)
    )
    db_session.add(app1)
    db_session.commit()
    db_session.refresh(app1)

    mr1 = MatchResult(
        application_id=app1.application_id,
        keyword_score=100.0,
        tfidf_score=80.0,
        final_score=85.0,
        matched_skills=["Python", "FastAPI", "PostgreSQL"],
        missing_skills=[],
        preferred_matched_skills=["Docker"],
        score_explanation="Multi-Factor evaluated",
        evaluated_at=datetime.now(timezone.utc)
    )
    db_session.add(mr1)
    db_session.commit()

    # 3. Candidate 2 (Completed with partial matches)
    cand2 = Candidate(
        name="Marcus Vance",
        email="marcus.vance@example.com",
        phone="+1 555-0202",
        extracted_skills=["Python", "MySQL"],
        raw_text="Marcus Vance. Software Developer with 3 years experience. Skills: Python, MySQL."
    )
    db_session.add(cand2)
    db_session.commit()
    db_session.refresh(cand2)

    app2 = Application(
        job_id=job.job_id,
        candidate_id=cand2.candidate_id,
        resume_path="dummy/path/marcus_resume.pdf",
        file_hash="marcus_hash_1234567890abcdef",
        processing_status="COMPLETED",
        review_stage="Reviewing",
        applied_at=datetime.now(timezone.utc)
    )
    db_session.add(app2)
    db_session.commit()
    db_session.refresh(app2)

    mr2 = MatchResult(
        application_id=app2.application_id,
        keyword_score=58.33,
        tfidf_score=45.0,
        final_score=55.0,
        matched_skills=["Python"],
        missing_skills=["FastAPI", "PostgreSQL"],
        preferred_matched_skills=[],
        score_explanation="Partial match",
        evaluated_at=datetime.now(timezone.utc)
    )
    db_session.add(mr2)
    db_session.commit()

    # 4. Candidate 3 (Unprocessed PENDING application)
    cand3 = Candidate(
        name="Pending Candidate",
        email="pending@example.com",
        phone="+1 555-0303",
        extracted_skills=[],
        raw_text="Pending candidate resume text."
    )
    db_session.add(cand3)
    db_session.commit()
    db_session.refresh(cand3)

    app3 = Application(
        job_id=job.job_id,
        candidate_id=cand3.candidate_id,
        resume_path="dummy/path/pending_resume.pdf",
        file_hash="pending_hash_1234567890abcdef",
        processing_status="PENDING",
        review_stage="New",
        applied_at=datetime.now(timezone.utc)
    )
    db_session.add(app3)
    db_session.commit()
    db_session.refresh(app3)

    return {
        "job": job,
        "app1": app1,
        "app2": app2,
        "app3": app3,
        "cand1": cand1,
        "cand2": cand2,
        "cand3": cand3
    }


def test_scoring_config_endpoint_and_route():
    """
    Verifies GET /api/v1/scoring/config returns status 200 with default_weights and formula_description,
    and is properly mounted in the FastAPI app routes.
    """
    # 1. Route existence (handles both flat and nested routers across FastAPI versions)
    matching_routes = [
        r for r in app.routes
        if getattr(r, "path", None) == "/api/v1/scoring/config" and "GET" in getattr(r, "methods", [])
    ]
    if not matching_routes:
        for r in app.routes:
            if hasattr(r, "original_router") and hasattr(r, "include_context"):
                prefix = getattr(r.include_context, "prefix", "")
                for sub_r in r.original_router.routes:
                    if prefix + getattr(sub_r, "path", "") == "/api/v1/scoring/config" and "GET" in getattr(sub_r, "methods", []):
                        matching_routes.append(sub_r)
    assert len(matching_routes) >= 1, "Route /api/v1/scoring/config [GET] not found in app.routes"

    # 2. Endpoint execution
    config = scoring.get_scoring_config()
    assert isinstance(config, ScoringConfigResponse)
    assert config.default_weights == {
        "skills": 0.40,
        "text": 0.20,
        "experience": 0.25,
        "education": 0.15,
    }
    assert config.formula_description == (
        "Final Score = (Skills % × 0.40) + (Semantic Text % × 0.20) + "
        "(Experience Fit % × 0.25) + (Education % × 0.15)"
    )


def test_rankings_weights_and_components(db_session, seeded_job_and_apps, client):
    """
    Asserts that for rankings endpoint:
    a) weights and components are returned with all 4 keys (skills, text, experience, education).
    b) final_score equals the sum of points of the 4 components.
    """
    job_id = seeded_job_and_apps["job"].job_id
    res = client.get(f"/api/v1/jobs/{job_id}/rankings/")
    assert res.status_code == 200
    rankings_resp = res.json()

    assert rankings_resp["total"] >= 2
    assert len(rankings_resp["items"]) >= 2

    for item in rankings_resp["items"]:
        # Check weights
        assert item["weights"] is not None
        for pillar in ("skills", "text", "experience", "education"):
            assert pillar in item["weights"], f"Missing {pillar} in ranking item weights"
            assert isinstance(item["weights"][pillar], float)

        # Check components
        assert item["components"] is not None
        for pillar in ("skills", "text", "experience", "education"):
            assert pillar in item["components"], f"Missing {pillar} in ranking item components"
            comp = item["components"][pillar]
            assert "percentage" in comp
            assert "weight" in comp
            assert "points" in comp
            assert comp["points"] == round(comp["percentage"] * comp["weight"], 2)

        # Check final_score = sum of points
        expected_final = round(sum(c["points"] for c in item["components"].values()), 2)
        assert item["final_score"] == expected_final, (
            f"final_score {item['final_score']} != sum of points {expected_final}"
        )


def test_applications_weights_and_components(db_session, seeded_job_and_apps, client):
    """
    Asserts that for application endpoints (get_job_applications, get_application, update_application_stage):
    a) weights and components are returned with all 4 keys (skills, text, experience, education).
    b) final_score equals the sum of points of the 4 components.
    """
    job_id = seeded_job_and_apps["job"].job_id
    res = client.get(f"/api/v1/jobs/{job_id}/applications/")
    assert res.status_code == 200
    apps_list = res.json()["items"]

    assert len(apps_list) >= 2

    for app_item in apps_list:
        # Check weights
        assert app_item["weights"] is not None
        for pillar in ("skills", "text", "experience", "education"):
            assert pillar in app_item["weights"], f"Missing {pillar} in application weights"
            assert isinstance(app_item["weights"][pillar], float)

        # Check components
        assert app_item["components"] is not None
        for pillar in ("skills", "text", "experience", "education"):
            assert pillar in app_item["components"], f"Missing {pillar} in application components"
            comp = app_item["components"][pillar]
            assert "percentage" in comp
            assert "weight" in comp
            assert "points" in comp
            assert comp["points"] == round(comp["percentage"] * comp["weight"], 2)

        # Check final_score = sum of points
        expected_final = round(sum(c["points"] for c in app_item["components"].values()), 2)
        assert app_item["final_score"] == expected_final, (
            f"final_score {app_item['final_score']} != sum of points {expected_final}"
        )

        if app_item.get("match_result"):
            mr = app_item["match_result"]
            assert mr["weights"] is not None
            for pillar in ("skills", "text", "experience", "education"):
                assert pillar in mr["weights"]
            assert mr["components"] is not None
            for pillar in ("skills", "text", "experience", "education"):
                assert pillar in mr["components"]
            mr_expected_final = round(sum(c["points"] for c in mr["components"].values()), 2)
            assert mr["final_score"] == mr_expected_final

    # Test single application endpoint
    app1_id = seeded_job_and_apps["app1"].application_id
    single_app = resumes.get_application(application_id=app1_id, db=db_session)
    for pillar in ("skills", "text", "experience", "education"):
        assert pillar in single_app.weights
        assert pillar in single_app.components
    assert single_app.final_score == round(sum(c["points"] for c in single_app.components.values()), 2)

    # Test stage update endpoint
    updated_app = resumes.update_application_stage(
        application_id=app1_id,
        payload=ApplicationStatusUpdateRequest(stage="Interviewing", note="Solid scoring fit"),
        db=db_session,
        current_recruiter={"email": "lead.recruiter@example.com"}
    )
    for pillar in ("skills", "text", "experience", "education"):
        assert pillar in updated_app.weights
        assert pillar in updated_app.components
    assert updated_app.final_score == round(sum(c["points"] for c in updated_app.components.values()), 2)


def test_compare_weights_and_components(db_session, seeded_job_and_apps):
    """
    Asserts that for candidate compare endpoint:
    a) weights and components are returned with all 4 keys (skills, text, experience, education).
    b) final_score equals the sum of points of the 4 components.
    """
    job_id = seeded_job_and_apps["job"].job_id
    app1_id = seeded_job_and_apps["app1"].application_id
    app2_id = seeded_job_and_apps["app2"].application_id

    req = CandidateCompareRequest(application_ids=[app1_id, app2_id])
    compare_resp = matches.compare_candidates_endpoint(job_id=job_id, req=req, db=db_session)

    assert len(compare_resp.candidates) == 2

    for cand_item in compare_resp.candidates:
        # Check weights
        assert cand_item.weights is not None
        for pillar in ("skills", "text", "experience", "education"):
            assert pillar in cand_item.weights, f"Missing {pillar} in compare candidate weights"
            assert isinstance(cand_item.weights[pillar], float)

        # Check components
        assert cand_item.components is not None
        for pillar in ("skills", "text", "experience", "education"):
            assert pillar in cand_item.components, f"Missing {pillar} in compare candidate components"
            comp = cand_item.components[pillar]
            assert "percentage" in comp
            assert "weight" in comp
            assert "points" in comp
            assert comp["points"] == round(comp["percentage"] * comp["weight"], 2)

        # Check final_score = sum of points
        expected_final = round(sum(c["points"] for c in cand_item.components.values()), 2)
        assert cand_item.final_score == expected_final, (
            f"final_score {cand_item.final_score} != sum of points {expected_final}"
        )


def test_export_csv_scoring_columns(db_session, seeded_job_and_apps):
    """
    Asserts that export_job_rankings_csv produces CSV containing columns for:
    Skills %, Skills Weight, Skills Points, Text %, Text Weight, Text Points,
    Experience %, Experience Weight, Experience Points, Education %, Education Weight,
    Education Points, and Final Score.
    """
    job_id = seeded_job_and_apps["job"].job_id
    csv_response = matches.export_job_rankings_csv(
        job_id=job_id,
        db=db_session,
        current_recruiter={"email": "lead.recruiter@example.com"}
    )

    assert csv_response.media_type == "text/csv"
    csv_text = csv_response.body.decode("utf-8")

    reader = csv.reader(io.StringIO(csv_text))
    header = next(reader)

    expected_cols = [
        "Skills %", "Skills Weight", "Skills Points",
        "Text %", "Text Weight", "Text Points",
        "Experience %", "Experience Weight", "Experience Points",
        "Education %", "Education Weight", "Education Points",
        "Final Score"
    ]

    for col in expected_cols:
        assert col in header, f"Expected column '{col}' missing from CSV header: {header}"


def test_hybrid_matching_weights_and_components():
    """
    Direct unit test for run_hybrid_matching returning weights, components, and final_score = sum(points).
    """
    res = run_hybrid_matching(
        resume_text="Senior Python Engineer with 6 years experience and BS in Computer Science. Skills: Python, FastAPI.",
        candidate_skills=["Python", "FastAPI"],
        job_description="Seeking Senior Engineer with 5+ years experience. Required skills: Python, FastAPI, Docker.",
        required_skills=["Python", "FastAPI", "Docker"],
        preferred_skills=[],
        weight_keyword=0.40,
        weight_tfidf=0.20,
        weight_experience=0.25,
        weight_education=0.15
    )

    assert "weights" in res
    assert "components" in res
    for k in ("skills", "text", "experience", "education"):
        assert k in res["weights"]
        assert k in res["components"]
        c = res["components"][k]
        assert c["points"] == round(c["percentage"] * c["weight"], 2)

    expected_sum = round(sum(c["points"] for c in res["components"].values()), 2)
    assert res["final_score"] == expected_sum
