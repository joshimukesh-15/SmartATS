# SmartATS: AI-Powered Resume Screening & Explainable Hybrid Matching System

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg?logo=react)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/tests-17%2F17%20passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Explainable Recruiter Decision Support Platform**  
> Combines deterministic keyword extraction, TF-IDF lexical cosine similarity, and skill gap diagnostics to generate transparent, auditable candidate rankings.
> Engineered with a research-journal visual aesthetic on warm ivory stone (`#FAF8F5`), high-contrast typography, and a conversion-grade landing page.

Repository: **[https://github.com/joshimukesh-15/SmartATS](https://github.com/joshimukesh-15/SmartATS)**

---

## 1. Project Overview

SmartATS is a resume screening and candidate-ranking platform designed to help recruiters identify suitable candidates for job openings. Rather than operating as a black-box AI tool, SmartATS provides objective, evidence-based recommendations and detailed score breakdowns.

### Key Capabilities
- **Multi-Format Ingestion**: Supports `.pdf` and `.docx` resumes using PyMuPDF and python-docx, with automated OCR fallback via Tesseract for scanned documents.
- **Duplicate Resume Detection**: Computes SHA-256 cryptographic hashes on uploaded documents to catch exact duplicate submissions, and normalizes email addresses to deduplicate candidates across positions.
- **Hybrid Matching Engine**:
  $$\text{Final Score} = (0.60 \times \text{Keyword Score}) + (0.40 \times \text{TF-IDF Cosine Similarity})$$
- **Skill Gap Diagnostics**: Segregates mandatory requirements, missing critical skills, and optional preferred skills.
- **Explainable Ranking**: Delivers mathematical formulas and narrative justifications for every recommendation.
- **Side-by-Side Candidate Comparison**: Compare 2 to 5 candidates on a unified technical skill matrix.
- **Modern Recruiter Dashboard**: High-performance React 19 + Tailwind CSS frontend built following modern web standards.
- **Benchmarking & Export**: Full evaluation script (`scripts/evaluate.py`) measuring Precision@K, Recall@K, and NDCG@K, plus instant CSV exports.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend API** | FastAPI (Python 3.11+) | Asynchronous REST API, Background Tasks |
| **Frontend** | React 19.3, Vite 8, Tailwind CSS | Enterprise Recruiter Dashboard |
| **Icons & UI** | Lucide React | Accessible iconography |
| **Database & ORM** | PostgreSQL & SQLite, SQLAlchemy 2.0 | Persistent relational storage & cascade models |
| **Schema Migrations**| Alembic | Automated schema evolution |
| **PDF Extraction** | PyMuPDF (`fitz`) | High-speed structured PDF text extraction |
| **DOCX Extraction**| `python-docx` | Paragraph and table text parser |
| **OCR Fallback** | `pytesseract` + Tesseract OCR | Scanned document OCR fallback |
| **NLP & Similarity**| `scikit-learn` | TF-IDF vectorization ($n$-grams 1–2) & Cosine Similarity |
| **Data Validation** | Pydantic V2 (`BaseModel`, `ConfigDict`) | Request/response contracts & typing |
| **Evaluation** | Pandas, NumPy | Benchmarking metrics & CSV generation |
| **Testing** | Pytest, Pytest-Asyncio | Automated unit and integration test suite |

---

## 3. System Architecture & Scoring Methodology

```
Candidate Resume (.pdf / .docx)
       │
       ▼
┌─────────────────────────┐
│  Duplicate Hash Check   │──(SHA-256 Match)──> Flag as DUPLICATE
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│ PyMuPDF / python-docx   │──(Low Text)──> Tesseract OCR Fallback
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Regex Entity Extraction │──> Name, Email, Phone
│ Token Skills Taxonomy   │──> Canonical Technical Skills
└─────────────────────────┘
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│  Keyword Skill Matcher  │       │   TF-IDF Vectorizer     │
│ Coverage: Matched / Req │       │ Unigrams + Bigrams      │
│     (Weight: 60%)       │       │  Cosine Sim (Weight: 40%)│
└─────────────────────────┘       └─────────────────────────┘
       │                                 │
       └────────────────┬────────────────┘
                        ▼
       ┌─────────────────────────────────┐
       │ Weighted Hybrid Scoring Engine  │
       │ Score = (0.60×KW) + (0.40×TFIDF)│
       └─────────────────────────────────┘
                        │
                        ▼
       ┌─────────────────────────────────┐
       │ Skill Gap Analysis & Explanation│
       │ • Matched Mandatory Skills      │
       │ • Missing Critical Skills       │
       │ • Preferred Bonus Skills        │
       └─────────────────────────────────┘
                        │
                        ▼
       ┌─────────────────────────────────┐
       │ SQLite / PostgreSQL Storage     │
       │ React 19 Recruiter Dashboard    │
       └─────────────────────────────────┘
```

---

## 4. Benchmark & Evaluation Results

Benchmarking was performed using `scripts/evaluate.py` across labeled candidate datasets:

| Metric | Result | Benchmark Significance |
|---|---|---|
| **Email Extraction Accuracy** | **100.0%** | Regex with RFC validation |
| **Phone Extraction Accuracy** | **100.0%** | International & US digit formatting |
| **Skill Extraction F1-Score** | **98.8%** | Precision: 97.7%, Recall: 100.0% |
| **Extraction Latency** | **3.85 ms** | Per resume processing speed |
| **Hybrid Matching Precision@1**| **1.00** | Top candidate is always relevant |
| **Hybrid Matching Precision@3**| **1.00** | Top 3 candidates are relevant |
| **Hybrid Matching NDCG@3** | **1.000** | Perfect ranking order of relevance |

Full benchmark data is saved in [`reports/evaluation_report.csv`](reports/evaluation_report.csv).

---

## 5. Directory Structure

```
smart-ats/
├── app/
│   ├── main.py                     # FastAPI application entrypoint & static mount
│   ├── api/
│   │   ├── jobs.py                 # Job CRUD endpoints
│   │   ├── candidates.py           # Candidate profile endpoints
│   │   ├── resumes.py              # Resume upload & application handling
│   │   └── matches.py              # Rankings, comparison, analytics & CSV export
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings & environment variables
│   │   └── security.py             # File sanitization & extension validation
│   ├── database/
│   │   ├── database.py             # SQLAlchemy session & engine
│   │   └── models.py               # Relational models (Job, Candidate, Application, MatchResult)
│   ├── schemas/
│   │   ├── job.py                  # Pydantic schemas for jobs
│   │   ├── candidate.py            # Pydantic schemas for candidates
│   │   ├── application.py          # Application upload & response schemas
│   │   └── match.py                # Ranking, comparison & explainability schemas
│   ├── services/
│   │   ├── parser.py               # PDF (PyMuPDF) and DOCX (python-docx) extraction
│   │   ├── ocr.py                  # Tesseract OCR fallback handler
│   │   ├── extractor.py            # Contact & token-boundary skill extraction
│   │   ├── taxonomy.py             # Comprehensive technical skill canonical dictionary
│   │   ├── duplicate.py            # SHA-256 duplicate detection & deduplication
│   │   ├── matcher.py              # Hybrid scoring & explainable breakdown generator
│   │   ├── ranking.py              # Leaderboard ranking service
│   │   ├── comparison.py           # Multi-candidate comparison service
│   │   └── processor.py            # Asynchronous background resume processor
│   ├── ml/
│   │   ├── preprocessing.py        # Text normalization
│   │   ├── vectorizer.py           # TF-IDF cosine similarity computation
│   │   └── evaluation.py           # Precision@K, Recall@K, NDCG@K metrics
│   └── utils/
│       ├── file_handler.py         # Streaming file save with size validation
│       └── exporters.py            # Pandas CSV leaderboard exporter
│
├── frontend/                       # Modern React 19 Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation & view switcher
│   │   │   ├── LandingPageView.jsx # Claude editorial conversion landing page with live simulator
│   │   │   ├── OverviewView.jsx    # Recruiter KPI dashboard & recent jobs
│   │   │   ├── JobsView.jsx        # Job management & tag editor
│   │   │   ├── UploadView.jsx      # Drag-and-drop resume upload & duplicate alerts
│   │   │   ├── RankingsView.jsx    # Candidate leaderboard with score breakdowns
│   │   │   ├── CompareView.jsx     # Side-by-side technical skill matrix
│   │   │   ├── AnalyticsView.jsx   # Skill gap frequency & score distributions
│   │   │   ├── CandidateModal.jsx  # Native <dialog> explainability breakdown
│   │   │   └── CreateJobModal.jsx  # Native <dialog> job creation form
│   │   ├── api.js                  # Frontend API client
│   │   ├── App.jsx                 # Master application controller
│   │   └── index.css               # Tailwind & Modern Web scroll containment
│   ├── package.json
│   └── vite.config.js
│
├── alembic/                        # Database migration scripts
├── tests/                          # 17 Automated pytest unit & integration tests
├── data/
│   ├── resumes/                    # Storage directory for uploaded resumes
│   ├── test_resumes/               # Sample PDF & DOCX test resumes
│   └── evaluation_dataset/         # Labeled evaluation dataset
├── reports/
│   └── evaluation_report.csv       # Exported benchmark metrics
├── scripts/
│   ├── evaluate.py                 # Evaluation & benchmarking runner
│   ├── generate_sample_resumes.py  # Generates test PDF & DOCX documents
│   └── seed_demo_data.py           # Populates DB with initial jobs and candidates
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Production container build
├── docker-compose.yml              # Multi-container orchestration (App + PostgreSQL)
└── README.md
```

---

## 6. Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ (verified on Node v26)

### Option A: Local Development Setup

1. **Clone the repository and install backend dependencies:**
   ```bash
   git clone https://github.com/joshimukesh-15/SmartATS.git
   cd SmartATS
   pip install -r requirements.txt
   ```

2. **Initialize Database Migrations & Seed Demo Data:**
   ```bash
   alembic upgrade head
   python scripts/seed_demo_data.py
   ```

3. **Start the FastAPI Backend:**
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   API Docs available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

4. **Start the React Frontend Dev Server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open your browser at: [http://localhost:5173](http://localhost:5173)

---

### Option B: Docker Container Deployment

Run the complete multi-container stack with PostgreSQL:
```bash
docker-compose up --build -d
```
Access the application directly at [http://localhost:8000](http://localhost:8000).

---

## 7. Testing & Verification

Run the automated test suite covering parsing, extraction, duplicate detection, hybrid matching, and API endpoints:
```bash
python -m pytest -v tests/
```

Run the benchmark evaluation script:
```bash
python scripts/evaluate.py
```

---

## 8. License

MIT License. Designed and engineered for transparent recruiter decision support.
