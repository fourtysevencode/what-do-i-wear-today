from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import base64
import os
import time
import random

import cv2
import numpy as np

from services.pipeline import analyze_outfit
from services.weather import PlaceNotFound, WeatherUnavailable, geocode, get_weather
from utils.colors import identify_colors

MESSAGES = [
    "Maybe take a sip of water?",
    "Did you remember to take out the laundry?",
    "This is your sign to go outfit shopping!",
    "What are you doing here? :o",
    "Star this repo on github: https://github.com/fourtysevencode/what-do-i-wear-today"
]

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

    try:
        crops = analyze_outfit(decoded)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Crops come back in memory: send them as base64 PNGs so the caller stores them
    items = []
    for crop in crops:
        ok, png = cv2.imencode(".png", crop["image"])
        if not ok:
            continue
        items.append({
            "label" : crop["label"],
            "confidence" : round(crop["confidence"], 3),
            "colors" : identify_colors(crop["image"]),
            "image" : base64.b64encode(png.tobytes()).decode("ascii")
        })

    return {
        "count" : len(items),
        "items" : items
    }

@app.get("/weather")
def weather(
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180),
    q: Optional[str] = Query(None, min_length=2, max_length=100),
):
    """Weather by place name (?q=Pune) or coordinates (?lat=18.52&lon=73.85)."""
    if not q and (lat is None or lon is None):
        raise HTTPException(status_code=400, detail="pass a place with ?q= or both ?lat= and ?lon=")

    try:
        if q:
            place = geocode(q.strip())
            return get_weather(place["latitude"], place["longitude"], label=place["label"])
        return get_weather(lat, lon)
    except PlaceNotFound:
        raise HTTPException(status_code=404, detail=f"couldn't find a place called '{q}'")
    except WeatherUnavailable as e:
        raise HTTPException(status_code=502, detail=str(e))