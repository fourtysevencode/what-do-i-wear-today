from pathlib import Path

import numpy as np
from ultralytics import YOLO


# Path to your exported ONNX segmentation model (repo_root/models/weights.onnx)
MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "weights.onnx"

# Load the model once when the service starts
model = YOLO(str(MODEL_PATH), task="segment")


def analyze(image: np.ndarray):
    """
    Run YOLO segmentation inference on an image.

    Args:
        image: Decoded BGR image (as returned by cv2.imread / cv2.imdecode).

    Returns:
        Ultralytics Results object for the image.
    """
    results = model(image)

    return results[0]
