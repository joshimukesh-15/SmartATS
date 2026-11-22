import inspect
from datetime import datetime, timezone
from unittest.mock import patch
import pytest
from fastapi import HTTPException
from sqlalchemy import event

from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Candidate, Application, MatchResult, ApplicationNote, ApplicationStatusHistory
from app.schemas.job import JobCreate
from app.api import jobs, candidates, matches, resumes
from app.services.ranking import get_job_rankings
from app.services.processor import process_resume_batch, process_resume_application


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_batch_upload_rescoring_single_trigger(db_session):
    """
    Requirement 1:
    A batch of 10 uploads triggers exactly one rescore_job_applications call.
    Single uploads still rescore once.
    """
    job_in = JobCreate(
        title="Batch Rescore Engineer",
        description="Testing batch rescoring performance with 10 resumes.",
        required_skills=["Python", "FastAPI"]
    )
    job = jobs.create_job(job_in, db_session)
    job_id = job.job_id

    # 1. Test batch upload rescoring: exactly 1 rescore call for 10 applications
    with patch("app.services.scoring.rescore_job_applications") as mock_rescore, \
         patch("app.services.processor.process_resume_application") as mock_single_proc:
        app_ids = list(range(101, 111))
        process_resume_batch(app_ids, job_id=job_id)

        assert mock_single_proc.call_count == 10
        # Each call in the batch must have rescore=False
        for call_args in mock_single_proc.call_args_list:
            assert call_args.kwargs.get("rescore") is False
        # The job rescore function was called exactly ONCE at the end
        assert mock_rescore.call_count == 1
        mock_rescore.assert_called_once_with(job_id)

    # 2. Test single upload rescoring: rescore=True triggers exactly 1 rescore call
    with patch("app.services.scoring.rescore_job_applications") as mock_rescore, \
         patch("app.services.processor.extract_resume_text", return_value=("Python engineer with 5 years experience", False)), \
         patch("app.services.processor.extract_skills", return_value=["Python", "FastAPI"]), \
         patch("app.services.processor.run_hybrid_matching", return_value={
             "keyword_score": 80.0,
             "tfidf_score": 75.0,
             "final_score": 78.0,
             "matched_skills": ["Python"],
             "missing_skills": [],
             "preferred_matched_skills": [],
             "score_explanation": "Great match"
         }):

        cand = Candidate(name="Single Candidate", extracted_skills=["Python"])
        db_session.add(cand)
        db_session.commit()
        db_session.refresh(cand)

        single_app = Application(
            job_id=job_id,
            candidate_id=cand.candidate_id,
            resume_path="dummy/path/single.pdf",
            file_hash="single_app_hash_test_123",
            processing_status="PENDING",
            review_stage="New"
        )
        db_session.add(single_app)
        db_session.commit()
        db_session.refresh(single_app)

        process_resume_application(single_app.application_id, rescore=True)
        assert mock_rescore.call_count == 1


def test_rankings_constant_query_count(db_session):
    """
    Requirement 2:
    Load applications with selectinload for candidate, match_result, notes and status_history
    so the query count does not grow with the number of candidates.
    Asserts SQL query count for 50 seeded applications stays under 8 queries (O(1)).
    """
    job_in = JobCreate(
        title="Query Count Senior Engineer",
        description="Testing selectinload constant query count across 50 applications.",
        required_skills=["Python", "PostgreSQL", "Docker"]
    )
    job = jobs.create_job(job_in, db_session)
    job_id = job.job_id

    # Seed 50 applications with candidate, match_result, note, and status_history
    for i in range(50):
        cand = Candidate(name=f"Candidate {i}", email=f"cand{i}@example.com", extracted_skills=["Python", "Docker"])
        db_session.add(cand)
        db_session.flush()

        app = Application(
            job_id=job_id,
            candidate_id=cand.candidate_id,
            resume_path=f"dummy/path/cand_{i}.pdf",
            file_hash=f"query_count_hash_{i}_{datetime.now(timezone.utc).timestamp()}",
            processing_status="COMPLETED",
            review_stage="Reviewing"
        )
        db_session.add(app)
        db_session.flush()

        match = MatchResult(
            application_id=app.application_id,
            keyword_score=75.0,
            tfidf_score=80.0,
            final_score=77.5,
            matched_skills=["Python"],
            missing_skills=["PostgreSQL"],
            preferred_matched_skills=[]
        )
        db_session.add(match)

        note = ApplicationNote(
            application_id=app.application_id,
            content=f"Initial recruiter note for candidate {i}",
            author="Recruiter Dave"
        )
        db_session.add(note)

        history = ApplicationStatusHistory(
            application_id=app.application_id,
            from_stage="New",
            to_stage="Reviewing",
            changed_by="Recruiter Dave",
            note=f"Moved to Reviewing candidate {i}"
        )
        db_session.add(history)

    db_session.commit()

    # Track SQL queries executed during get_job_rankings
    queries = []

    def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        queries.append(statement)

    event.listen(db_session.bind, "before_cursor_execute", before_cursor_execute)
    try:
        rankings = get_job_rankings(db_session, job_id, limit=50, offset=0)
    finally:
        event.remove(db_session.bind, "before_cursor_execute", before_cursor_execute)

    assert len(rankings.items) == 50
    assert rankings.total == 50
    # Without selectinload, 50 applications would run 1 (job) + 1 (apps) + 50*4 (cand, match, note, history) = 202 queries.
    # With selectinload, it executes 1 for Job, 1 for Applications, and 4 selectinload batch queries = ~6 queries.
    assert len(queries) <= 8, f"Expected <= 8 queries with selectinload, got {len(queries)}"


