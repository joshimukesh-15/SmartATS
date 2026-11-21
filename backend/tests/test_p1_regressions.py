import io
import math
from datetime import datetime, timezone
from unittest.mock import MagicMock
import pytest
from fastapi import HTTPException

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)
from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Candidate, Application, MatchResult, ApplicationStatusHistory
from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobWeightsUpdateRequest,
    DEFAULT_SCORING_WEIGHTS,
    normalize_weights_dict
)
from app.services.taxonomy import (
    get_equivalent_skill_match,
    get_equivalent_skill_explanation,
    normalize_skill_name
)
from app.services.extractor import (
    extract_experience_years,
    merge_employment_intervals,
    extract_education
)
from app.services.matcher import (
    compute_education_score,
    get_required_education_level
)
from app.services.scoring import (
    resolve_scoring_weights,
    evaluate_application_scoring
)
from app.services.ranking import get_job_rankings
from app.services.comparison import compare_candidates_service
from app.utils.exporters import export_rankings_to_csv, sanitize_csv_cell
from app.schemas.match import RankingItem
from app.api import jobs, candidates, matches, resumes, auth
from app.api.auth import LoginRequest
from app.api.deps import get_current_recruiter
from fastapi.security import HTTPAuthorizationCredentials


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
    try:
        while True:
            coro.send(None)
    except StopIteration as e:
        return e.value


# ---------------------------------------------------------------------------
# Item 5: Unify Leaderboard and Comparison Scoring
# ---------------------------------------------------------------------------

def test_leaderboard_and_comparison_scores_identical(db_session):
    job = Job(
        title="Senior Python Architect",
        description="Seeking Python architect with 5+ years experience. Bachelor's degree required.",
        required_skills=["Python", "FastAPI", "PostgreSQL"],
        preferred_skills=["Docker"],
        custom_weights={"weight_skills": 0.50, "weight_text": 0.10, "weight_experience": 0.25, "weight_education": 0.15}
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)

    cand = Candidate(
        name="Elena Rostova",
        email="elena@example.com",
        raw_text="Elena Rostova. Senior Engineer with 6 years experience (2018 - 2024). Bachelor of Science in Computer Science. Skills: Python, FastAPI, MySQL.",
        extracted_skills=["Python", "FastAPI", "MySQL"]
    )
    db_session.add(cand)
    db_session.commit()
    db_session.refresh(cand)

    app_record = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path="/dummy/elena.pdf",
        file_hash="hash_elena_p1",
        processing_status="COMPLETED",
        review_stage="Reviewing"
    )
    db_session.add(app_record)
    db_session.commit()
    db_session.refresh(app_record)

    match = MatchResult(
        application_id=app_record.application_id,
        keyword_score=66.7,
        tfidf_score=75.0,
        final_score=0.0,
        matched_skills=["Python", "FastAPI"],
        missing_skills=["PostgreSQL"],
        preferred_matched_skills=[]
    )
    db_session.add(match)
    db_session.commit()

    # 1. Fetch from Leaderboard Ranking
    rankings_resp = get_job_rankings(db_session, job.job_id)
    assert len(rankings_resp.rankings) == 1
    leaderboard_item = rankings_resp.rankings[0]

    # 2. Fetch from Comparison Service
    compare_resp = compare_candidates_service(db_session, job.job_id, [app_record.application_id])
    assert len(compare_resp.candidates) == 1
    compare_item = compare_resp.candidates[0]

    # Acceptance Criteria: Leaderboard and Comparison must produce EXACT same scores
    assert leaderboard_item.final_score == compare_item.final_score
    assert leaderboard_item.keyword_score == compare_item.keyword_score
    assert leaderboard_item.tfidf_score == compare_item.tfidf_score
    assert leaderboard_item.experience_score == compare_item.experience_score
    assert leaderboard_item.education_score == compare_item.education_score
    assert leaderboard_item.score_breakdown == compare_item.score_breakdown


# ---------------------------------------------------------------------------
# Item 6: Validate Recruiter Scoring Weights
# ---------------------------------------------------------------------------

def test_weights_validation_and_normalization():
    # Valid weights must sum to 1.0 after normalization
    weights = {"weight_skills": 2.0, "weight_text": 1.0, "weight_experience": 1.0, "weight_education": 0.0}
    normalized = normalize_weights_dict(weights)
    assert round(sum(normalized.values()), 2) == 1.0
    assert normalized["weight_skills"] == 0.50

    # Reject negative weights
    with pytest.raises(ValueError, match="non-negative"):
        normalize_weights_dict({"weight_skills": -0.2, "weight_text": 0.4, "weight_experience": 0.2, "weight_education": 0.2})

    # Reject NaN / infinite weights
    with pytest.raises(ValueError, match="finite"):
        normalize_weights_dict({"weight_skills": float("nan"), "weight_text": 0.4, "weight_experience": 0.2, "weight_education": 0.2})

    # Reject all-zero weights
    with pytest.raises(ValueError, match="strictly greater than 0"):
        normalize_weights_dict({"weight_skills": 0.0, "weight_text": 0.0, "weight_experience": 0.0, "weight_education": 0.0})

    # Graceful fallback in ranking for corrupted database config
    resolved = resolve_scoring_weights(job_custom_weights={"weight_skills": -5.0, "weight_text": float("nan")})
    assert resolved == DEFAULT_SCORING_WEIGHTS


