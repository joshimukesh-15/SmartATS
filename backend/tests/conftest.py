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

from app.core.config import DEFAULT_DB_PATH, settings  # noqa: E402
from app.database.database import Base, engine, SessionLocal, get_db  # noqa: E402
from app.core.security import create_access_token  # noqa: E402
from app.main import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session")
def auth_headers():
    """Generates an authenticated recruiter Bearer token."""
    token = create_access_token({"sub": settings.DEFAULT_RECRUITER_EMAIL, "role": "recruiter"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def client(auth_headers, request):
    """Provides a TestClient pre-configured with valid recruiter auth headers and shared db session."""
    db = None
    if "db_session" in request.fixturenames:
        db = request.getfixturevalue("db_session")
    elif "isolated_db_session" in request.fixturenames:
        db = request.getfixturevalue("isolated_db_session")

    if db is not None:
        def override_get_db():
            yield db
        app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        c.headers.update(auth_headers)
        yield c

    if db is not None:
        app.dependency_overrides.pop(get_db, None)


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
