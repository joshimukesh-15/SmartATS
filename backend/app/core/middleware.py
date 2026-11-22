from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.config import settings


SECURITY_HEADERS = {
    b"x-content-type-options": b"nosniff",
    b"x-frame-options": b"DENY",
    b"referrer-policy": b"strict-origin-when-cross-origin",
    b"content-security-policy": (
        b"default-src 'self'; base-uri 'self'; object-src 'none'; "
        b"frame-ancestors 'none'; form-action 'self'; "
        b"script-src 'self' 'unsafe-inline'; "
        b"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        b"font-src 'self' https://fonts.gstatic.com data:; "
        b"img-src 'self' data: blob:; frame-src 'self' blob:; "
        b"connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 "
        b"http://localhost:5174 http://127.0.0.1:5174 "
        b"ws://localhost:5174 ws://127.0.0.1:5174"
    ),
}


class SecurityHeadersMiddleware:
    """Add baseline browser security headers to every HTTP response."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_security_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                present = {name.lower() for name, _ in headers}
                headers.extend(
                    (name, value)
                    for name, value in SECURITY_HEADERS.items()
                    if name not in present
                )
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_security_headers)


class RequestBodySizeLimitMiddleware:
    """Enforce a total HTTP request-body cap, including chunked requests."""

    def __init__(self, app: ASGIApp, max_bytes: int | None = None):
        self.app = app
        self.max_bytes = max_bytes

    def _limit(self) -> int:
        return self.max_bytes or settings.MAX_REQUEST_SIZE_MB * 1024 * 1024

    async def _reject(self, scope: Scope, receive: Receive, send: Send) -> None:
        max_mb = max(1, (self._limit() + 1024 * 1024 - 1) // (1024 * 1024))
        response = JSONResponse(
            status_code=413,
            content={"detail": f"Request body is too large. Maximum request size is {max_mb} MB."},
        )
        await response(scope, receive, send)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        max_bytes = self._limit()
        headers = dict(scope.get("headers", []))
        try:
            content_length = int(headers.get(b"content-length", b"0"))
        except (TypeError, ValueError):
            content_length = 0
        if content_length > max_bytes:
            await self._reject(scope, receive, send)
            return

        received = 0

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > max_bytes:
                    raise _RequestBodyTooLarge
            return message

        try:
            await self.app(scope, limited_receive, send)
        except _RequestBodyTooLarge:
            await self._reject(scope, receive, send)


class _RequestBodyTooLarge(Exception):
    pass
