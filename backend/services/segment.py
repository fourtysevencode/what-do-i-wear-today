import cv2
import numpy as np
import os

def segment(result, output_dir="runs/segment/cropped"):
    if result.masks is None:
        return []

    image = result.orig_img
    height, width = image.shape[:2]
    masks = result.masks.data.cpu().numpy()
    boxes = result.boxes.xyxy.cpu().numpy()

    os.makedirs(output_dir, exist_ok=True)
    saved_paths = []

    for j, mask in enumerate(masks):
        mask_resized = cv2.resize(
            mask,
            (width, height),
            interpolation=cv2.INTER_NEAREST,
        )
        alpha = (mask_resized > 0.5).astype(np.uint8) * 255

        b, g, r = cv2.split(image)
        transparent_image = cv2.merge([b, g, r, alpha])

        x1, y1, x2, y2 = map(int, boxes[j])
        x1, x2 = max(0, x1), min(width, x2)
        y1, y2 = max(0, y1), min(height, y2)

        cropped = transparent_image[y1:y2, x1:x2]
        output_path = os.path.join(
            output_dir,
            f"segmented_object_{j}_transparent.png",
        )

        cv2.imwrite(output_path, cropped)
        saved_paths.append(output_path)

    return saved_paths
