import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.main import app
from app.api.deps import get_current_recruiter
from app.core.security import create_access_token
from app.core.config import settings


@pytest.fixture
def valid_recruiter_token():
    return create_access_token({"sub": settings.DEFAULT_RECRUITER_EMAIL, "role": "recruiter"})


@pytest.mark.parametrize("endpoint_path,method", [
    ("/api/v1/jobs/", "GET"),
    ("/api/v1/candidates/", "GET"),
    ("/api/v1/jobs/{job_id}/analytics", "GET"),
    ("/api/v1/jobs/{job_id}/rankings/", "GET"),
    ("/api/v1/applications/{application_id}/download", "GET"),
    ("/api/v1/applications/{application_id}/preview", "GET"),
])
def test_endpoints_have_recruiter_auth_dependency(endpoint_path, method):
    """
    Parametrized security test verifying that critical domain endpoints
    (jobs list, candidates, analytics, rankings, resume download and preview)
    strictly enforce get_current_recruiter dependency.
    """
    matching_routes = [
        r for r in app.routes
        if getattr(r, "path", None) == endpoint_path and method in getattr(r, "methods", [])
    ]
    assert len(matching_routes) > 0, f"Route {endpoint_path} [{method}] not found in app routes"
    route = matching_routes[0]
    dep_calls = [dep.call for dep in route.dependant.dependencies]
    assert get_current_recruiter in dep_calls, f"get_current_recruiter not attached to {endpoint_path}"


@pytest.mark.parametrize("endpoint_path,method", [
    ("/api/v1/jobs/", "GET"),
    ("/api/v1/candidates/", "GET"),
    ("/api/v1/jobs/{job_id}/analytics", "GET"),
    ("/api/v1/jobs/{job_id}/rankings/", "GET"),
    ("/api/v1/applications/{application_id}/download", "GET"),
    ("/api/v1/applications/{application_id}/preview", "GET"),
])
def test_endpoints_raise_401_without_token(endpoint_path, method):
    """
    Parametrized security test verifying that all listed endpoints return 401 without a token.
    """
    matching_routes = [
        r for r in app.routes
        if getattr(r, "path", None) == endpoint_path and method in getattr(r, "methods", [])
    ]
    assert len(matching_routes) > 0
    route = matching_routes[0]
    
    # Check that route contains get_current_recruiter dependency
    auth_dep = next((dep for dep in route.dependant.dependencies if dep.call == get_current_recruiter), None)
    assert auth_dep is not None, f"Route {endpoint_path} missing get_current_recruiter dependency"
    
    # Calling the auth dependency without token raises 401
    with pytest.raises(HTTPException) as exc_info:
        auth_dep.call(None)
    assert exc_info.value.status_code == 401
    assert "authentication required" in exc_info.value.detail.lower()


def test_auth_login_endpoint_is_public():
    """Verifies that /auth/login remains public without get_current_recruiter dependency."""
    login_routes = [
        r for r in app.routes
        if getattr(r, "path", None) == "/api/v1/auth/login" and "POST" in getattr(r, "methods", [])
    ]
    assert len(login_routes) > 0
    route = login_routes[0]
    dep_calls = [dep.call for dep in route.dependant.dependencies]
    assert get_current_recruiter not in dep_calls


def test_get_current_recruiter_without_token_raises_401():
    """Verifies that calling get_current_recruiter without credentials raises 401 Unauthorized."""
    with pytest.raises(HTTPException) as exc_info:
        get_current_recruiter(None)
    assert exc_info.value.status_code == 401
    assert "authentication required" in exc_info.value.detail.lower()


def test_get_current_recruiter_with_invalid_token_raises_401():
    """Verifies that calling get_current_recruiter with invalid token raises 401 Unauthorized."""
    invalid_creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid.token.here")
    with pytest.raises(HTTPException) as exc_info:
        get_current_recruiter(invalid_creds)
    assert exc_info.value.status_code == 401
    assert "invalid or expired" in exc_info.value.detail.lower()


def test_get_current_recruiter_with_valid_token_succeeds(valid_recruiter_token):
    """Verifies that calling get_current_recruiter with valid token returns the recruiter dict."""
    valid_creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=valid_recruiter_token)
    user = get_current_recruiter(valid_creds)
    assert user["email"] == settings.DEFAULT_RECRUITER_EMAIL
    assert user["role"] == "recruiter"
