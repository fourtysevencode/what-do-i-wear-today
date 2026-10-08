import numpy as np
import onnxruntime as ort
from PIL import Image


def analyze(
    model_path: str = "/Users/guestuser/Documents/Projects/what-do-i-wear-today/models/weights.onnx",
    image_path: str | None = None,
):
    if image_path is None:
        raise ValueError("image_path is required")

    # Load model and execution providers
    providers = ['CPUExecutionProvider'] # CPU only (no GPU/NPU)
    session = ort.InferenceSession(model_path, providers=providers)

    input_info = session.get_inputs()[0]
    input_shape = input_info.shape
    height = input_shape[2] if len(input_shape) == 4 and isinstance(input_shape[2], int) else 224
    width = input_shape[3] if len(input_shape) == 4 and isinstance(input_shape[3], int) else 224

    with Image.open(image_path) as image:
        image = image.convert("RGB").resize((width, height), Image.Resampling.BILINEAR)
        image_array = np.asarray(image, dtype=np.float32) / 255.0

    input_tensor = np.transpose(image_array, (2, 0, 1))[None, ...]
    outputs = session.run(None, {input_info.name: input_tensor})
    return outputs[0] if len(outputs) == 1 else outputs
    