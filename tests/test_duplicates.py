import hashlib
from app.services.duplicate import calculate_bytes_hash


def test_calculate_bytes_hash():
    sample_bytes_1 = b"Sample resume content for John Doe."
    sample_bytes_2 = b"Sample resume content for John Doe."
    sample_bytes_3 = b"Different resume content for Jane Smith."

    hash1 = calculate_bytes_hash(sample_bytes_1)
    hash2 = calculate_bytes_hash(sample_bytes_2)
    hash3 = calculate_bytes_hash(sample_bytes_3)

    assert hash1 == hash2
    assert hash1 != hash3
    assert len(hash1) == 64
