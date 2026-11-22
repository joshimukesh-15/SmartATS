import os
import secrets
import pytest
from unittest.mock import patch
from fastapi import HTTPException
from starlette.responses import FileResponse
from pydantic import ValidationError

from app.main import serve_frontend, frontend_dist
from app.core.config import Settings


def run_coro(coro):
    """Synchronous coroutine runner avoiding event loop issues in Windows pytest."""
    try:
        while True:
            coro.send(None)
    except StopIteration as e:
        return e.value


# ===========================================================================
# 1. SPA Fallback & Path-Traversal Security Tests
# ===========================================================================

@pytest.fixture
def real_dist_path(tmp_path, monkeypatch):
    if frontend_dist and os.path.isdir(frontend_dist) and os.path.isfile(os.path.join(frontend_dist, "index.html")):
        return os.path.realpath(frontend_dist)
    # When frontend/dist is not built (e.g. in backend CI), provide temporary dist fixtures
    mock_dist = tmp_path / "dist"
    mock_dist.mkdir(parents=True, exist_ok=True)
    (mock_dist / "favicon.svg").write_text("<svg></svg>", encoding="utf-8")
    (mock_dist / "index.html").write_text("<!DOCTYPE html><html><body>SmartATS</body></html>", encoding="utf-8")
    monkeypatch.setattr("app.main.frontend_dist", str(mock_dist))
    return os.path.realpath(str(mock_dist))


@pytest.fixture
def index_file_path(real_dist_path):
    index_path = os.path.join(real_dist_path, "index.html")
    assert os.path.isfile(index_path), f"index.html must exist at {index_path}"
    return os.path.realpath(index_path)


@pytest.mark.parametrize("traversal_path", [
    # Relative dot-dot traversal
    "../app/main.py",
    "../../backend/app/main.py",
    "../../../backend/app/main.py",
    "../../backend/smartats.db",
    "../../../backend/smartats.db",
    "../../smartats.db",
    # Windows-style backslashes
    r"..\app\main.py",
    r"..\..\backend\app\main.py",
    r"..\..\smartats.db",
    r"..\..\..\backend\app\main.py",
    # URL-encoded variations (%2e%2e, %2f, %5c)
    "%2e%2e/app/main.py",
    "%2e%2e/%2e%2e/backend/app/main.py",
    "%2e%2e%2f%2e%2e%2fbackend/app/main.py",
    "%2e%2e%5c%2e%2e%5cbackend\\app\\main.py",
    "..%2f..%2fbackend/app/main.py",
    "..%5c..%5cbackend\\app\\main.py",
    "%2e%2e/%2e%2e/smartats.db",
    "%2e%2e%2f%2e%2e%2fsmartats.db",
    # Root / absolute paths to sensitive system files
    "/etc/passwd",
    "/etc/shadow",
    "C:\\Windows\\win.ini",
    "C:/Windows/win.ini",
])
def test_path_traversal_never_returns_sensitive_files(traversal_path, real_dist_path, index_file_path):
    """
    Verify that path traversal attempts with '../', '..\\', '%2e%2e', and URL-encoded
    variations NEVER return files outside frontend_dist, and instead safely fallback
    to index.html.
    """
    response = run_coro(serve_frontend(traversal_path))

    # The response must be a FileResponse
    assert isinstance(response, FileResponse), f"Expected FileResponse for {traversal_path}, got {type(response)}"

    # The served file MUST be within frontend_dist (in fact, it must be the index.html fallback)
    served_real = os.path.realpath(response.path)
    assert os.path.commonpath([real_dist_path, served_real]) == real_dist_path, (
        f"Path traversal vulnerability! Served file {served_real} is outside {real_dist_path}"
    )

    # Must specifically be index.html, NEVER any sensitive file
    assert served_real == index_file_path, f"Expected index.html fallback, but served {served_real}"
    assert "main.py" not in served_real
    assert "smartats.db" not in served_real
    assert "passwd" not in served_real
    assert "win.ini" not in served_real


def test_path_traversal_falls_back_to_404_when_index_missing(real_dist_path):
    """
    Verify that if index.html is absent, path traversal attempts raise 404
    instead of serving any external file or crashing.
    """
    with patch("os.path.isfile", return_value=False):
        with pytest.raises(HTTPException) as exc_info:
            run_coro(serve_frontend("../../backend/app/main.py"))
        assert exc_info.value.status_code == 404
        assert "not found" in exc_info.value.detail.lower()