def test_slim_list_payload(db_session):
    """
    Requirement 3:
    Ranking rows include notes_count, last_note_at and last_stage_change_at
    but NOT the full notes and status_history. Full data comes from GET /applications/{id}.
    """
    job_in = JobCreate(
        title="Slim Payload Engineer",
        description="Testing slim list payload schema against full application endpoint.",
        required_skills=["Go", "Kubernetes"]
    )
    job = jobs.create_job(job_in, db_session)

    cand = Candidate(name="Bob Slim", email="bob.slim@example.com", extracted_skills=["Go"])
    db_session.add(cand)
    db_session.commit()
    db_session.refresh(cand)

    app = Application(
        job_id=job.job_id,
        candidate_id=cand.candidate_id,
        resume_path="dummy/path/bob_slim.pdf",
        file_hash="bob_slim_hash_456",
        processing_status="COMPLETED",
        review_stage="Interview"
    )
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    # Add 2 notes and 2 status history entries
    for idx in range(1, 3):
        db_session.add(ApplicationNote(
            application_id=app.application_id,
            content=f"Note {idx} for Bob",
            author="Interviewer Alice"
        ))
        db_session.add(ApplicationStatusHistory(
            application_id=app.application_id,
            from_stage="Reviewing" if idx == 2 else "New",
            to_stage="Interview" if idx == 2 else "Reviewing",
            changed_by="Interviewer Alice"
        ))
    db_session.commit()

    # 1. Check slim ranking row
    rankings_resp = get_job_rankings(db_session, job.job_id)
    assert len(rankings_resp.items) == 1
    row = rankings_resp.items[0]

    assert row.notes_count == 2
    assert row.last_note_at is not None
    assert row.last_stage_change_at is not None

    dumped_row = row.model_dump()
    assert "notes" not in dumped_row
    assert "status_history" not in dumped_row

    # 2. Check full application endpoint returns complete notes and history
    full_app = resumes.get_application(app.application_id, db_session)
    assert len(full_app.notes) == 2
    assert len(full_app.status_history) == 2
    assert full_app.notes[0].content in ["Note 1 for Bob", "Note 2 for Bob"]


