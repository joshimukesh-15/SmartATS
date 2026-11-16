import os
import tempfile
from unittest.mock import MagicMock
import pytest
from pydantic import ValidationError
from fastapi import HTTPException
from sqlalchemy import inspect
from alembic.config import Config
from alembic import command
from app.core.config import Settings
from app.database.database import SessionLocal, engine
from app.database.models import Job, Candidate, Application, ApplicationStatusHistory
from app.services.processor import process_resume_application
from app.main import recover_stale_processing_tasks
from app.api import resumes


def test_alembic_fresh_database_initialization():
    """Verify that a clean database initializes completely through Alembic head."""
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    backend_dir = repo_root
    if not os.path.exists(os.path.join(backend_dir, "alembic.ini")):
        backend_dir = os.path.join(repo_root, "backend")

    with tempfile.TemporaryDirectory() as tmpdir:
        test_db_path = os.path.join(tmpdir, "fresh_alembic_test.db").replace("\\", "/")
        test_db_url = f"sqlite:///{test_db_path}"

        ini_path = os.path.join(backend_dir, "alembic.ini")
        alembic_cfg = Config(ini_path)
        alembic_cfg.set_main_option("sqlalchemy.url", test_db_url)
        alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))

        # Run migration to head
        command.upgrade(alembic_cfg, "head")

        # Inspect resulting tables
        from sqlalchemy import create_engine
        test_engine = create_engine(test_db_url)
        try:
            inspector = inspect(test_engine)
            tables = set(inspector.get_table_names())

            expected_tables = {
                "jobs",
                "candidates",
                "applications",
                "application_status_history",
                "application_notes",
                "match_results",
                "alembic_version"
            }
            assert expected_tables.issubset(tables), f"Missing tables: {expected_tables - tables}"

            # Verify critical columns exist
            app_columns = {col["name"] for col in inspector.get_columns("applications")}
            assert "review_stage" in app_columns
            assert "processing_status" in app_columns

            job_columns = {col["name"] for col in inspector.get_columns("jobs")}
            assert "custom_weights" in job_columns
        finally:
            test_engine.dispose()


def test_production_secret_key_rejection():
    """Application must refuse to start in production with default or insecure secrets."""
    # Default secret in production must raise ValidationError
    with pytest.raises(ValidationError):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="smartats-secret-key-change-in-production",
            ALLOWED_ORIGINS=["https://ats.example.com"]
        )

    # Empty or short secret in production must raise ValidationError
    with pytest.raises(ValidationError):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="short",
            ALLOWED_ORIGINS=["https://ats.example.com"]
        )

    # Strong explicit secret in production must succeed
    valid_settings = Settings(
        ENVIRONMENT="production",
        SECRET_KEY="a-very-strong-production-secret-key-minimum-16-bytes",
        DEFAULT_RECRUITER_EMAIL="prod.recruiter@example.com",
        DEFAULT_RECRUITER_PASSWORD="SecureProductionPass123!",
        ALLOWED_ORIGINS=["https://ats.example.com"]
    )
    assert valid_settings.ENVIRONMENT == "production"


def test_production_wildcard_cors_rejection():
    """Application must refuse wildcard '*' CORS origins in production mode."""
    with pytest.raises(ValidationError):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="a-very-strong-production-secret-key-minimum-16-bytes",
            ALLOWED_ORIGINS=["*"]
        )


def test_cors_allowed_origins_parsing():
    """ALLOWED_ORIGINS must correctly parse comma-delimited strings and JSON lists."""
    s1 = Settings(ALLOWED_ORIGINS="https://app.com, https://admin.app.com")
    assert s1.ALLOWED_ORIGINS == ["https://app.com", "https://admin.app.com"]

    s2 = Settings(ALLOWED_ORIGINS='["https://sub.app.com"]')
    assert s2.ALLOWED_ORIGINS == ["https://sub.app.com"]


def test_background_processor_records_failure_and_audit():
    """Exceptions during processing must transition to FAILED and log an audit history record."""
    with SessionLocal() as db:
        # Create job and candidate
        job = Job(
            title="P2 Test Job",
            description="Testing error durability",
            required_skills=["Python"],
            preferred_skills=[]
        )
        db.add(job)
        cand = Candidate(name="Failing Candidate", email="failing@example.com")
        db.add(cand)
        db.commit()

        # Create application pointing to non-existent resume file
        app = Application(
            job_id=job.job_id,
            candidate_id=cand.candidate_id,
            resume_path="./non_existent_path_to_trigger_error.pdf",
            file_hash="dummyhash_p2_failure",
            processing_status="PENDING",
            review_stage="New"
        )
        db.add(app)
        db.commit()
        app_id = app.application_id

    # Run processing synchronously
    process_resume_application(app_id)

    # Verify status and audit history
    with SessionLocal() as db:
        updated_app = db.query(Application).filter(Application.application_id == app_id).first()
        assert updated_app.processing_status == "FAILED"

        history = (
            db.query(ApplicationStatusHistory)
            .filter(ApplicationStatusHistory.application_id == app_id)
            .all()
        )
        assert len(history) >= 1
        latest_audit = history[-1]
        assert "failed" in latest_audit.note.lower() or "error" in latest_audit.note.lower()
        assert latest_audit.changed_by == "System"


