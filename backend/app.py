from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import time
import random
import uuid

import cv2
import numpy as np

from services.pipeline import analyze_outfit

MESSAGES = [
    "Maybe take a sip of water?",
    "Did you remember to take out the laundry?",
    "This is your sign to go outfit shopping!",
    "What are you doing here? :o",
    "Star this repo on github: https://github.com/fourtysevencode/what-do-i-wear-today"
]

SEGMENTED_DIR = Path(__file__).resolve().parent / "runs" / "segmented"

# Browser origins allowed to call the API: local Next.js dev plus the production site.
# Override with a comma-separated ALLOWED_ORIGINS env var (e.g. a Space secret).
DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://wardrobe.ronakbuilds.tech",
]
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", ",".join(DEFAULT_ORIGINS)).split(",")
    if origin.strip()
]

START_TIME = time.time()
def get_uptime():
    return round(time.time() - START_TIME)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health_status():
    return {
        "status" : "up!",
        "uptime" : f"{get_uptime()}s",
        "version" : "Pre Alpha",
        "message" : random.choice(MESSAGES)
    }

@app.post("/segment")
def segment_image(image: UploadFile = File(...)):
    data = image.file.read()
    decoded = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    if decoded is None:
        raise HTTPException(status_code=400, detail="couldn't read that as an image :(")

    # Each request gets its own folder so crops don't overwrite each other
    request_id = uuid.uuid4().hex
    try:
        paths = analyze_outfit(decoded, str(SEGMENTED_DIR / request_id))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "id" : request_id,
        "count" : len(paths),
        "paths" : paths
    }
