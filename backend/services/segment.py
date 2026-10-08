import cv2
import numpy as np


def segment(result):
    """
    Extract detected objects from a YOLO segmentation result
    as transparent crops, kept in memory.

    Args:
        result: Ultralytics Results object.

    Returns:
        List of {"image": BGRA crop (np.ndarray), "label": class name, "confidence": float}.
    """

    if result.masks is None:
        return []

    image = result.orig_img
    height, width = image.shape[:2]

    masks = result.masks.data.cpu().numpy()
    boxes = result.boxes.xyxy.cpu().numpy()
    classes = result.boxes.cls.cpu().numpy().astype(int)
    confidences = result.boxes.conf.cpu().numpy()

    crops = []

    for j, mask in enumerate(masks):

        # Resize mask to original image dimensions
        mask_resized = cv2.resize(
            mask,
            (width, height),
            interpolation=cv2.INTER_NEAREST,
        )

        # Convert mask to alpha channel
        alpha = (mask_resized > 0.5).astype(np.uint8) * 255

        # Add alpha channel to original BGR image
        transparent_image = np.dstack((image, alpha))

        # Get bounding box
        x1, y1, x2, y2 = map(int, boxes[j])

        # Clamp coordinates to image boundaries
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(width, x2)
        y2 = min(height, y2)

        # Skip degenerate boxes
        if x2 <= x1 or y2 <= y1:
            continue

        # Crop object
        cropped = transparent_image[y1:y2, x1:x2]

        crops.append({
            "image": cropped,
            "label": result.names[classes[j]],
            "confidence": float(confidences[j]),
        })

    return crops