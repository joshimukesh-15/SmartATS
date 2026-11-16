# SmartATS: AI-Powered Resume Screening & Explainable Hybrid Matching System

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg?logo=react)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Backend Tests](https://img.shields.io/badge/backend%20tests-59%2F59%20passing-brightgreen.svg)]()
[![Frontend Tests](https://img.shields.io/badge/frontend%20tests-41%2F41%20passing-brightgreen.svg)]()
[![Design System](https://img.shields.io/badge/Design_System-Quiet_Luxury_B2B-14141A.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Explainable Recruiter Decision Support Platform**  
> Combines deterministic keyword extraction, TF-IDF lexical cosine similarity, and 4-pillar multi-factor evaluation (Skills, Text, Experience, Education) to generate transparent, auditable candidate rankings.
> Engineered with a luxury editorial B2B design system on warm cream (`#FBF7F2`), deep wine (`#7B1E3A`), accent gold (`#B8893B`), and high-contrast serif typography.

Repository: **[https://github.com/joshimukesh-15/SmartATS](https://github.com/joshimukesh-15/SmartATS)**

---

## 1. Project Overview

SmartATS is an enterprise resume-screening and candidate-ranking platform engineered specifically for talent partners, recruiters, and engineering hiring committees. Rather than operating as an unpredictable generative black box, SmartATS provides objective, evidence-based recommendations, deterministic keyword verification, and fully auditable mathematical scoring.

### Key Capabilities
- **Multi-Format Ingestion**: Supports `.pdf` and `.docx` resumes using PyMuPDF and python-docx, with automated OCR fallback via Tesseract for scanned documents.
- **SHA-256 Binary Deduplication**: Computes cryptographic hashes on raw file payloads before GPU/CPU computation, eliminating duplicate submissions across agencies.
- **Unified 4-Pillar Multi-Factor Scoring**:
  $$\text{Final Score} = (w_{\text{skills}} \times \text{Skills}) + (w_{\text{text}} \times \text{Semantic Text}) + (w_{\text{exp}} \times \text{Experience}) + (w_{\text{edu}} \times \text{Education})$$
  Default recruiter weights: **Skills: 40%**, **Semantic Text: 20%**, **Experience Fit: 25%**, **Education: 15%**. Recruiter-configurable per job opening with automatic normalization to 1.0.
- **Explainable Skill Gap Diagnostics**: Segregates mandatory requirements, missing critical skills, and optional preferred skills with exact text verification.
- **Candidate Review Studio (`/studio/review`)**: Dedicated candidate evaluation dossier with interactive recruitment pipeline stages (New, Reviewing, Interview, Hired, Rejected), chronological audit timeline, and recruiter notes.
- **Side-by-Side Differential Matrix**: Compare 2 to 5 candidates simultaneously with leading candidate highlighting and shared competency analysis.
- **Luxury Editorial B2B Design System**: High-craft aesthetic featuring cream canvas, deep wine, accent gold, and zero generic AI slop.
- **Enterprise Security & Reliability**: OWASP CSV formula injection defense, file magic bytes validation (`%PDF-`, `PK\x03\x04`), zip-bomb protection, JWT authentication for recruiter actions, and background task crash recovery.
- **Production Containerization**: Multi-stage Dockerfile (Node 22 build -> Python 3.11-slim non-root runtime) with health checks and Docker Compose.

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
| **Testing** | Pytest, Vitest, Oxlint | Automated unit, regression, and linting test suites |

---

## 3. Visual Design System & Color Tokens

SmartATS adheres to a quiet luxury, data-first B2B design language built for talent partners and hiring managers. Serif typography, all-caps eyebrows, and saturated red/green/amber tiers are strictly avoided. All numbers use `tabular-nums` alignment, and all UI text meets or exceeds the strict 13px accessibility floor.

### Color Tokens

```
Light Mode Tokens:
  ├── Canvas:                  #F7F6F3 (Warm Architectural Paper)
  ├── Surface:                 #FFFFFF (Pure Elevated Surface)
  ├── Surface-Alt:             #F0EEEA (Subtle Tonal Tint)
  ├── Line / Border:           #E3E0DA (Hairline Divider Structure)
  ├── Ink (Primary Text):      #14141A (Graphite-Ink, AAA Contrast)
  ├── Ink-Muted:               #62626B (Accessible Secondary Ink, AA Contrast)
  ├── Ink-Subtle:              #8A8A93 (Tertiary Labeling)
  ├── Primary:                 #14141A (On-Primary: #FFFFFF)
  ├── Champagne (Accent):      #B8963E (Text Match & Precision Highlight)
  ├── Champagne-Soft:          #F4ECD8 (Tonal Chip Background)
  └── Danger:                  #B42318 (Destructive Actions Only)

Dark Mode Tokens (via .dark class on <html>):
  ├── Canvas:                  #0E0E12
  ├── Surface:                 #17171C
  ├── Surface-Alt:             #1F1F26
  ├── Line / Border:           #2A2A32
  ├── Ink (Primary Text):      #F4F3F0
  ├── Ink-Muted:               #A1A1AA
  ├── Ink-Subtle:              #75757E
  ├── Primary:                 #F4F3F0 (On-Primary: #0E0E12)
  ├── Champagne (Accent):      #D4B15A
  ├── Champagne-Soft:          #2A2412
  └── Danger:                  #B42318
```

### Multi-Segment Score Progression

```
4-Pillar Score Decomposition:
  ├── Primary Segment:         Skills Covered Points (0.40 × Coverage %)
  ├── Champagne Segment:       Semantic Text Match Points (0.20 × Similarity %)
  ├── Ink-Muted Segment:       Experience Fit Points (0.25 × Experience Fit %)
  └── Champagne/40 Segment:    Education Points (0.15 × Education Score %)
  Note: Saturated traffic-light tiers (red/green/amber) are purged across the app. All four segments compose the 100% total progress.
```

### Geist Type Scale & Hierarchy

| Role | Font Size | Weight | Line Height | Tracking | Tailwind Utility |
|---|---|---|---|---|---|
| **Page Title** | 30px | 600 (`font-semibold`) | 1.15 | `-0.03em` | `text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]` |
| **Section Title** | 22px | 600 (`font-semibold`) | 1.25 | `-0.02em` | `text-[22px] font-semibold text-ink tracking-[-0.02em] leading-[1.25]` |
| **Card / Panel Title** | 17px | 600 (`font-semibold`) | 1.35 | normal | `text-[17px] font-semibold leading-[1.35]` |
| **Body Text** | 15px | 400 (`font-normal`) | 1.60 | normal | `text-[15px] leading-[1.6]` |
| **Secondary / Small** | 13px | 400 / 500 | 1.50 | normal | `text-[13px] leading-[1.5]` (Strict 13px floor) |
| **Interactive Labels** | 13px–15px | 500 (`font-medium`) | 1.40 | normal | `font-medium` |
| **Numeric Figures** | Any | 500 / 600 | normal | normal | `tabular-nums` applied universally |

### Elevation & Depth Hierarchy

| Elevation Token | Box Shadow Values | Purpose |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(20, 20, 26, 0.04)` | Subtle panel boundaries, chips, stat strips |
| `--shadow-sm` | `0 1px 2px rgba(20, 20, 26, 0.05), 0 4px 12px -2px rgba(20, 20, 26, 0.06)` | Standard cards, CandidateDetailPanel, popovers |
| `--shadow-md` | `0 2px 4px rgba(20, 20, 26, 0.04), 0 12px 32px -8px rgba(20, 20, 26, 0.12)` | Floating dropdowns, context menus, command palette |
| `--shadow-lg` | `0 24px 64px -16px rgba(20, 20, 26, 0.28)` | Dialog modals, drawer slide-overs, floating selection bar |
| **Dark Inset** | `inset 0 1px 0 rgba(255, 255, 255, 0.04)` | 1px top edge highlight on panels in dark mode |

### Motion & Interaction Guidelines

- **Primary Timing Curve**: `ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`) for snappy yet natural movement.
- **Duration Budget**:
  - `150ms`: Hover transitions, button clicks, and micro-interactions.
  - `250ms`: Accordion drawers, tabs, and panel slide-overs.
  - `350ms`: Candidate list layout re-ordering on skill toggles.
  - `500ms–600ms`: Animated SVG score ring, score count-ups, and hero section entrances.
- **Micro-Interactions**:
  - Buttons: tactile `active:scale-[0.98]` physical compression.
  - Link Hover: hairline underline drawing from left to right.
  - Accordion: rotating chevrons with `transition-transform duration-250 ease-out`.
- **Accessibility & Motion Preference**:
  - All motion queries strictly respect `@media (prefers-reduced-motion: reduce)`.
  - When reduced motion is requested, spatial transforms (`translateY`, `scale`) are disabled in favor of subtle opacity-only transitions or instant state changes.
  - Visible focus indicators (`2px solid var(--primary)` with `2px offset`) are guaranteed on all interactive controls.

### Design Primitives & Controls

- **`Avatar` (`frontend/src/components/ui/Avatar.jsx`)**: Circular 32px token with deterministic subtle ink/champagne tinting based on name initials, with image error fallback.
- **`Kbd` (`frontend/src/components/ui/Kbd.jsx`)**: 13px keyboard shortcut key cap with `surface-alt` background, 1px line border, and `rounded-[6px]`.
- **`ProductFrame` (`frontend/src/components/landing/ProductFrame.jsx`)**: Browser chrome preview frame with 3 window controls, centered secure address bar, and elevation shadow.
- **`SelectionBar` (`frontend/src/features/leaderboard/SelectionBar.jsx`)**: 40px floating graphite pill with `shadow-lg` for multi-candidate comparison workflows.
- **`ScoreBar` (`frontend/src/components/ui/ScoreBar.jsx`)**: Accessible 4-pillar score progress bar with ARIA attributes and custom segmented widths (Skills, Text Match, Experience Fit, Education).
- **`Radii Scale`**: `rounded-[24px]` for hero and CTA containers, `rounded-[14px]` for structural panels, `rounded-[10px]` for interactive controls, `rounded-[8px]` for tags and chips.

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
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│Required Skills││Semantic Text ││Experience Fit││  Education   │
│Coverage %    ││TF-IDF Sim    ││Title & Yrs   ││Level & Degree│
│(Weight: 40%) ││(Weight: 20%) ││(Weight: 25%) ││(Weight: 15%) │
└──────────────┘└──────────────┘└──────────────┘└──────────────┘
       │              │              │              │
       └──────────────┴───────┬──────┴──────────────┘
                              ▼
       ┌────────────────────────────────────────────────────────┐
       │             Deterministic 4-Pillar Scoring Engine      │
       │ Score = (0.40×Skills) + (0.20×Text) + (0.25×Exp) + (0.15×Edu)│
       └────────────────────────────────────────────────────────┘
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

## 7. Environment Configuration

All configuration is managed via environment variables (or a local `.env` file). See `.env.example` for details:

| Variable | Default Value | Description |
|---|---|---|
| `PROJECT_NAME` | `SmartATS` | System project name displayed in API and logs |
| `ENVIRONMENT` | `development` | Deployment environment: `development` or `production` |
| `SECRET_KEY` | `smartats-secret-key-change-in-production` | Secret key for JWT tokens. **Must be >= 16 chars in production** |
| `ALGORITHM` | `HS256` | JWT signature algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24h) | Token lifespan before expiration |
| `DEFAULT_RECRUITER_EMAIL` | `recruiter@smartats.com` | Initial recruiter account email |
| `DEFAULT_RECRUITER_PASSWORD` | `recruiter123` | Initial recruiter account password |
| `DATABASE_URL` | `sqlite:///./smartats.db` | Relational database connection string (SQLite or PostgreSQL) |
| `UPLOAD_DIR` | `./data/resumes` | Directory path for candidate resume files |
| `MAX_UPLOAD_SIZE_MB` | `15` | Maximum allowed resume file size in megabytes |
| `TESSERACT_CMD` | `""` | Optional system path to Tesseract OCR executable |
| `OCR_MIN_TEXT_LENGTH` | `60` | Minimum character threshold before triggering OCR fallback |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated CORS allowed domains (**No '*' in production**) |

---

## 8. Authentication & Core API Endpoints

All recruiter mutation routes require a valid JWT Bearer token in the `Authorization: Bearer <token>` header.

### Recruiter Authentication
- `POST /api/v1/auth/login`: Authenticates recruiter credentials and returns a Bearer access token.
- `GET /api/v1/auth/me`: Retrieves current authenticated recruiter profile.

### Jobs & Scoring Weights
- `GET /api/v1/jobs/`: Lists all open job requisitions with application counts.
- `POST /api/v1/jobs/`: Creates a new job requisition (supports optional `custom_weights`).
- `PUT /api/v1/jobs/{job_id}`: Updates job details or configures custom 4-pillar scoring weights.
- `GET /api/v1/scoring/config`: Retrieves default 4-pillar scoring weights and deterministic formula description.

### Resume Ingestion & Processing
- `POST /api/v1/jobs/{job_id}/upload-resumes/`: Uploads resumes, executes SHA-256 duplicate checks, verifies file magic bytes (`%PDF-`, `PK\x03\x04`), and queues background parsing.
- `POST /api/v1/applications/{id}/retry`: Manually re-queues a failed or interrupted application for processing.
- `GET /api/v1/applications/{id}/download`: Securely downloads resume document without leaking server paths.
- `GET /api/v1/applications/{id}/preview`: Direct stream for in-browser PDF preview.

### Candidates & Review Workflow
- `GET /api/v1/jobs/{job_id}/rankings`: Dynamic leaderboard with 4-pillar scores and explainability breakdowns.
- `POST /api/v1/candidates/compare`: Side-by-side technical skill matrix and winner identification.
- `PUT /api/v1/applications/{id}/stage`: Moves candidate across recruitment stages (`New`, `Reviewing`, `Interview`, `Hired`, `Rejected`).
- `POST /api/v1/applications/{id}/notes`: Adds an interview note or committee evaluation.
- `GET /api/v1/jobs/{job_id}/export/csv`: Exports candidate rankings as an OWASP-compliant formula-safe CSV.

---

## 9. Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+ (Node v20/v22 verified)

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
   Interactive OpenAPI Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

4. **Start the React Frontend Dev Server:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open your browser at: [http://localhost:5173](http://localhost:5173)

---

### Option B: Production Docker Deployment

Build and run the complete multi-stage containerized stack with PostgreSQL:
```bash
docker-compose up --build -d
```
Access the application directly at [http://localhost:8000](http://localhost:8000). The multi-stage Docker build bundles the compiled React frontend into FastAPI with SPA static fallback routing.

---

## 10. Testing & Verification

Run the full automated test suite covering all P0, P1, and P2 regression fixtures:
```bash
# Backend pytest suite (59 passing tests)
cd backend
python -m pytest -v tests/

# Benchmark evaluation script
python scripts/evaluate.py
```

Run frontend linting, tests, and production build:
```bash
cd frontend
npm run lint
npm run test
npm run build
```

---

## 11. License

MIT License. Designed and engineered for transparent recruiter decision support.
