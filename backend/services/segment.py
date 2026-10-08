import os

import cv2
import numpy as np


def segment(result, output_dir="runs/segment/cropped"):
    """
    Extract detected objects from a YOLO segmentation result
    and save them as transparent PNG crops.

    Args:
        result: Ultralytics Results object.
        output_dir: Directory where cropped images are saved.

    Returns:
        List of saved image paths.
    """

    if result.masks is None:
        return []

    image = result.orig_img
    height, width = image.shape[:2]

    masks = result.masks.data.cpu().numpy()
    boxes = result.boxes.xyxy.cpu().numpy()

    os.makedirs(output_dir, exist_ok=True)

    saved_paths = []

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

        # Crop object
        cropped = transparent_image[y1:y2, x1:x2]

        # Save as transparent PNG
        output_path = os.path.join(
            output_dir,
            f"segmented_object_{j}_transparent.png",
        )

        cv2.imwrite(output_path, cropped)

        saved_paths.append(output_path)

    return saved_paths