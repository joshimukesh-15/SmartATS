FROM python:3.11-slim
WORKDIR /app

# Install system dependencies including Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . .

# Expose port
EXPOSE 8000

# Set environment
ENV ENVIRONMENT=production
ENV DATABASE_URL=sqlite:///./smartats.db

# Run uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
