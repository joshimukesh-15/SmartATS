import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.ml.preprocessing import preprocess_text


def compute_tfidf_similarity(doc1: str, doc2: str) -> float:
    """
    Computes cosine similarity between two text documents using TF-IDF vectors
    with unigrams and bigrams.
    Returns score as a percentage between 0.0 and 100.0.
    """
    clean_doc1 = preprocess_text(doc1)
    clean_doc2 = preprocess_text(doc2)

    if not clean_doc1.strip() or not clean_doc2.strip():
        return 0.0

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        min_df=1
    )

    try:
        tfidf_matrix = vectorizer.fit_transform([clean_doc1, clean_doc2])
        # Compute cosine similarity between doc1 and doc2
        sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        similarity = float(sim_matrix[0][0])
        # Bound between 0 and 1
        similarity = max(0.0, min(1.0, similarity))
        return round(similarity * 100.0, 2)
    except Exception:
        return 0.0
