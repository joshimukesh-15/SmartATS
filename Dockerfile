# ==============================================================================
# SmartATS Multi-Stage Dockerfile
# Stage 1: Build React 19 Frontend
# Stage 2: Secure, Lean Python Runtime with Static Assets & Non-Root Execution
# ==============================================================================

# Stage 1: Frontend Build
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.11-slim AS runner
WORKDIR /app

# Prevent Python from writing .pyc and buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend

# Install OS libraries for OCR (Tesseract) and PDF parsing (Poppler), plus curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -s /bin/bash -m appuser && \
    mkdir -p /app/backend/data/resumes /app/frontend/dist && \
    chown -R appuser:appgroup /app

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application source
COPY --chown=appuser:appgroup backend/ /app/backend/

# Copy compiled frontend from Stage 1 into /app/frontend/dist (FastAPI serves it statically)
COPY --from=frontend-builder --chown=appuser:appgroup /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend
USER appuser

EXPOSE 8000

# Container health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
