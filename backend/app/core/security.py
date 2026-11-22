import re
import os
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional, Dict, Any
from uuid import uuid4
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings

logger = logging.getLogger(__name__)


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes uploaded filename by stripping path traversals,
    removing non-alphanumeric chars (preserving extension),
    and appending random entropy to prevent collisions.
    """
    base_name = os.path.basename(filename)
    name, ext = os.path.splitext(base_name)
    
    # Strip dangerous characters and directory traversal
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)[:50]
    safe_ext = ext.lower()
    
    # Add random hex to guarantee uniqueness
    random_suffix = secrets.token_hex(4)
    return f"{safe_name}_{random_suffix}{safe_ext}"


def validate_file_extension(filename: str) -> Tuple[bool, str]:
    """
    Validates allowed file extensions for resume uploads (PDF, DOCX).
    """
    allowed_extensions = {".pdf", ".docx"}
    _, ext = os.path.splitext(filename.lower())
    if ext not in allowed_extensions:
        return False, f"Unsupported file format '{ext}'. Only PDF and DOCX files are supported."
    return True, ""


def hash_password(password: str) -> str:
    """Securely hashes plaintext password with bcrypt (capped at 72 bytes)."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies candidate plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except (ValueError, TypeError) as e:
        logger.exception("Failed to verify password: %s", e)
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates signed JWT access token for authenticated recruiter session."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "token_type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> Tuple[str, str, datetime]:
    """Create a refresh JWT and return it with its revocation id and expiry."""
    to_encode = data.copy()
    jti = str(uuid4())
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "jti": jti, "token_type": "refresh"})
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti, expire


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates JWT token signature and expiration."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode only refresh tokens with a subject and revocation id."""
    payload = decode_access_token(token)
    if (
        not payload
        or payload.get("token_type") != "refresh"
        or not payload.get("sub")
        or not payload.get("jti")
    ):
        return None
    return payload