# ---------------------------------------------------------------------------
# Item 7: Skill Taxonomy Overhaul (No False Equivalents)
# ---------------------------------------------------------------------------

def test_skill_taxonomy_no_false_equivalents():
    # Docker != Kubernetes
    assert get_equivalent_skill_match("Docker", ["Kubernetes"]) is None
    assert get_equivalent_skill_match("Kubernetes", ["Docker"]) is None

    # React != Vue.js / Angular
    assert get_equivalent_skill_match("React", ["Vue.js"]) is None
    assert get_equivalent_skill_match("React", ["Angular"]) is None

    # Genuine equivalents are preserved
    assert get_equivalent_skill_match("PostgreSQL", ["MySQL"]) == "MySQL"
    assert get_equivalent_skill_match("React", ["Next.js"]) == "Next.js"
    assert get_equivalent_skill_match("FastAPI", ["Flask"]) == "Flask"
    assert get_equivalent_skill_match("PyTorch", ["TensorFlow"]) == "TensorFlow"

    # Equivalence justification is explainable
    explanation = get_equivalent_skill_explanation("PostgreSQL", "MySQL")
    assert "ANSI SQL" in explanation or "transferable" in explanation


# ---------------------------------------------------------------------------
# Item 8: Experience Extraction Overlap Merging & Dynamic Current Year
# ---------------------------------------------------------------------------

def test_experience_extraction_merges_overlapping_jobs():
    # Job A: 2018-2022 (4 yrs), Job B: 2020-2024 (4 yrs) -> Merged: 2018-2024 = 6 yrs (NOT 8 yrs)
    intervals = [(2018.0, 2022.0), (2020.0, 2024.0)]
    merged = merge_employment_intervals(intervals)
    assert len(merged) == 1
    assert merged[0] == (2018.0, 2024.0)

    resume_text = """
    Work Experience:
    Senior Software Engineer | Alpha Corp
    2018 - 2022
    Consultant | Beta Inc
    2020 - 2024
    """
    exp = extract_experience_years(resume_text)
    assert exp == 6.0

    # Ensure education lines are not double-counted as employment
    resume_with_edu = """
    Education:
    Bachelor of Technology in Computer Science, State University (2014 - 2018)
    Work Experience:
    Software Engineer, Tech Corp (2018 - 2023)
    """
    exp_edu = extract_experience_years(resume_with_edu)
    assert exp_edu == 5.0  # Only the 2018-2023 job, not the college years


# ---------------------------------------------------------------------------
# Item 9: Refine Education Scoring Based on Job Requirements
# ---------------------------------------------------------------------------

def test_education_scoring_reflects_actual_job_requirements():
    # Case 1: Job does NOT require a degree -> No penalty for uncredentialed candidate
    jd_no_degree = "Self-taught developers welcome. Strong portfolio and Python skills required."
    assert get_required_education_level(jd_no_degree) == 0
    edu_unspecified = {"degree": "Unspecified", "degree_level": 1, "field": None}
    score_no_deg = compute_education_score(edu_unspecified, jd_no_degree)
    assert score_no_deg == 100.0  # Neutral full credit, no penalty!

    # Case 2: Job requires Bachelor's (level 3)
    jd_bachelor = "Must have a Bachelor's degree in Computer Science or related field."
    assert get_required_education_level(jd_bachelor) == 3

    # Candidate with Bachelor's CS -> 100.0
    edu_bs = {"degree": "Bachelor's Degree", "degree_level": 3, "field": "Computer Science"}
    assert compute_education_score(edu_bs, jd_bachelor) == 100.0

    # Candidate with Associate -> 65.0 (proportional)
    edu_assoc = {"degree": "Associate Degree", "degree_level": 2, "field": None}
    assert compute_education_score(edu_assoc, jd_bachelor) == 65.0

    # Candidate with no degree when required -> 0.0 (NO fake 50% default)
    assert compute_education_score(edu_unspecified, jd_bachelor) == 0.0


# ---------------------------------------------------------------------------
# Item 10: Correct Duplicate Resume Tracking & Analytics
# ---------------------------------------------------------------------------

