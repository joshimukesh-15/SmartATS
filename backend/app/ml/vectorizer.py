import os
import threading
from typing import List, Optional, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.ml.preprocessing import preprocess_text

# Path to neutral corpus
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
NEUTRAL_CORPUS_PATH = os.path.join(_CURRENT_DIR, "data", "neutral_corpus.txt")

_NEUTRAL_CORPUS_CACHE: Optional[List[str]] = None
_CORPUS_LOCK = threading.Lock()


def load_neutral_corpus(file_path: Optional[str] = None) -> List[str]:
    """
    Loads generic technical job descriptions from neutral_corpus.txt.
    Returns a cached list of preprocessed neutral job descriptions.
    """
    global _NEUTRAL_CORPUS_CACHE
    if _NEUTRAL_CORPUS_CACHE is not None and file_path is None:
        return _NEUTRAL_CORPUS_CACHE

    target_path = file_path or NEUTRAL_CORPUS_PATH
    loaded: List[str] = []

    if os.path.exists(target_path):
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Support both delimiter-separated and line-separated files
                if "\n---\n" in content:
                    raw_docs = content.split("\n---\n")
                else:
                    raw_docs = content.splitlines()

                for doc in raw_docs:
                    clean = preprocess_text(doc.strip())
                    if clean:
                        loaded.append(clean)
        except Exception:
            pass

    # Safety fallback if file is empty or missing
    if not loaded:
        fallback_samples = [
            "Senior Python Backend Engineer building RESTful APIs with FastAPI Django PostgreSQL Redis Docker Kubernetes AWS.",
            "Java Software Engineer proficient in Spring Boot Hibernate Kafka microservices relational databases and Docker.",
            "Frontend React Developer building web applications with React Next js TypeScript Tailwind CSS and Redux.",
            "Full Stack Engineer with hands on experience in TypeScript React Node js Express PostgreSQL Prisma and Docker.",
            "DevOps Cloud Infrastructure Engineer with Terraform Kubernetes Docker Helm charts Linux administration and CI CD.",
            "Data Engineer building data pipelines with Python SQL Apache Spark Apache Airflow Snowflake dbt and Kafka.",
            "Machine Learning Engineer with Python PyTorch Scikit learn TensorFlow MLflow Docker and FastAPI model serving.",
            "Site Reliability Engineer with Linux Prometheus Grafana Datadog incident response SLO SLI and Python automation.",
        ]
        loaded = [preprocess_text(s) for s in fallback_samples]

    with _CORPUS_LOCK:
        if file_path is None:
            _NEUTRAL_CORPUS_CACHE = loaded
    return loaded


def create_tfidf_vectorizer() -> TfidfVectorizer:
    """
    Creates a TfidfVectorizer configured with the required parameters:
    - sublinear_tf=True
    - sorted vocabulary / deterministic feature ordering
    - smooth_idf=True
    - min_df=1
    """
    return TfidfVectorizer(
        sublinear_tf=True,
        smooth_idf=True,
        min_df=1,
        stop_words="english",
        ngram_range=(1, 2)
    )


def build_job_corpus(
    job_text: str,
    resume_texts: Optional[List[str]] = None,
    neutral_corpus: Optional[List[str]] = None
) -> List[str]:
    """
    Builds the per-job TF-IDF corpus:
    job description + all resumes uploaded for that job.
    If a job has fewer than 5 resumes, includes neutral corpus (~50 generic technical JDs)
    to ensure IDF stability without switching algorithms.
    Resumes are sorted deterministically so feature ordering and fitting is 100% reproducible.
    """
    clean_job = preprocess_text(job_text or "")
    raw_resumes = resume_texts or []

    # Clean and filter non-empty resume texts
    clean_resumes: List[str] = []
    for r in raw_resumes:
        if r and r.strip():
            c = preprocess_text(r)
            if c:
                clean_resumes.append(c)

    # Sort resumes deterministically for reproducible corpus ordering
    clean_resumes.sort()

    corpus: List[str] = []
    if clean_job:
        corpus.append(clean_job)
    corpus.extend(clean_resumes)

    # If fewer than 5 resumes, include neutral corpus for IDF stability
    if len(clean_resumes) < 5:
        neutral_docs = neutral_corpus if neutral_corpus is not None else load_neutral_corpus()
        corpus.extend(neutral_docs)

    return corpus


