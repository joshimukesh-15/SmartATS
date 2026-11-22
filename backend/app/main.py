import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError, DBAPIError
from sqlalchemy.orm import Session
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.core.middleware import (
    RequestBodySizeLimitMiddleware,
    SecurityHeadersMiddleware,
    RequestIDMiddleware,
    RequestIDLogFilter,
    get_current_request_id
)
from app.core.rate_limit import limiter
from app.database.database import engine, Base, SessionLocal, get_db
from app.database import models  # ensure models are registered
from app.database.models import Application, ApplicationStatusHistory
from app.api import jobs, resumes, candidates, matches, auth, scoring
from app.api.deps import get_current_recruiter

# Configure structured logging with request ID
_log_handler = logging.StreamHandler()
_log_handler.addFilter(RequestIDLogFilter())
_log_handler.setFormatter(
    logging.Formatter("%(asctime)s [%(levelname)s] [req:%(request_id)s] %(name)s: %(message)s")
)
logging.root.handlers = [_log_handler]
logging.root.setLevel(logging.INFO)
logger = logging.getLogger("smartats")


def recover_stale_processing_tasks():
    """
    Durability check: Any applications left in PROCESSING when the server starts
    indicate an interrupted background task (due to a server kill, OOM, or unhandled crash).
    Transitions them to FAILED with an audit history log so they are not left hanging indefinitely.
    """
    try:
        with SessionLocal() as db:
            stale_apps = db.query(Application).filter(Application.processing_status == "PROCESSING").all()
            if stale_apps:
                logger.warning("Found %d applications in stale PROCESSING state on startup; recovering...", len(stale_apps))
                for app in stale_apps:
                    app.processing_status = "FAILED"
                    audit = ApplicationStatusHistory(
                        application_id=app.application_id,
                        from_stage=app.review_stage or "New",
                        to_stage=app.review_stage or "New",
                        note="Processing interrupted by server restart or worker crash; recovered on startup",
                        changed_by="System Recovery"
                    )
                    db.add(audit)
                db.commit()
                logger.info("Successfully recovered %d stale applications to FAILED status.", len(stale_apps))
    except (SQLAlchemyError, DBAPIError, OSError) as e:
        logger.exception("Error during startup task recovery: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Durability recovery for interrupted background processing
    recover_stale_processing_tasks()

    logger.info("Application startup complete.")
    yield
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartATS: AI-Powered Resume Screening & Explainable Hybrid Matching System REST API",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter


def login_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    req_id = getattr(request.state, "request_id", None) or get_current_request_id()
    return JSONResponse(
        status_code=429,
        content={
            "error": "RateLimitExceeded",
            "message": "Too many login attempts. Wait one minute before trying again.",
            "detail": "Too many login attempts. Wait one minute before trying again.",
            "request_id": req_id
        },
        headers={"Retry-After": "60", "X-Request-ID": req_id},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    req_id = getattr(request.state, "request_id", None) or get_current_request_id()
    detail = exc.detail
    message = detail if isinstance(detail, str) else str(detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPException",
            "message": message,
            "detail": detail,
            "request_id": req_id
        },
        headers={"X-Request-ID": req_id}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", None) or get_current_request_id()
    errors = exc.errors()
    message = "; ".join(f"{e.get('loc', [])}: {e.get('msg', '')}" for e in errors)
    return JSONResponse(
        status_code=422,
        content={
            "error": "ValidationError",
            "message": message,
            "detail": errors,
            "request_id": req_id
        },
        headers={"X-Request-ID": req_id}
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", None) or get_current_request_id()
    logger.exception("Unhandled server exception on %s %s [req:%s]: %s", request.method, request.url.path, req_id, exc)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing the request.",
            "detail": str(exc) if settings.ENVIRONMENT != "production" else "Internal server error",
            "request_id": req_id
        },
        headers={"X-Request-ID": req_id}
    )


app.add_exception_handler(RateLimitExceeded, login_rate_limit_exceeded_handler)

# CORS middleware configuration: modern browsers reject allow_credentials=True with allow_origins=["*"]
cors_origins = [o for o in settings.ALLOWED_ORIGINS if o != "*"]
allow_creds = True
if not cors_origins and "*" in settings.ALLOWED_ORIGINS:
    cors_origins = ["*"]
    allow_creds = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request-size checks run inside the security-header middleware so even 413 responses
# receive the same browser security policy as normal API responses.
app.add_middleware(RequestBodySizeLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)

# Mount API Routers (auth remains public, while domain endpoints require recruiter authentication)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(scoring.router, prefix=settings.API_V1_STR)
app.include_router(
    jobs.router,
    prefix=settings.API_V1_STR,
    dependencies=[Depends(get_current_recruiter)]
)
app.include_router(
    resumes.router,
    prefix=settings.API_V1_STR,
    dependencies=[Depends(get_current_recruiter)]
)
app.include_router(
    candidates.router,
    prefix=settings.API_V1_STR,
    dependencies=[Depends(get_current_recruiter)]
)
app.include_router(
    matches.router,
    prefix=settings.API_V1_STR,
    dependencies=[Depends(get_current_recruiter)]
)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}


@app.get("/ready", tags=["System"])
def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe checking database connectivity and upload directory writability."""
    try:
        db.execute(text("SELECT 1"))
    except (SQLAlchemyError, DBAPIError) as e:
        logger.exception("Readiness check database connection failed: %s", e)
        raise HTTPException(status_code=503, detail="Database connection unavailable")

    upload_dir = Path(settings.UPLOAD_DIR).resolve()
    if not upload_dir.exists():
        try:
            upload_dir.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.exception("Readiness check could not create upload directory %s: %s", upload_dir, e)
            raise HTTPException(status_code=503, detail=f"Upload directory unavailable: {e}")
    elif not os.access(upload_dir, os.W_OK):
        raise HTTPException(status_code=503, detail="Upload directory is not writable")

    return {
        "status": "ready",
        "database": "connected",
        "upload_dir": str(upload_dir)
    }


@app.get("/applications/{application_id}/status", tags=["Resumes & Applications"])
def root_application_status_endpoint(application_id: int, db: Session = Depends(get_db)):
    """Root-level alias for application processing status."""
    from app.api.resumes import get_application_status
    return get_application_status(application_id, db)


# Mount built React frontend if distribution files exist (SPA support)
frontend_dist_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    "/app/frontend/dist"
]
frontend_dist = next((p for p in frontend_dist_candidates if os.path.isdir(p)), frontend_dist_candidates[0])

if os.path.isdir(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}", tags=["Frontend"])
async def serve_frontend(full_path: str):
    # Do not intercept API endpoints or Swagger documentation
    if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json", "health"):
        raise HTTPException(status_code=404, detail="Endpoint not found")

    dist = globals().get("frontend_dist", frontend_dist)
    if dist and os.path.isdir(dist):
        resolved = os.path.realpath(os.path.join(dist, full_path))
        real_frontend_dist = os.path.realpath(dist)
        is_safe = False
        try:
            if (
                full_path
                and os.path.isfile(resolved)
                and os.path.commonpath([real_frontend_dist, resolved]) == real_frontend_dist
            ):
                is_safe = True
        except (ValueError, Exception):
            is_safe = False

        if is_safe:
            return FileResponse(resolved)

        index_file = os.path.join(dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)

    if full_path == "":
        return {
            "message": "Welcome to SmartATS API - Explainable Hybrid Resume Screening System",
            "version": "1.0.0",
            "docs_url": "/docs",
            "health": "OK"
        }
    raise HTTPException(status_code=404, detail="Page not found")
