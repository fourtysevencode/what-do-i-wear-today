# FastAPI segmentation backend, packaged for Hugging Face Spaces (Docker SDK).
# Build from the repo root:  docker build -t what-do-i-wear-today-api .
FROM python:3.11-slim

# OpenCV (pulled in by opencv-python and ultralytics) needs these system libraries.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Spaces runs the container as UID 1000.
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR $HOME/app

# CPU-only PyTorch first, so ultralytics doesn't pull the multi-GB CUDA build.
RUN pip install --user torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY --chown=user backend/requirements.txt backend/requirements.txt
RUN pip install --user -r backend/requirements.txt

# Keep the repo layout: services/analyze.py loads <repo root>/models/weights.onnx.
COPY --chown=user models/weights.onnx models/weights.onnx
COPY --chown=user backend/ backend/

# app.py imports `services.*`, so the server runs from inside backend/.
WORKDIR $HOME/app/backend

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