def fit_job_vectorizer(
    job_text: str,
    resume_texts: Optional[List[str]] = None,
    neutral_corpus: Optional[List[str]] = None
) -> TfidfVectorizer:
    """
    Builds the per-job corpus and fits a deterministic TfidfVectorizer.
    """
    corpus = build_job_corpus(
        job_text=job_text,
        resume_texts=resume_texts,
        neutral_corpus=neutral_corpus
    )

    vectorizer = create_tfidf_vectorizer()
    if corpus:
        vectorizer.fit(corpus)
    else:
        # Fallback if both job and resumes are empty
        neutral_docs = load_neutral_corpus()
        vectorizer.fit(neutral_docs)

    return vectorizer


def compute_tfidf_similarity(
    doc1: str,
    doc2: str,
    vectorizer: Optional[TfidfVectorizer] = None,
    corpus: Optional[List[str]] = None
) -> float:
    """
    Computes cosine similarity between two text documents using TF-IDF vectors.
    Uses per-job or cached vectorizer if provided; otherwise fits a stable vectorizer
    on the documents with neutral corpus.
    Returns score as a percentage between 0.0 and 100.0.
    """
    clean_doc1 = preprocess_text(doc1)
    clean_doc2 = preprocess_text(doc2)

    if not clean_doc1.strip() or not clean_doc2.strip():
        return 0.0

    try:
        if vectorizer is not None:
            fitted_vec = vectorizer
        elif corpus is not None:
            fitted_vec = create_tfidf_vectorizer()
            fitted_vec.fit(corpus)
        else:
            # Single comparison without pre-existing vectorizer:
            # Doc1 is job description, Doc2 is resume (1 resume < 5 resumes, includes neutral corpus)
            fitted_vec = fit_job_vectorizer(job_text=clean_doc1, resume_texts=[clean_doc2])

        v1 = fitted_vec.transform([clean_doc1])
        v2 = fitted_vec.transform([clean_doc2])

        sim_matrix = cosine_similarity(v1, v2)
        similarity = float(sim_matrix[0][0])
        similarity = max(0.0, min(1.0, similarity))
        return round(similarity * 100.0, 2)
    except Exception:
        return 0.0


class VectorizerCacheEntry:
    """Stores a fitted vectorizer and the version number at which it was fitted."""
    def __init__(self, vectorizer: TfidfVectorizer, version: int):
        self.vectorizer = vectorizer
        self.version = version


class VectorizerCache:
    """
    Thread-safe in-memory vectorizer cache per job with version tracking.
    Increments version on upload, delete, and job description edit.
    """
    def __init__(self):
        self._cache: Dict[int, VectorizerCacheEntry] = {}
        self._versions: Dict[int, int] = {}
        self._job_status: Dict[int, str] = {}
        self._lock = threading.Lock()

    def get_version(self, job_id: int) -> int:
        with self._lock:
            return self._versions.get(job_id, 1)

    def increment_version(self, job_id: int) -> int:
        """
        Increments the job version number and invalidates any cached vectorizer for this job.
        Returns the new version number.
        """
        with self._lock:
            current = self._versions.get(job_id, 1)
            new_version = current + 1
            self._versions[job_id] = new_version
            self._cache.pop(job_id, None)
            return new_version

    def invalidate(self, job_id: int) -> int:
        """Alias for increment_version."""
        return self.increment_version(job_id)

    def get_vectorizer(self, job_id: int) -> Optional[TfidfVectorizer]:
        """Returns the cached vectorizer for a job, or None if not cached or invalidated."""
        with self._lock:
            entry = self._cache.get(job_id)
            return entry.vectorizer if entry else None

    def get_entry(self, job_id: int) -> Optional[Tuple[TfidfVectorizer, int]]:
        """Returns (vectorizer, version) tuple if cached."""
        with self._lock:
            entry = self._cache.get(job_id)
            if entry:
                return entry.vectorizer, entry.version
            return None

    def set_vectorizer(self, job_id: int, vectorizer: TfidfVectorizer, version: Optional[int] = None) -> int:
        """Caches the fitted vectorizer with its version number."""
        with self._lock:
            if version is None:
                version = self._versions.get(job_id, 1)
            self._cache[job_id] = VectorizerCacheEntry(vectorizer, version)
            self._versions[job_id] = version
            return version

    def get_job_status(self, job_id: int) -> str:
        """Returns the job status (e.g. 'Re-scoring' or 'Active')."""
        with self._lock:
            return self._job_status.get(job_id, "Active")

    def set_job_status(self, job_id: int, status: str) -> None:
        """Sets the job status."""
        with self._lock:
            self._job_status[job_id] = status

    def clear(self) -> None:
        """Clears all cached entries and reset states."""
        with self._lock:
            self._cache.clear()
            self._versions.clear()
            self._job_status.clear()


# Global in-memory cache singleton
vectorizer_cache = VectorizerCache()