def test_startup_recovery_for_stale_processing_tasks():
    """Startup recovery must detect applications stranded in PROCESSING and mark them FAILED."""
    with SessionLocal() as db:
        job = Job(title="Recovery Job", description="Testing recovery", required_skills=["Go"])
        cand = Candidate(name="Stranded Candidate", email="stranded@example.com")
        db.add_all([job, cand])
        db.commit()

        stranded_app = Application(
            job_id=job.job_id,
            candidate_id=cand.candidate_id,
            resume_path="./data/resumes/stranded.pdf",
            file_hash="dummyhash_stranded_recovery",
            processing_status="PROCESSING",
            review_stage="New"
        )
        db.add(stranded_app)
        db.commit()
        app_id = stranded_app.application_id

    # Trigger recovery
    recover_stale_processing_tasks()

    with SessionLocal() as db:
        recovered = db.query(Application).filter(Application.application_id == app_id).first()
        assert recovered.processing_status == "FAILED"

        history = (
            db.query(ApplicationStatusHistory)
            .filter(ApplicationStatusHistory.application_id == app_id)
            .all()
        )
        assert any(h.changed_by == "System Recovery" for h in history)


def test_retry_failed_application_endpoint():
    """Recruiter retry endpoint must reset status to PENDING and write an audit record."""
    with SessionLocal() as db:
        job = Job(title="Retry Test Job", description="Description", required_skills=["React"])
        cand = Candidate(name="Retry Cand", email="retry@cand.com")
        db.add_all([job, cand])
        db.commit()

        # Create dummy file on disk for retry validation
        test_resume_dir = "./data/resumes"
        os.makedirs(test_resume_dir, exist_ok=True)
        test_file_path = os.path.join(test_resume_dir, "test_retry_resume.pdf")
        with open(test_file_path, "wb") as f:
            f.write(b"%PDF-1.4 dummy content")

        app = Application(
            job_id=job.job_id,
            candidate_id=cand.candidate_id,
            resume_path=test_file_path,
            file_hash="dummy_retry_hash_123",
            processing_status="FAILED",
            review_stage="New"
        )
        db.add(app)
        db.commit()
        app_id = app.application_id

        # Missing application -> 404
        with pytest.raises(HTTPException) as exc_404:
            resumes.retry_application_processing(
                application_id=999999,
                background_tasks=MagicMock(),
                db=db,
                current_recruiter={"email": "recruiter@example.com"}
            )
        assert exc_404.value.status_code == 404

        # Valid retry -> returns PENDING status, enqueues task, and records audit history
        bg_mock = MagicMock()
        resp = resumes.retry_application_processing(
            application_id=app_id,
            background_tasks=bg_mock,
            db=db,
            current_recruiter={"email": "recruiter@smartats.com"}
        )
        assert resp.processing_status == "PENDING"
        bg_mock.add_task.assert_called_once()

        history = (
            db.query(ApplicationStatusHistory)
            .filter(ApplicationStatusHistory.application_id == app_id)
            .all()
        )
        assert any("retry" in (h.note or "").lower() for h in history)
        assert any(h.changed_by == "recruiter@smartats.com" for h in history)


def test_docker_and_deployment_files_exist():
    """Verify Dockerfile, .dockerignore, docker-compose.yml, and .env.example meet specifications."""
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    dockerfile = os.path.join(repo_root, "Dockerfile")
    assert os.path.exists(dockerfile), "Dockerfile missing"
    with open(dockerfile, "r", encoding="utf-8") as f:
        content = f.read()
        assert "FROM node:" in content
        assert "FROM python:" in content
        assert "USER appuser" in content

    dockerignore = os.path.join(repo_root, ".dockerignore")
    assert os.path.exists(dockerignore), ".dockerignore missing"

    docker_compose = os.path.join(repo_root, "docker-compose.yml")
    assert os.path.exists(docker_compose), "docker-compose.yml missing"
    with open(docker_compose, "r", encoding="utf-8") as f:
        compose_content = f.read()
        assert "smartats-db" in compose_content
        assert "smartats-app" in compose_content

    env_example = os.path.join(repo_root, ".env.example")
    assert os.path.exists(env_example), ".env.example missing"
    with open(env_example, "r", encoding="utf-8") as f:
        env_content = f.read()
        assert "ENVIRONMENT=" in env_content
        assert "SECRET_KEY=" in env_content
        assert "ALLOWED_ORIGINS=" in env_content
