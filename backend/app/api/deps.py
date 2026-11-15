from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.core.config import settings

security_bearer = HTTPBearer(auto_error=False)


def get_current_recruiter(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
) -> dict:
    """
    Enforces recruiter authentication via Bearer JWT.
    Returns 401 Unauthorized if no valid credentials are provided.
    """
    if auth and auth.credentials:
        payload = decode_access_token(auth.credentials)
        if payload and payload.get("sub"):
            return {
                "email": payload["sub"],
                "role": payload.get("role", "recruiter"),
                "name": payload.get("name", "Recruiter")
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please log in as a recruiter.",
        headers={"WWW-Authenticate": "Bearer"}
    )
