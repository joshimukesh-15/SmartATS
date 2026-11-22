from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from jose import jwt
import pytest
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.core.config import settings
from app.core.middleware import RequestBodySizeLimitMiddleware, SecurityHeadersMiddleware
from app.core.rate_limit import limiter
from app.core.security import create_access_token, create_refresh_token
from app.database.database import Base, SessionLocal, engine, get_db
from app.database.models import RefreshToken


@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    test_app = FastAPI()
    test_app.state.limiter = limiter

    def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many login attempts. Wait one minute before trying again."},
            headers={"Retry-After": "60"},
        )

    test_app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
    test_app.include_router(auth_router, prefix="/api/v1")
    test_app.include_router(resumes_router, prefix="/api/v1")

    @test_app.get("/health")
    def health():
        return {"status": "healthy"}

    test_app.add_middleware(RequestBodySizeLimitMiddleware)
    test_app.add_middleware(SecurityHeadersMiddleware)

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    limiter._storage.reset()
    test_app.dependency_overrides[get_db] = override_get_db
    with TestClient(test_app) as test_client:
        yield test_client
    test_app.dependency_overrides.pop(get_db, None)
    limiter._storage.reset()


def login(client: TestClient):
    return client.post(
        "/api/v1/auth/login",
        json={"email": settings.DEFAULT_RECRUITER_EMAIL, "password": settings.DEFAULT_RECRUITER_PASSWORD},
    )


def test_sixth_login_attempt_for_same_ip_and_email_is_rate_limited(client: TestClient):
    for _ in range(5):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "limit-check@example.test", "password": "wrong-password"},
        )
        assert response.status_code == 401

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "limit-check@example.test", "password": "wrong-password"},
    )
    assert response.status_code == 429
    assert "one minute" in response.json()["detail"].lower()
    assert response.headers["retry-after"] == "60"

    # The email is part of the key, so a different address has its own counter.
    other_email = client.post(
        "/api/v1/auth/login",
        json={"email": "different@example.test", "password": "wrong-password"},
    )
    assert other_email.status_code == 401


def test_login_issues_30_minute_access_and_7_day_refresh_tokens(client: TestClient):
    response = login(client)
    assert response.status_code == 200
    tokens = response.json()
    access_claims = jwt.get_unverified_claims(tokens["access_token"])
    refresh_claims = jwt.get_unverified_claims(tokens["refresh_token"])
    now = datetime.now(timezone.utc).timestamp()

    assert access_claims["token_type"] == "access"
    assert 29 * 60 < access_claims["exp"] - now <= 30 * 60 + 1
    assert refresh_claims["token_type"] == "refresh"
    assert 7 * 24 * 60 * 60 - 2 < refresh_claims["exp"] - now <= 7 * 24 * 60 * 60 + 1


def test_refresh_rotates_token_and_rejects_revoked_token(client: TestClient):
    original = login(client).json()["refresh_token"]

    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": original})
    assert refreshed.status_code == 200
    replacement = refreshed.json()["refresh_token"]
    assert replacement != original

    reused = client.post("/api/v1/auth/refresh", json={"refresh_token": original})
    assert reused.status_code == 401
    assert "revoked" in reused.json()["detail"].lower()


def test_expired_refresh_token_is_rejected(client: TestClient):
    email = settings.DEFAULT_RECRUITER_EMAIL
    token, jti, expires_at = create_refresh_token(
        {"sub": email, "role": "recruiter", "name": "SmartATS Recruiter"},
        expires_delta=timedelta(seconds=-1),
    )
    db = SessionLocal()
    try:
        db.add(RefreshToken(jti=jti, subject=email, expires_at=expires_at))
        db.commit()
    finally:
        db.close()

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": token})
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_logout_revokes_refresh_session(client: TestClient):
    refresh_token = login(client).json()["refresh_token"]

    logged_out = client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logged_out.status_code == 204

    refresh_after_logout = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert refresh_after_logout.status_code == 401


def test_refresh_token_cannot_be_used_as_access_token(client: TestClient):
    refresh_token = login(client).json()["refresh_token"]
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {refresh_token}"})
    assert response.status_code == 401


def test_security_headers_are_present(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    csp = response.headers["content-security-policy"]
    assert "default-src 'self'" in csp
    assert "frame-ancestors 'none'" in csp


def test_request_size_limit_returns_413_with_security_headers(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "MAX_REQUEST_SIZE_MB", 1)
    response = client.post("/health", content=b"x" * (1024 * 1024 + 1))
    assert response.status_code == 413
    assert "maximum request size is 1 mb" in response.json()["detail"].lower()
    assert response.headers["x-content-type-options"] == "nosniff"


def test_upload_batch_limit_returns_clear_413_before_job_lookup(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "MAX_FILES_PER_REQUEST", 2)
    access_token = login(client).json()["access_token"]
    response = client.post(
        "/api/v1/jobs/999/upload-resumes/",
        headers={"Authorization": f"Bearer {access_token}"},
        files=[("files", (f"resume-{index}.pdf", b"%PDF-test", "application/pdf")) for index in range(3)],
    )

    assert response.status_code == 413
    assert response.json()["detail"] == "Too many files in one request. Maximum is 2 files."


