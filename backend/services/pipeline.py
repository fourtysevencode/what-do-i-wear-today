import numpy as np

from .analyze import analyze
from .segment import segment


def analyze_outfit(image: np.ndarray):
    """Detect each garment in the photo and return its transparent crop (see segment())."""
    if image is None or image.size == 0:
        raise ValueError("maybe provide an image first?")

    try:
        result = analyze(image)
        return segment(result)

    except Exception as e:
        raise RuntimeError(f"Outfit analysis failed: {e}") from e
