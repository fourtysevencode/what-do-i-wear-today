import cv2
import numpy as np


# Fashion-friendly colour names and a representative RGB value for each.
# Clusters are named by their nearest entry here (distance measured in Lab).
PALETTE = {
    "black": (18, 18, 20),
    "charcoal": (55, 57, 62),
    "grey": (130, 130, 132),
    "white": (245, 245, 242),
    "cream": (240, 230, 205),
    "beige": (215, 195, 160),
    "khaki": (189, 170, 120),
    "tan": (200, 160, 115),
    "brown": (110, 70, 40),
    "navy": (30, 40, 75),
    "denim": (80, 105, 140),
    "blue": (40, 90, 180),
    "light blue": (150, 185, 220),
    "red": (200, 35, 40),
    "burgundy": (110, 25, 40),
    "pink": (235, 150, 175),
    "purple": (110, 60, 140),
    "green": (50, 130, 70),
    "olive": (100, 105, 50),
    "yellow": (235, 205, 60),
    "orange": (235, 130, 40),
}

MAX_SAMPLES = 20_000  # enough pixels for stable clusters, small enough to stay fast
MIN_SHARE = 0.08  # ignore clusters smaller than this (stray edges, shadows)


def _rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """(N, 3) uint8 RGB -> (N, 3) float32 Lab with L in 0-100."""
    pixels = rgb.reshape(-1, 1, 3).astype(np.float32) / 255.0
    return cv2.cvtColor(pixels, cv2.COLOR_RGB2LAB).reshape(-1, 3)


def _lab_to_hex(lab: np.ndarray) -> str:
    rgb = cv2.cvtColor(lab.reshape(1, 1, 3).astype(np.float32), cv2.COLOR_LAB2RGB)
    r, g, b = (np.clip(rgb.reshape(3), 0, 1) * 255).round().astype(int)
    return f"#{r:02x}{g:02x}{b:02x}"


PALETTE_NAMES = list(PALETTE)
PALETTE_LAB = _rgb_to_lab(np.array(list(PALETTE.values()), dtype=np.uint8))


def identify_colors(image_bgra: np.ndarray, max_colors: int = 3) -> list:
    """
    Find the dominant colours of a segmented garment.

    Args:
        image_bgra: BGRA crop from segment(); transparent pixels are ignored.
        max_colors: How many colours to return at most.

    Returns:
        List of {"name", "hex", "percentage"}, largest share first.
    """

    if image_bgra is None or image_bgra.ndim != 3 or image_bgra.shape[2] != 4:
        return []

    # Only the garment itself: pixels that are mostly opaque
    opaque = image_bgra[image_bgra[:, :, 3] >= 128][:, :3]
    if len(opaque) < 50:
        return []

    # Sub-sample big crops so k-means stays quick
    if len(opaque) > MAX_SAMPLES:
        rng = np.random.default_rng(0)
        opaque = opaque[rng.choice(len(opaque), MAX_SAMPLES, replace=False)]

    lab = _rgb_to_lab(opaque[:, ::-1])  # BGR -> RGB first

    k = min(4, len(lab))
    cv2.setRNGSeed(0)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(lab, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS)

    counts = np.bincount(labels.flatten(), minlength=k)
    shares = counts / counts.sum()

    # Name each cluster, merging clusters that land on the same name
    merged = {}
    for center, share in zip(centers, shares):
        if share < MIN_SHARE:
            continue
        name = PALETTE_NAMES[int(np.argmin(np.linalg.norm(PALETTE_LAB - center, axis=1)))]
        if name in merged:
            merged[name]["share"] += share
            if share > merged[name]["largest"]:
                merged[name].update(largest=share, hex=_lab_to_hex(center))
        else:
            merged[name] = {"share": share, "largest": share, "hex": _lab_to_hex(center)}

    ranked = sorted(merged.items(), key=lambda item: item[1]["share"], reverse=True)
    return [
        {"name": name, "hex": info["hex"], "percentage": round(float(info["share"]) * 100, 1)}
        for name, info in ranked[:max_colors]
    ]
