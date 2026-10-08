from analyze import analyze
from segment import segment


def analyze_outfit(path: str):
    if not path:
        raise ValueError("maybe provide an image path first?")

    try:
        result = analyze(path)
        return segment(result, "live/runs/segmented/")

    except Exception as e:
        raise RuntimeError(f"Outfit analysis failed: {e}") from e