def test_pagination_endpoints(db_session):
    """
    Requirement 4:
    Pagination: jobs, candidates, applications and rankings accept limit
    (default 50, max 200) and offset, and return {items, total, limit, offset}.
    """
    job_in = JobCreate(
        title="Pagination Verification Engineer",
        description="Verifying pagination limit and offset across endpoints.",
        required_skills=["FastAPI"]
    )
    job = jobs.create_job(job_in, db_session)

    # 1. Jobs pagination
    res_jobs = jobs.list_jobs(limit=5, offset=0, db=db_session)
    assert hasattr(res_jobs, "items")
    assert hasattr(res_jobs, "total")
    assert res_jobs.limit == 5
    assert res_jobs.offset == 0

    # 2. Candidates pagination
    res_cand = candidates.list_candidates(limit=5, offset=0, db=db_session)
    assert hasattr(res_cand, "items")
    assert hasattr(res_cand, "total")
    assert res_cand.limit == 5
    assert res_cand.offset == 0

    # 3. Applications pagination (root endpoint)
    res_apps = resumes.list_applications(limit=5, offset=0, db=db_session)
    assert hasattr(res_apps, "items")
    assert hasattr(res_apps, "total")
    assert res_apps.limit == 5
    assert res_apps.offset == 0

    # 4. Job Applications pagination
    res_job_apps = resumes.get_job_applications(job_id=job.job_id, limit=5, offset=0, db=db_session)
    assert hasattr(res_job_apps, "items")
    assert hasattr(res_job_apps, "total")
    assert res_job_apps.limit == 5
    assert res_job_apps.offset == 0

    # 5. Rankings pagination
    res_rank = matches.get_job_rankings_endpoint(job_id=job.job_id, limit=5, offset=0, db=db_session)
    assert hasattr(res_rank, "items")
    assert hasattr(res_rank, "total")
    assert res_rank.limit == 5
    assert res_rank.offset == 0

    # 6. Verify FastAPI Query parameter bounds: limit max is 200, min is 1
    for endpoint in [jobs.list_jobs, candidates.list_candidates, resumes.list_applications, resumes.get_job_applications, matches.get_job_rankings_endpoint]:
        sig = inspect.signature(endpoint)
        limit_param = sig.parameters["limit"]
        ge = next((m.ge for m in limit_param.default.metadata if hasattr(m, "ge")), getattr(limit_param.default, "ge", None))
        le = next((m.le for m in limit_param.default.metadata if hasattr(m, "le")), getattr(limit_param.default, "le", None))
        assert ge == 1
        assert le == 200
        assert limit_param.default.default == 50

        offset_param = sig.parameters["offset"]
        offset_ge = next((m.ge for m in offset_param.default.metadata if hasattr(m, "ge")), getattr(offset_param.default, "ge", None))
        assert offset_ge == 0
        assert offset_param.default.default == 0

    # 7. Reject limit above 200 with 422
    for endpoint in [jobs.list_jobs, candidates.list_candidates, resumes.list_applications, matches.get_job_rankings_endpoint]:
        with pytest.raises(HTTPException) as exc_info:
            if endpoint == matches.get_job_rankings_endpoint:
                endpoint(job_id=job.job_id, limit=201, db=db_session)
            else:
                endpoint(limit=201, db=db_session)
        assert exc_info.value.status_code == 422


def test_scoring_weights_validation_and_normalization(db_session):
    """
    Requirement 5:
    Weight params (w_skills, w_text, w_exp, w_edu): use Query(None, ge=0, le=1);
    reject when all are 0 with a 422; normalize to sum to 1. Tests for negative,
    above 1, all zero and partial inputs.
    """
    job_in = JobCreate(
        title="Weights Validation Engineer",
        description="Testing scoring weights bounds, zero-sum rejection, and normalization.",
        required_skills=["Python"]
    )
    job = jobs.create_job(job_in, db_session)
    job_id = job.job_id

    # 1. Verify Query parameter bounds (ge=0.0, le=1.0)
    sig = inspect.signature(matches.get_job_rankings_endpoint)
    for w_name in ("w_skills", "w_text", "w_exp", "w_edu"):
        param = sig.parameters[w_name]
        ge = next((m.ge for m in param.default.metadata if hasattr(m, "ge")), getattr(param.default, "ge", None))
        le = next((m.le for m in param.default.metadata if hasattr(m, "le")), getattr(param.default, "le", None))
        assert ge == 0.0
        assert le == 1.0
        assert param.default.default is None

    # 2. Negative weight rejects with 422
    with pytest.raises(HTTPException) as exc_info:
        matches.get_job_rankings_endpoint(
            job_id=job_id,
            db=db_session,
            w_skills=-0.2
        )
    assert exc_info.value.status_code == 422

    # 3. Above 1 weight rejects with 422
    with pytest.raises(HTTPException) as exc_info:
        matches.get_job_rankings_endpoint(
            job_id=job_id,
            db=db_session,
            w_skills=1.5
        )
    assert exc_info.value.status_code == 422

    # 4. All zero weights reject with 422
    with pytest.raises(HTTPException) as exc_info:
        matches.get_job_rankings_endpoint(
            job_id=job_id,
            db=db_session,
            w_skills=0.0,
            w_text=0.0,
            w_exp=0.0,
            w_edu=0.0
        )
    assert exc_info.value.status_code == 422
    assert "Weights cannot all be zero" in exc_info.value.detail

    # 5. Partial inputs accepted and normalized to sum to 1.0
    res_partial = matches.get_job_rankings_endpoint(
        job_id=job_id,
        db=db_session,
        w_skills=0.6,
        w_text=0.2
    )
    applied = res_partial.weights_applied
    assert applied is not None
    assert abs(sum(applied.values()) - 1.0) < 1e-2
    assert applied["weight_skills"] > applied["weight_text"]


