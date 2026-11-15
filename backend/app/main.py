import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text, inspect
from app.core.config import settings
from app.database.database import engine, Base
from app.database import models  # ensure models are registered
from app.api import jobs, resumes, candidates, matches

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("smartats")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)

    # Safe schema migration check for applications review_stage
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "applications" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("applications")]
                if "review_stage" not in columns:
                    logger.info("Adding missing column review_stage to applications table...")
                    conn.execute(text("ALTER TABLE applications ADD COLUMN review_stage VARCHAR(50) DEFAULT 'New' NOT NULL"))
                    conn.commit()

            if "jobs" in inspector.get_table_names():
                job_columns = [col["name"] for col in inspector.get_columns("jobs")]
                if "custom_weights" not in job_columns:
                    logger.info("Adding missing column custom_weights to jobs table...")
                    conn.execute(text("ALTER TABLE jobs ADD COLUMN custom_weights JSON NULL"))
                    conn.commit()
    except Exception as e:
        logger.warning("Schema migration notice: %s", e)

    logger.info("Database initialized successfully.")
    yield
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartATS: AI-Powered Resume Screening & Explainable Hybrid Matching System REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for modern frontend (React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}


# Mount built React frontend if distribution files exist
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    @app.get("/", tags=["System"])
    def root():
        return {
            "message": "Welcome to SmartATS API - Explainable Hybrid Resume Screening System",
            "version": "1.0.0",
            "docs_url": "/docs",
            "health": "OK"
        }
