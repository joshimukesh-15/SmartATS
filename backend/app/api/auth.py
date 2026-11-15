from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.config import settings
from app.core.security import verify_password, hash_password, create_access_token
from app.api.deps import get_current_recruiter

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
    token_type: str = "bearer"
    user: RecruiterProfile


# Hash the default credentials on module load
DEFAULT_PASSWORD_HASH = hash_password(settings.DEFAULT_RECRUITER_PASSWORD)


@router.post("/login", response_model=LoginResponse)
def recruiter_login(credentials: LoginRequest):
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

    token = create_access_token(data={
        "sub": settings.DEFAULT_RECRUITER_EMAIL,
        "role": "recruiter",
        "name": "SmartATS Recruiter"
    })

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=RecruiterProfile(
            email=settings.DEFAULT_RECRUITER_EMAIL,
            role="recruiter",
            name="SmartATS Recruiter"
        )
    )


@router.get("/me", response_model=RecruiterProfile)
def get_current_user(current_recruiter: dict = Depends(get_current_recruiter)):
    """Returns currently authenticated recruiter user profile."""
    return RecruiterProfile(
        email=current_recruiter["email"],
        role=current_recruiter["role"],
        name=current_recruiter["name"]
    )