def test_engine_does_not_point_to_default_database():
    """Asserts that engine URL does not point to default smartats.db during tests."""
    from app.core.config import DEFAULT_DB_PATH
    engine_url = str(engine.url).replace("\\", "/")
    assert DEFAULT_DB_PATH not in engine_url
    assert "smartats-test-" in engine_url or "test.db" in engine_url


def test_overview_analytics_contract_and_invariants(db_session):
    """
    Asserts /analytics/overview clean contract:
    - histogram counts sum to number of completed match results
    - stage counts sum to total applications
    - duplicates are not double-counted
    - top candidates include all-job scope with job title
    """
    job = jobs.create_job(
        JobCreate(
            title="Overview Analytics Architect",
            description="Testing overview analytics contract with verified invariants.",
            required_skills=["Python", "SQL"]
        ),
        db_session
    )

    # Create 3 completed apps with match results and 1 failed
    scores = [42.0, 76.5, 95.0]
    stages = ["Reviewing", "Interviewing", "Offer"]

    for i, (score, stage) in enumerate(zip(scores, stages, strict=True)):
        cand = Candidate(name=f"Overview Cand {i}", email=f"ov_cand_{i}@example.com")
        db_session.add(cand)
        db_session.commit()
        db_session.refresh(cand)

        app = Application(
            job_id=job.job_id,
            candidate_id=cand.candidate_id,
            resume_path=f"dummy/path/ov_{i}.pdf",
            file_hash=f"ov_hash_{i}_{datetime.now(timezone.utc).timestamp()}",
            processing_status="COMPLETED",
            review_stage=stage
        )
        db_session.add(app)
        db_session.commit()
        db_session.refresh(app)

        match = MatchResult(
            application_id=app.application_id,
            keyword_score=score,
            tfidf_score=score,
            final_score=score
        )
        db_session.add(match)

    # 1 Failed app without match result in "New" stage
    cand_fail = Candidate(name="Failed Cand", email="fail@example.com")
    db_session.add(cand_fail)
    db_session.commit()
    db_session.refresh(cand_fail)

    app_fail = Application(
        job_id=job.job_id,
        candidate_id=cand_fail.candidate_id,
        resume_path="dummy/path/fail.pdf",
        file_hash=f"ov_hash_fail_{datetime.now(timezone.utc).timestamp()}",
        processing_status="FAILED",
        review_stage="New"
    )
    db_session.add(app_fail)
    db_session.commit()
    db_session.refresh(app_fail)

    # Add duplicate event history (single source of truth)
    dup_history = ApplicationStatusHistory(
        application_id=app_fail.application_id,
        from_stage="New",
        to_stage="New",
        note="Duplicate resume upload detected (resume_dup.pdf). Skipped redundant processing.",
        changed_by="System"
    )
    db_session.add(dup_history)
    db_session.commit()

    overview = matches.get_platform_overview_analytics(db_session)

    # 1. Total applications and stage distribution invariant
    total_apps = db_session.query(Application).count()
    assert overview.totals.applications == total_apps
    stage_sum = sum(overview.stage_distribution.values())
    assert stage_sum == total_apps, f"Sum of stages {stage_sum} != total applications {total_apps}"

    # Only canonical stages must exist as keys
    expected_stages = {"New", "Reviewing", "Interviewing", "Offer", "Hired", "Rejected"}
    assert set(overview.stage_distribution.keys()) == expected_stages

    # 2. Histogram counts sum to total completed match results
    total_completed_matches = (
        db_session.query(MatchResult)
        .join(Application)
        .filter(Application.processing_status == "COMPLETED", MatchResult.final_score.isnot(None))
        .count()
    )
    histogram_sum = sum(b.count for b in overview.score_histogram)
    assert len(overview.score_histogram) == 6
    assert histogram_sum == total_completed_matches, (
        f"Histogram sum {histogram_sum} != total completed matches {total_completed_matches}"
    )

    # 3. Duplicates blocked is counted from single source (audit events)
    expected_dups = (
        db_session.query(ApplicationStatusHistory)
        .filter(ApplicationStatusHistory.note.like("%Duplicate resume upload%"))
        .count()
    )
    assert overview.totals.duplicates_blocked == expected_dups

    # 4. Top candidates include job title and are ordered descending by score
    assert len(overview.top_candidates) <= 5
    if len(overview.top_candidates) >= 2:
        for idx in range(len(overview.top_candidates) - 1):
            assert overview.top_candidates[idx].final_score >= overview.top_candidates[idx + 1].final_score
            assert overview.top_candidates[idx].job_title
            assert overview.top_candidates[idx].stage in expected_stages

