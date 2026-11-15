import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.database.database import engine, Base, SessionLocal
from app.database import models  # ensure models are registered
from app.database.models import Application, ApplicationStatusHistory
from app.api import jobs, resumes, candidates, matches, auth

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
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
    except Exception as e:
        logger.error("Error during startup task recovery: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database schemas cleanly without ad hoc ALTER TABLE queries
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)

    # Durability recovery for interrupted background processing
    recover_stale_processing_tasks()

    logger.info("Database initialized successfully.")
    yield
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartATS: AI-Powered Resume Screening & Explainable Hybrid Matching System REST API",
    version="1.0.0",
    lifespan=lifespan
)

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

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}


# Mount built React frontend if distribution files exist (SPA support)
frontend_dist_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    "/app/frontend/dist"
]
frontend_dist = next((p for p in frontend_dist_candidates if os.path.isdir(p)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_frontend(full_path: str):
        # Do not intercept API endpoints or Swagger documentation
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json", "health"):
            raise HTTPException(status_code=404, detail="Endpoint not found")

        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)

        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Page not found")
else:
    @app.get("/", tags=["System"])
    def root():
        return {
            "message": "Welcome to SmartATS API - Explainable Hybrid Resume Screening System",
            "version": "1.0.0",
            "docs_url": "/docs",
            "health": "OK"
        }
