import os
import tempfile
import pytest

# Configure isolated temporary database and upload directory BEFORE any app module is imported
_tmp = tempfile.mkdtemp(prefix="smartats-test-")
_test_db_path = os.path.join(_tmp, "test.db").replace("\\", "/")
_test_upload_dir = os.path.join(_tmp, "uploads").replace("\\", "/")

os.environ["DATABASE_URL"] = f"sqlite:///{_test_db_path}"
os.environ["ENVIRONMENT"] = "development"
os.environ["UPLOAD_DIR"] = _test_upload_dir
os.makedirs(_test_upload_dir, exist_ok=True)

from app.core.config import DEFAULT_DB_PATH  # noqa: E402
from app.database.database import Base, engine, SessionLocal  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def verify_test_database_isolation():
    """Ensure tests are strictly isolated from the development database."""
    engine_url = str(engine.url).replace("\\", "/")
    assert DEFAULT_DB_PATH not in engine_url, (
        f"CRITICAL SAFETY VIOLATION: Tests are pointing to default dev database {DEFAULT_DB_PATH}!"
    )
    assert "smartats-test-" in engine_url or "test.db" in engine_url, (
        f"Engine URL {engine_url} is not pointing to isolated test database!"
    )


@pytest.fixture(scope="function")
def isolated_db_session():
    """Creates tables in isolated test database and yields a clean session."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