def test_duplicate_resume_tracking(db_session):
    job = Job(
        title="Duplicate Tracking Job",
        description="Testing duplicate handling in SmartATS.",
        required_skills=["Python"]
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)

    pdf_bytes = b"%PDF-1.4\nDuplicate test payload\n%%EOF"
    upload_file_1 = make_mock_file("dup_cand_1.pdf", pdf_bytes)
    bg_tasks = MagicMock()

    # First upload -> ACCEPTED
    res1 = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file_1],
        db=db_session
    ))
    assert res1[0].status == "ACCEPTED"

    # Second upload with identical bytes -> DUPLICATE
    upload_file_2 = make_mock_file("dup_cand_2.pdf", pdf_bytes)
    res2 = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file_2],
        db=db_session
    ))
    assert res2[0].status == "DUPLICATE"
    assert "duplicate" in res2[0].message.lower()

    # Verify duplicate count in job analytics
    analytics_data = matches.get_job_specific_analytics(job.job_id, db_session)
    assert analytics_data["duplicate_count"] >= 1


# ---------------------------------------------------------------------------
# Item 11: File Upload Validation (Magic Bytes & Signatures)
# ---------------------------------------------------------------------------

def test_file_upload_magic_bytes_validation(db_session):
    job = Job(
        title="Security Upload Job",
        description="Testing file signature verification.",
        required_skills=["Python"]
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)

    # Executable disguised as PDF
    fake_pdf = b"MZ\x90\x00\x03\x00\x00\x00Fake executable content"
    upload_file = make_mock_file("malicious.pdf", fake_pdf)
    bg_tasks = MagicMock()

    results = run_coro(resumes.upload_resumes(
        job_id=job.job_id,
        background_tasks=bg_tasks,
        files=[upload_file],
        db=db_session
    ))
    assert results[0].status == "REJECTED"
    assert "signature" in results[0].message.lower()


# ---------------------------------------------------------------------------
# Item 12: Prevent CSV Formula Injection
# ---------------------------------------------------------------------------

def test_csv_formula_injection_defense():
    # Formulas starting with =, +, -, @, \t, \r must be prefixed with a single quote
    assert sanitize_csv_cell("=CMD|' /C calc'!A0") == "'=CMD|' /C calc'!A0"
    assert sanitize_csv_cell("+1+2") == "'+1+2"
    assert sanitize_csv_cell("-100") == "'-100"
    assert sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_csv_cell("Normal Candidate") == "Normal Candidate"

    malicious_item = RankingItem(
        rank=1,
        application_id=1,
        candidate_id=1,
        candidate_name="=cmd|' /C calc'!A0",
        candidate_email="@injected@example.com",
        processing_status="COMPLETED",
        review_stage="New",
        final_score=90.0,
        keyword_score=90.0,
        tfidf_score=90.0,
        applied_at=datetime.now(timezone.utc)
    )
    csv_output = export_rankings_to_csv("Security Role", [malicious_item])
    assert "'=cmd|' /C calc'!A0" in csv_output
    assert "'@injected@example.com" in csv_output


# ---------------------------------------------------------------------------
# Item 13: Protect Sensitive Information (No Internal Paths or Raw Text Dumps)
# ---------------------------------------------------------------------------

def test_sensitive_info_protection(db_session):
    cand = Candidate(
        name="Private Candidate",
        email="private@example.com",
        raw_text="Very long sensitive raw resume text with internal secrets..." * 20
    )
    db_session.add(cand)
    db_session.commit()
    db_session.refresh(cand)

    # General list endpoint must NOT dump raw_text
    candidates_list = candidates.list_candidates(0, 100, db_session)
    cand_in_list = next((c for c in candidates_list if c.candidate_id == cand.candidate_id), None)
    assert cand_in_list is not None
    assert not hasattr(cand_in_list, "raw_text") or cand_in_list.raw_text is None


# ---------------------------------------------------------------------------
# Item 14: Recruiter Authentication & Route Authorization
# ---------------------------------------------------------------------------

def test_recruiter_auth_and_route_authorization():
    # 1. Login with invalid credentials -> 401
    with pytest.raises(HTTPException) as exc_bad:
        auth.recruiter_login(LoginRequest(email="wrong@recruiter.com", password="wrong"))
    assert exc_bad.value.status_code == 401

    # 2. Login with valid default credentials -> 200 + Bearer token
    login_resp = auth.recruiter_login(LoginRequest(
        email=settings.DEFAULT_RECRUITER_EMAIL,
        password=settings.DEFAULT_RECRUITER_PASSWORD
    ))
    assert login_resp.access_token is not None
    assert login_resp.user.email == settings.DEFAULT_RECRUITER_EMAIL

    # 3. Protected route dependency without token -> 401 Unauthorized
    with pytest.raises(HTTPException) as exc_unauth:
        get_current_recruiter(auth=None)
    assert exc_unauth.value.status_code == 401

    # 4. Protected route dependency with valid token -> Succeeds
    auth_creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=login_resp.access_token)
    current_recruiter = get_current_recruiter(auth=auth_creds)
    assert current_recruiter["email"] == settings.DEFAULT_RECRUITER_EMAIL
    assert current_recruiter["role"] == "recruiter"
