import math
from typing import List, Dict, Any, Tuple


def calculate_precision_at_k(recommended_ids: List[Any], relevant_ids: List[Any], k: int) -> float:
    """
    Precision@K = (Relevant items in Top K) / K
    """
    if k <= 0:
        return 0.0
    top_k = recommended_ids[:k]
    relevant_set = set(relevant_ids)
    hits = sum(1 for item in top_k if item in relevant_set)
    return round(hits / k, 4)


def calculate_recall_at_k(recommended_ids: List[Any], relevant_ids: List[Any], k: int) -> float:
    """
    Recall@K = (Relevant items in Top K) / Total Relevant items
    """
    if not relevant_ids or k <= 0:
        return 0.0
    top_k = recommended_ids[:k]
    relevant_set = set(relevant_ids)
    hits = sum(1 for item in top_k if item in relevant_set)
    return round(hits / len(relevant_ids), 4)


def calculate_dcg_at_k(recommended_ids: List[Any], relevance_scores: Dict[Any, float], k: int) -> float:
    """
    Calculates Discounted Cumulative Gain at rank K.
    DCG@K = sum_{i=1}^K (2^{rel_i} - 1) / log_2(i + 1)
    """
    top_k = recommended_ids[:k]
    dcg = 0.0
    for idx, item in enumerate(top_k):
        rel = relevance_scores.get(item, 0.0)
        dcg += (2**rel - 1) / math.log2(idx + 2)
    return dcg


def calculate_ndcg_at_k(recommended_ids: List[Any], relevance_scores: Dict[Any, float], k: int) -> float:
    """
    Normalized Discounted Cumulative Gain at K.
    NDCG@K = DCG@K / IDCG@K
    """
    if k <= 0:
        return 0.0

    actual_dcg = calculate_dcg_at_k(recommended_ids, relevance_scores, k)

    # Ideal ranking (sorted by relevance descending)
    ideal_order = sorted(relevance_scores.keys(), key=lambda x: relevance_scores[x], reverse=True)
    ideal_dcg = calculate_dcg_at_k(ideal_order, relevance_scores, k)

    if ideal_dcg == 0.0:
        return 0.0

    return round(actual_dcg / ideal_dcg, 4)


def evaluate_extraction_metrics(
    extracted: List[str],
    ground_truth: List[str]
) -> Tuple[float, float, float]:
    """
    Computes Precision, Recall, and F1-score for extracted items (skills, contacts).
    """
    ext_set = set(s.strip().lower() for s in extracted if s.strip())
    gt_set = set(s.strip().lower() for s in ground_truth if s.strip())

    if not ext_set and not gt_set:
        return 1.0, 1.0, 1.0
    if not ext_set or not gt_set:
        return 0.0, 0.0, 0.0

    true_positives = len(ext_set.intersection(gt_set))
    precision = true_positives / len(ext_set) if ext_set else 0.0
    recall = true_positives / len(gt_set) if gt_set else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return round(precision, 4), round(recall, 4), round(f1, 4)