def test_legitimate_static_file_served(real_dist_path):
    """Verify that legitimate files located inside frontend_dist are served correctly."""
    response = run_coro(serve_frontend("favicon.svg"))
    assert isinstance(response, FileResponse)
    served_real = os.path.realpath(response.path)
    assert os.path.commonpath([real_dist_path, served_real]) == real_dist_path
    assert served_real.endswith("favicon.svg")


def test_spa_client_routes_fallback_to_index(index_file_path):
    """Verify that valid SPA client-side routes fallback to index.html for client-side routing."""
    for spa_route in ["jobs", "overview", "analytics", "review", "candidates/123"]:
        response = run_coro(serve_frontend(spa_route))
        assert isinstance(response, FileResponse)
        assert os.path.realpath(response.path) == index_file_path


@pytest.mark.parametrize("reserved_prefix", [
    "api/v1/jobs",
    "api/v1/auth/login",
    "docs",
    "redoc",
    "openapi.json",
    "health",
])
def test_spa_does_not_shadow_api_or_docs(reserved_prefix):
    """Verify that API endpoints and documentation paths are not shadowed by the SPA fallback."""
    with pytest.raises(HTTPException) as exc_info:
        run_coro(serve_frontend(reserved_prefix))
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Endpoint not found"


# ===========================================================================
# 2. Production Config Validation Tests
# ===========================================================================

def test_production_rejects_default_secret_key():
    """Production must reject default SECRET_KEY."""
    with pytest.raises((ValueError, ValidationError)) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="smartats-secret-key-change-in-production",
            DEFAULT_RECRUITER_EMAIL="prod.recruiter@company.com",
            DEFAULT_RECRUITER_PASSWORD="SecureProductionPass123!",
            ALLOWED_ORIGINS=["https://app.company.com"]
        )
    assert "secret_key" in str(exc_info.value).lower() or "secret" in str(exc_info.value).lower()


@pytest.mark.parametrize("short_key", [
    "",
    "short",
    "1234567890123456789012345678901",  # 31 characters (under 32 minimum)
])
def test_production_rejects_secret_key_under_32_chars(short_key):
    """Production must reject any SECRET_KEY shorter than 32 characters."""
    with pytest.raises((ValueError, ValidationError)) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=short_key,
            DEFAULT_RECRUITER_EMAIL="prod.recruiter@company.com",
            DEFAULT_RECRUITER_PASSWORD="SecureProductionPass123!",
            ALLOWED_ORIGINS=["https://app.company.com"]
        )
    assert "secret_key" in str(exc_info.value).lower() or "32" in str(exc_info.value).lower()


@pytest.mark.parametrize("insecure_key", [
    "secret",
    "changeme",
    "default",
    "admin",
    "password",
])
def test_production_rejects_insecure_secret_keys(insecure_key):
    """Production must reject known weak/insecure SECRET_KEY values."""
    with pytest.raises((ValueError, ValidationError)):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=insecure_key,
            DEFAULT_RECRUITER_EMAIL="prod.recruiter@company.com",
            DEFAULT_RECRUITER_PASSWORD="SecureProductionPass123!",
            ALLOWED_ORIGINS=["https://app.company.com"]
        )


@pytest.mark.parametrize("default_email", [
    "recruiter@smartats.com",
    "Recruiter@SmartATS.com",
    "  recruiter@smartats.com  ",
    "",
])
def test_production_rejects_default_recruiter_email(default_email):
    """Production must reject default recruiter email ('recruiter@smartats.com')."""
    with pytest.raises((ValueError, ValidationError)) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=secrets.token_hex(32),
            DEFAULT_RECRUITER_EMAIL=default_email,
            DEFAULT_RECRUITER_PASSWORD="SecureProductionPass123!",
            ALLOWED_ORIGINS=["https://app.company.com"]
        )
    assert "email" in str(exc_info.value).lower() or "recruiter@smartats.com" in str(exc_info.value).lower()


