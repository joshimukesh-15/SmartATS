import json

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings


def login_rate_limit_key(request: Request) -> str:
    """Rate-limit login attempts by the client IP and normalized email pair."""
    client_ip = get_remote_address(request) or "unknown"
    raw_body = getattr(request, "_body", b"")
    email = "unknown"
    try:
        body = json.loads(raw_body) if raw_body else {}
        email = str(body.get("email") or "unknown").strip().lower() or "unknown"
    except (TypeError, ValueError, AttributeError):
        pass
    return f"{client_ip}:{email}"


limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.RATE_LIMIT_STORAGE_URI,
    headers_enabled=False,
)
