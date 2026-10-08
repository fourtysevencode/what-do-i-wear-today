from ultralytics import YOLO


# Path to your exported ONNX segmentation model
MODEL_PATH = "models/weights.onnx"

# Load the model once when the service starts
model = YOLO(MODEL_PATH)


def analyze(image_path: str):
    """
    Run YOLO segmentation inference on an image.

    Args:
        image_path: Path to the input image.

    Returns:
        Ultralytics Results object for the image.
    """
    results = model(image_path)

    return results[0]