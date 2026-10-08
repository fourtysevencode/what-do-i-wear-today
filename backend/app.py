from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import base64
import os
import time
import random

import cv2
import numpy as np

from services.pipeline import analyze_outfit
from services.stylist import StylistBusy, StylistError, StylistUnavailable, build_matching, build_outfit
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

# Optional shared secret for the costly endpoints (segmentation, Gemini). When API_TOKEN
# is set (e.g. as a Space secret), callers must send it as the X-API-Token header.
API_TOKEN = os.environ.get("API_TOKEN")

def require_token(x_api_token: Optional[str] = Header(None)):
    if API_TOKEN and x_api_token != API_TOKEN:
        raise HTTPException(status_code=401, detail="missing or wrong API token")

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

@app.post("/segment", dependencies=[Depends(require_token)])
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


class WardrobeItem(BaseModel):
    id: str = Field(..., max_length=64)
    label: str = Field(..., max_length=60)
    colors: List[str] = Field(default_factory=list, max_length=6)

class OutfitRequest(BaseModel):
    wardrobe: List[WardrobeItem] = Field(..., min_length=1, max_length=300)
    notes: str = Field("", max_length=500)
    weather: Optional[str] = Field(None, max_length=300)

class MatchRequest(BaseModel):
    you: List[WardrobeItem] = Field(..., min_length=1, max_length=300)
    friend: List[WardrobeItem] = Field(..., min_length=1, max_length=300)
    friend_name: str = Field("your friend", max_length=40)
    notes: str = Field("", max_length=500)
    weather: Optional[str] = Field(None, max_length=300)

def _stylist(call):
    """Run a Gemini call and turn its failures into clear HTTP errors."""
    try:
        return call()
    except StylistUnavailable:
        raise HTTPException(status_code=503, detail="the stylist isn't set up yet (no Gemini API key)")
    except StylistBusy:
        raise HTTPException(status_code=503, detail="the stylist is busy right now, try again in a moment")
    except StylistError as e:
        raise HTTPException(status_code=502, detail=f"the stylist gave an unusable answer: {e}")

@app.post("/outfit", dependencies=[Depends(require_token)])
def outfit(request: OutfitRequest):
    """Pick one outfit from a wardrobe with Gemini."""
    wardrobe = [item.model_dump() for item in request.wardrobe]
    return _stylist(lambda: build_outfit(wardrobe, request.notes, request.weather))

@app.post("/outfit/match", dependencies=[Depends(require_token)])
def outfit_match(request: MatchRequest):
    """Coordinated outfits for two people, each from their own wardrobe."""
    you = [item.model_dump() for item in request.you]
    friend = [item.model_dump() for item in request.friend]
    return _stylist(lambda: build_matching(you, friend, request.friend_name, request.notes, request.weather))
