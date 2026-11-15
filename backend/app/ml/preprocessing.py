import re
import string


def preprocess_text(text: str) -> str:
    """
    Cleans and normalizes text for TF-IDF vectorization:
    - Lowercases text
    - Replaces punctuation with whitespace
    - Collapses multiple whitespace
    - Preserves letters and numbers
    """
    if not text:
        return ""

    # Convert to lowercase
    text = text.lower()

    # Replace punctuation characters with space
    # (preserve hyphens and plus for things like c++ or c# where needed before cleaning)
    text = text.replace("c++", "cpp").replace("c#", "csharp").replace(".net", "dotnet")
    
    # Strip symbols
    text = re.sub(r"[^\w\s]", " ", text)
    
    # Normalize whitespaces
    tokens = text.split()
    return " ".join(tokens)
