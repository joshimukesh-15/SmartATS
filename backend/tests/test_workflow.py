import pytest
from fastapi import HTTPException
from app.database.database import SessionLocal, Base, engine
from app.database.models import Job, Candidate, Application
from app.schemas.job import JobCreate
from app.schemas.application import (
    ApplicationStatusUpdateRequest,
    ApplicationNoteCreateRequest
)
from app.api import jobs, resumes
from app.services.ranking import get_job_rankings


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_applicant_review_workflow(db_session):
    # 1. Create a Job
    job_in = JobCreate(
        title="Workflow Senior Engineer",
        description="Workflow test job",
        required_skills=["Python", "FastAPI"],
        preferred_skills=["Docker"]
    )
    job = jobs.create_job(job_in, db_session)

    # 2. Create Candidate & Application
    candidate = Candidate(name="Alice Reviewer", extracted_skills=["Python", "FastAPI"])
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)

    application = Application(
        job_id=job.job_id,
        candidate_id=candidate.candidate_id,
        resume_path="/dummy/path/alice.pdf",
        file_hash="workflow_hash_123",
        processing_status="COMPLETED",
        review_stage="New"
    )
    db_session.add(application)
    db_session.commit()
    db_session.refresh(application)

    app_id = application.application_id

    # 3. Check initial review stage
    fetched_app = resumes.get_application(app_id, db_session)
    assert fetched_app.review_stage == "New"

    # 4. Transition stage to "Reviewing" with a note
    update_req = ApplicationStatusUpdateRequest(
        stage="Reviewing",
        note="Initial recruiter screening underway",
        changed_by="Recruiter Sarah"
    )
    updated = resumes.update_application_stage(app_id, update_req, db_session)
    assert updated.review_stage == "Reviewing"

    # 5. Transition stage to "Interview"
    update_req_2 = ApplicationStatusUpdateRequest(
        stage="Interview",
        note="Scheduled technical round",
        changed_by="Recruiter Sarah"
    )
    resumes.update_application_stage(app_id, update_req_2, db_session)

    # 6. Add standalone recruiter note
    note_req = ApplicationNoteCreateRequest(
        content="Candidate showed strong system design grasp in technical screen.",
        author="Interviewer Dave"
    )
    added_note = resumes.add_application_note(app_id, note_req, db_session)
    assert added_note.note_id is not None
    assert added_note.content == "Candidate showed strong system design grasp in technical screen."
    assert added_note.author == "Interviewer Dave"

    # 7. Check workflow history
    history_resp = resumes.get_application_workflow_history(app_id, db_session)
    assert history_resp.review_stage == "Interview"
    assert len(history_resp.status_history) >= 2
    assert len(history_resp.notes) >= 2  # status note + standalone note

    # Check stage audit entries
    stages_in_history = [h.to_stage for h in history_resp.status_history]
    assert "Interview" in stages_in_history
    assert "Reviewing" in stages_in_history

    # 8. Check invalid stage raises 400
    with pytest.raises(HTTPException) as exc_info:
        invalid_req = ApplicationStatusUpdateRequest(stage="NonExistentStage")
        resumes.update_application_stage(app_id, invalid_req, db_session)
    assert exc_info.value.status_code == 400

    # 9. Verify get_job_rankings returns review_stage and notes
    rankings = get_job_rankings(db_session, job.job_id)
    assert len(rankings.rankings) == 1
    rank_item = rankings.rankings[0]
    assert rank_item.review_stage == "Interview"
    assert len(rank_item.notes) >= 2
    assert len(rank_item.status_history) >= 2