@pytest.mark.parametrize("weak_password", [
    "recruiter123",
    "Recruiter123",
    "password",
    "admin",
    "admin123",
    "12345678",
    "123456",
    "secret",
    "changeme",
    "root",
    "smartats",
    "short7",  # length < 8
    "",
])
def test_production_rejects_default_and_insecure_passwords(weak_password):
    """Production must reject default password ('recruiter123') and insecure/weak passwords."""
    with pytest.raises((ValueError, ValidationError)) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=secrets.token_hex(32),
            DEFAULT_RECRUITER_EMAIL="prod.recruiter@company.com",
            DEFAULT_RECRUITER_PASSWORD=weak_password,
            ALLOWED_ORIGINS=["https://app.company.com"]
        )
    assert "password" in str(exc_info.value).lower()


def test_production_rejects_wildcard_cors():
    """Production must reject wildcard '*' in ALLOWED_ORIGINS when credentials are enabled."""
    with pytest.raises((ValueError, ValidationError)) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=secrets.token_hex(32),
            DEFAULT_RECRUITER_EMAIL="prod.recruiter@company.com",
            DEFAULT_RECRUITER_PASSWORD="SecureProductionPass123!",
            ALLOWED_ORIGINS=["*"]
        )
    assert "wildcard" in str(exc_info.value).lower() or "allowed_origins" in str(exc_info.value).lower()


@pytest.mark.parametrize("template_key", [
    "REPLACE_WITH_OUTPUT_OF_openssl_rand_-hex_32",
    "a" * 64,
])
def test_production_rejects_template_or_low_variety_secret_keys(template_key):
    with pytest.raises((ValueError, ValidationError)):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=template_key,
            DEFAULT_RECRUITER_EMAIL="prod.recruiter@company.com",
            DEFAULT_RECRUITER_PASSWORD="SecureProductionPass123!",
            ALLOWED_ORIGINS=["https://app.company.com"]
        )


def test_production_rejects_unedited_docker_template_values():
    with pytest.raises((ValueError, ValidationError)):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=secrets.token_hex(32),
            DEFAULT_RECRUITER_EMAIL="REPLACE_WITH_YOUR_RECRUITER_EMAIL",
            DEFAULT_RECRUITER_PASSWORD="REPLACE_WITH_A_LONG_RANDOM_PASSWORD",
            DATABASE_URL="postgresql://smartats:REPLACE_WITH_A_RANDOM_DATABASE_PASSWORD@smartats-db:5432/smartats",
            ALLOWED_ORIGINS=["https://app.company.com"]
        )


def test_production_succeeds_with_valid_configuration():
    """
    Production configuration must succeed when:
    - SECRET_KEY has >= 32 varied characters and is not insecure.
    - DEFAULT_RECRUITER_EMAIL is non-default.
    - DEFAULT_RECRUITER_PASSWORD is non-default, >= 12 characters, and not insecure.
    - ALLOWED_ORIGINS contains explicit domain origins.
    """
    valid_key = secrets.token_hex(32)
    valid_email = "lead.recruiter@enterprisecorp.com"
    valid_password = "Comp!exPr0duct10nP@ssw0rd#2026"
    valid_origins = ["https://smartats.enterprisecorp.com", "https://ats.enterprisecorp.com"]

    prod_settings = Settings(
        ENVIRONMENT="production",
        SECRET_KEY=valid_key,
        DEFAULT_RECRUITER_EMAIL=valid_email,
        DEFAULT_RECRUITER_PASSWORD=valid_password,
        ALLOWED_ORIGINS=valid_origins
    )

    assert prod_settings.ENVIRONMENT == "production"
    assert prod_settings.SECRET_KEY == valid_key
    assert prod_settings.DEFAULT_RECRUITER_EMAIL == valid_email
    assert prod_settings.DEFAULT_RECRUITER_PASSWORD == valid_password
    assert prod_settings.ALLOWED_ORIGINS == valid_origins


def test_development_allows_default_credentials():
    """Development environment permits default credentials and secret key for local development."""
    dev_settings = Settings(ENVIRONMENT="development")
    assert dev_settings.ENVIRONMENT == "development"
    assert dev_settings.DEFAULT_RECRUITER_EMAIL == "recruiter@smartats.com"
    assert dev_settings.DEFAULT_RECRUITER_PASSWORD == "recruiter123"
