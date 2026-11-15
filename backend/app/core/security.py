import re
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings


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
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates signed JWT access token for authenticated recruiter session."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates JWT token signature and expiration."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
