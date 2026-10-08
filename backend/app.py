from fastapi import FastAPI
import time
import random
from services.pipeline import analyze_outfit

MESSAGES = [
    "Maybe take a sip of water?",
    "Did you remember to take out the laundry?",
    "This is your sign to go outfit shopping!",
    "What are you doing here? :o",
    "Star this repo on github: https://github.com/fourtysevencode/what-do-i-wear-today"
]

START_TIME = time.time()
def get_uptime():
    return round(time.time() - START_TIME)

app = FastAPI()


@app.get("/health")
def health_status():
    return {
        "status" : "up!",
        "uptime" : f"{get_uptime()}s",
        "version" : "Pre Alpha",
        "message" : random.choice(MESSAGES)
    }

@app.post("/segment")
def segment_image():
    
    return {}