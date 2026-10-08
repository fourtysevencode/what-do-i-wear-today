import numpy as np

from .analyze import analyze
from .segment import segment


def analyze_outfit(image: np.ndarray, output_dir: str):
    if image is None or image.size == 0:
        raise ValueError("maybe provide an image first?")

    try:
        result = analyze(image)
        return segment(result, output_dir)

    except Exception as e:
        raise RuntimeError(f"Outfit analysis failed: {e}") from e
