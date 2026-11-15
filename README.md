# SmartATS: AI-Powered Resume Screening & Explainable Hybrid Matching System

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg?logo=react)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/tests-17%2F17%20passing-brightgreen.svg)]()
[![Design System](https://img.shields.io/badge/Design_System-Luxury_Editorial_B2B-7B1E3A.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Explainable Recruiter Decision Support Platform**  
> Combines deterministic keyword extraction, TF-IDF lexical cosine similarity, and skill gap diagnostics to generate transparent, auditable candidate rankings.
> Engineered with a luxury editorial B2B design system on warm cream (`#FBF7F2`), deep wine (`#7B1E3A`), accent gold (`#B8893B`), and high-contrast serif typography.

Repository: **[https://github.com/joshimukesh-15/SmartATS](https://github.com/joshimukesh-15/SmartATS)**

---

## 1. Project Overview

SmartATS is an enterprise resume-screening and candidate-ranking platform engineered specifically for talent partners, recruiters, and engineering hiring committees. Rather than operating as an unpredictable generative black box, SmartATS provides objective, evidence-based recommendations, deterministic keyword verification, and fully auditable mathematical scoring.

### Key Capabilities
- **Multi-Format Ingestion**: Supports `.pdf` and `.docx` resumes using PyMuPDF and python-docx, with automated OCR fallback via Tesseract for scanned documents.
- **SHA-256 Binary Deduplication**: Computes cryptographic hashes on raw file payloads before GPU/CPU computation, eliminating duplicate submissions across agencies.
- **Dual-Track Hybrid Matching Engine**:
  $$\text{Final Score} = (0.60 \times \text{Keyword Coverage}) + (0.40 \times \text{Vector TF-IDF Cosine Similarity})$$
- **Explainable Skill Gap Diagnostics**: Segregates mandatory requirements, missing critical skills, and optional preferred skills with exact text verification.
- **Side-by-Side Differential Matrix**: Compare 2 to 5 candidates simultaneously with leading candidate highlighting and shared competency analysis.
- **Luxury Editorial B2B Design System**: High-craft aesthetic featuring cream canvas, deep wine, accent gold, and zero generic AI slop.
- **Award-Style Landing Page**: 10 distinct asymmetric sections, 3D perspective hero with drifting parallax chips, infinite marquee, 4-column bento grid, sticky-scroll workflow, diagonal stats band, browser mockup with clip-path inset reveal, and Lenis-style smooth virtual scrolling.
- **Evaluation & Benchmarking**: Comprehensive suite measuring Precision@K, Recall@K, and NDCG@K, plus instant CSV exports.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend API** | FastAPI (Python 3.11+) | Asynchronous REST API, Background Tasks |
| **Frontend Framework** | React 19.3, Vite 8 | High-density Recruiter Studio & Landing Page |
| **Styling & Tokens** | Tailwind CSS v4, Custom CSS Variables | Strict Luxury Editorial Token Architecture |
| **Icons & UI** | Lucide React | Accessible iconography |
| **Smooth Scrolling** | Custom RAF Lerp Engine | Lenis-style virtual smooth scrolling |
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

## 3. Visual Design System & Color Tokens

SmartATS adheres to a strict luxury B2B design language inspired by premium editorial publications and high-density financial data tools. Generic primary colors (blue, green, purple, bright red) are completely prohibited.

```
Canvas & Base:
  ├── Root Canvas (bg):        #FBF7F2 (Warm Cream)
  ├── Cards & Surfaces:        #FFFFFF (Pure White)
  ├── Surface-Alt:             #F5EEE6 (Subtle Warm Tint)
  └── Hairline Borders:        #E8DDD0 (Warm Architectural Taupe)

Typography Ink:
  ├── Primary Ink:             #2A1015 (Deep Wine-Black)
  ├── Secondary / Muted:       #6B5A55 (Warm Taupe-Gray, WCAG AA Compliant)
  └── Headings:                Playfair Display / Fraunces (Editorial Serif)
  └── UI & Body:               Inter
  └── Numbers & Chips:         JetBrains Mono

Brand Accents (Max 10% Ratio):
  ├── Primary Wine:            #7B1E3A (Hover: #5E1229 | Soft: #F8ECEF)
  └── Accent Gold:             #B8893B (Hover: #9A7230 | Soft: #F7EDD8 | Text: #8A6420)

Score Badges & Progress Tiers:
  ├── High Tier (≥ 80%):       #7B1E3A bg, White text, Wine bar
  ├── Mid Tier (60%–79%):      #F7EDD8 bg, #8A6420 text, Gold bar
  └── Low Tier (< 60%):        #EFE7E1 bg, #6B5A55 text, Warm-gray bar
```

### Motion & Interaction Rules
- **Smooth Virtual Scroll**: Hardware-accelerated `requestAnimationFrame` linear interpolation (ease: `0.085`).
- **Magnetic Buttons**: Follows cursor within a 8px radius with spring-back physics and sliding arrow icon.
- **Viewport Reveals**: 24px vertical translation with 80ms stagger delay via `IntersectionObserver`.
- **Reduced Motion Support**: Automatically detects and respects `prefers-reduced-motion: reduce`.

---

## 4. System Architecture & Scoring Methodology

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
       │ High-Density Recruiter Studio   │
       └─────────────────────────────────┘
```

---

## 5. Benchmark & Evaluation Results

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

## 6. Directory Structure

```
SmartATS/
├── backend/                        # Dedicated Python 3.11+ FastAPI Backend
│   ├── app/                        # Core FastAPI application
│   │   ├── main.py                 # FastAPI application entrypoint & static mount
│   │   ├── api/
│   │   │   ├── jobs.py             # Job CRUD endpoints
│   │   │   ├── candidates.py       # Candidate profile endpoints
│   │   │   ├── resumes.py          # Resume upload & application handling
│   │   │   └── matches.py          # Rankings, comparison, analytics & CSV export
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic BaseSettings & environment variables
│   │   │   └── security.py         # File sanitization & extension validation
│   │   ├── database/
│   │   │   ├── database.py         # SQLAlchemy session & engine
│   │   │   └── models.py           # Relational models (Job, Candidate, Application, MatchResult)
│   │   ├── schemas/
│   │   │   ├── job.py              # Pydantic schemas for jobs
│   │   │   ├── candidate.py        # Pydantic schemas for candidates
│   │   │   ├── application.py      # Application upload & response schemas
│   │   │   └── match.py            # Ranking, comparison & explainability schemas
│   │   ├── services/
│   │   │   ├── parser.py           # PDF (PyMuPDF) and DOCX (python-docx) extraction
│   │   │   ├── ocr.py              # Tesseract OCR fallback handler
│   │   │   ├── extractor.py        # Contact & token-boundary skill extraction
│   │   │   ├── taxonomy.py         # Comprehensive technical skill canonical dictionary
│   │   │   ├── duplicate.py        # SHA-256 duplicate detection & deduplication
│   │   │   ├── matcher.py          # Hybrid scoring & explainable breakdown generator
│   │   │   ├── ranking.py          # Leaderboard ranking service
│   │   │   ├── comparison.py       # Multi-candidate comparison service
│   │   │   └── processor.py        # Asynchronous background resume processor
│   │   ├── ml/
│   │   │   ├── preprocessing.py    # Text normalization
│   │   │   ├── vectorizer.py       # TF-IDF cosine similarity computation
│   │   │   └── evaluation.py       # Precision@K, Recall@K, NDCG@K metrics
│   │   └── utils/
│   │       ├── file_handler.py     # Streaming file save with size validation
│   │       └── exporters.py        # Pandas CSV leaderboard exporter
│   ├── alembic/                    # Database migration scripts
│   ├── tests/                      # 17 Automated pytest unit & integration tests
│   ├── data/
│   │   ├── resumes/                # Storage directory for uploaded resumes
│   │   ├── test_resumes/           # Sample PDF & DOCX test resumes
│   │   └── evaluation_dataset/     # Labeled evaluation dataset
│   ├── reports/
│   │   └── evaluation_report.csv   # Exported benchmark metrics
│   ├── scripts/
│   │   ├── evaluate.py             # Evaluation & benchmarking runner
│   │   ├── generate_sample_resumes.py # Generates test PDF & DOCX documents
│   │   └── seed_demo_data.py       # Populates DB with initial jobs and candidates
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Backend container build
│   ├── alembic.ini                 # Alembic database migration config
│   ├── pytest.ini                  # Pytest runner configuration
│   └── .env.example                # Environment variables template
│
├── frontend/                       # Modern React 19 Frontend (Vite 8 + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top luxury navigation & view switcher
│   │   │   ├── LandingPageView.jsx # Master landing page orchestrator (8 quiet luxury sections)
│   │   │   ├── OverviewView.jsx    # Recruiter KPI dashboard with Score Tiers chart & mini leaderboard
│   │   │   ├── JobsView.jsx        # Job opening cards & tag editor
│   │   │   ├── UploadView.jsx      # Upload dropzone & duplicate detection alerts
│   │   │   ├── RankingsView.jsx    # Candidate leaderboard with tier score badges
│   │   │   ├── CompareView.jsx     # Side-by-side technical skill matrix with winner highlight
│   │   │   ├── AnalyticsView.jsx   # Skill gap frequency diagnostics & stat cards
│   │   │   ├── CandidateModal.jsx  # Native <dialog> explainability breakdown
│   │   │   ├── CreateJobModal.jsx  # Native <dialog> job creation modal
│   │   │   └── landing/            # 8 Quiet Luxury Landing Page Sections
│   │   ├── api.js                  # Frontend API client
│   │   ├── App.jsx                 # Master application shell
│   │   ├── index.css               # Single @theme token source (wine, cream, gold)
│   │   └── index.html              # Instrument Serif, Geist Sans, Geist Mono typography
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml              # Multi-container orchestration (App + PostgreSQL)
├── .gitignore
└── README.md
```

---

## 7. Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ (verified on Node v20/v22/v26)

### Option A: Local Development Setup

1. **Install backend dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Initialize Database Migrations & Seed Demo Data:**
   ```bash
   # From the backend directory:
   python -m alembic upgrade head
   python scripts/seed_demo_data.py
   ```

3. **Start the FastAPI Backend Server:**
   ```bash
   # From the backend directory:
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   Interactive OpenAPI Documentation available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

4. **Start the React Frontend Dev Server:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open your browser at: [http://localhost:5173](http://localhost:5173)

---

### Option B: Docker Multi-Container Deployment

Run the complete production containerized stack with PostgreSQL:
```bash
docker-compose up --build -d
```
Access the application directly at [http://localhost:8000](http://localhost:8000).

---

## 8. Testing & Verification

Run the automated test suite covering parsing, extraction, duplicate detection, hybrid matching, and API endpoints:
```bash
cd backend
python -m pytest -v tests/
```

Run the benchmark evaluation script:
```bash
cd backend
python scripts/evaluate.py
```

Build and lint the production frontend bundle:
```bash
npm --prefix frontend run build
npm --prefix frontend run lint
```

---

## 9. License

MIT License. Designed and engineered for transparent recruiter decision support.
