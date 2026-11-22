from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.rate_limit import limiter, login_rate_limit_key
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.api.deps import get_current_recruiter
from app.database.database import get_db
from app.database.models import RefreshToken

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RecruiterProfile(BaseModel):
    email: str
    role: str
    name: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: RecruiterProfile


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


# Hash the default credentials on module load
DEFAULT_PASSWORD_HASH = hash_password(settings.DEFAULT_RECRUITER_PASSWORD)


def _create_session_tokens(db: Session, email: str) -> LoginResponse:
    user_data = {
        "sub": email,
        "role": "recruiter",
        "name": "SmartATS Recruiter",
    }
    access_token = create_access_token(user_data)
    refresh_token, jti, expires_at = create_refresh_token(user_data)
    db.add(RefreshToken(jti=jti, subject=email, expires_at=expires_at))
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=RecruiterProfile(email=email, role="recruiter", name="SmartATS Recruiter"),
    )


def _invalid_refresh_token() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token is invalid, expired, or revoked. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/login", response_model=LoginResponse)
@limiter.limit(
    "5/minute",
    key_func=login_rate_limit_key,
    error_message="Too many login attempts. Wait one minute before trying again.",
)
def recruiter_login(
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticates a recruiter with email and password.
    Returns a signed JWT bearer access token for authorized recruitment operations.
    """
    is_email_match = (credentials.email.strip().lower() == settings.DEFAULT_RECRUITER_EMAIL.lower())
    is_password_valid = verify_password(credentials.password, DEFAULT_PASSWORD_HASH)

    if not is_email_match or not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid recruiter email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    response = _create_session_tokens(db, settings.DEFAULT_RECRUITER_EMAIL)
    db.commit()
    return response


@router.post("/refresh", response_model=LoginResponse)
def refresh_session(payload: RefreshRequest, db: Session = Depends(get_db)):
    claims = decode_refresh_token(payload.refresh_token)
    if not claims:
        raise _invalid_refresh_token()

    stored_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.jti == claims["jti"],
            RefreshToken.subject == claims["sub"],
        )
        .with_for_update()
        .first()
    )
    if not stored_token or stored_token.revoked_at is not None:
        raise _invalid_refresh_token()

    expires_at = stored_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        raise _invalid_refresh_token()

    stored_token.revoked_at = datetime.now(timezone.utc)
    response = _create_session_tokens(db, claims["sub"])
    db.commit()
    return response


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_session(payload: LogoutRequest, db: Session = Depends(get_db)):
    claims = decode_refresh_token(payload.refresh_token)
    if not claims:
        raise _invalid_refresh_token()

    stored_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.jti == claims["jti"],
            RefreshToken.subject == claims["sub"],
        )
        .first()
    )
    if not stored_token:
        raise _invalid_refresh_token()
    if stored_token.revoked_at is None:
        stored_token.revoked_at = datetime.now(timezone.utc)
        db.commit()
    return None


@router.get("/me", response_model=RecruiterProfile)
def get_current_user(current_recruiter: dict = Depends(get_current_recruiter)):
    """Returns currently authenticated recruiter user profile."""
    return RecruiterProfile(
        email=current_recruiter["email"],
        role=current_recruiter["role"],
        name=current_recruiter["name"]
    )
