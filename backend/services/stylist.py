import json
import os
from typing import List, Optional, Tuple

import httpx


# Fastest Flash-Lite models first; later ones are fallbacks when a model is
# rate-limited or overloaded (free tier). Override with GEMINI_MODELS="a,b,c".
DEFAULT_MODELS = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite"]
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
TIMEOUT = httpx.Timeout(25.0)
RETRY_STATUSES = {429, 500, 502, 503, 504}

SYSTEM_PROMPT = (
    "You are a practical personal stylist. You only use clothes the person already owns, "
    "referring to them strictly by the ids given. Build complete, wearable outfits: usually one top "
    "and one bottom, or one dress; add outerwear when it is cold, windy or rainy and they have some. "
    "Never pick two bottoms or two tops of the same layer. Weigh the occasion, the weather and how "
    "the colours work together. Keep text short, warm and specific, in plain English."
)


class StylistUnavailable(Exception):
    """No API key configured."""


class StylistBusy(Exception):
    """Every model was rate-limited, overloaded or unreachable."""


class StylistError(Exception):
    """Gemini answered with something unusable."""


def _models() -> List[str]:
    configured = os.environ.get("GEMINI_MODELS", "")
    models = [m.strip() for m in configured.split(",") if m.strip()]
    return models or DEFAULT_MODELS


def _generate(prompt: str, schema: dict) -> dict:
    """Structured JSON from the first model that answers."""
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise StylistUnavailable("GEMINI_API_KEY is not set")

    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "temperature": 0.9,  # a little variety when asking again
        },
    }

    for model in _models():
        try:
            response = httpx.post(
                GEMINI_URL.format(model=model),
                headers={"x-goog-api-key": key},
                json=body,
                timeout=TIMEOUT,
            )
        except httpx.HTTPError:
            continue
        if response.status_code in RETRY_STATUSES:
            continue
        if response.status_code != 200:
            raise StylistError(f"{model} returned {response.status_code}")

        try:
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        except (KeyError, IndexError, ValueError) as e:
            raise StylistError(f"unexpected response from {model}: {e}") from e

    raise StylistBusy("all models are busy")


def _describe(items: List[dict], prefix: str = "g") -> Tuple[str, dict]:
    """Short ids (g1, g2…) for the prompt, plus a map back to the real ids."""
    lines, back = [], {}
    for i, item in enumerate(items, start=1):
        short = f"{prefix}{i}"
        back[short] = item["id"]
        colours = ", ".join(item.get("colors") or []) or "unknown colours"
        lines.append(f"- {short}: {item['label']} ({colours})")
    return "\n".join(lines), back


def _resolve(ids: List[str], back: dict) -> List[str]:
    """Keep only ids that were offered, in order, without repeats."""
    seen, out = set(), []
    for short in ids or []:
        real = back.get(str(short).strip())
        if real and real not in seen:
            seen.add(real)
            out.append(real)
    return out


def _context(notes: str, weather: Optional[str]) -> str:
    occasion = notes.strip() or "An ordinary day, nothing special planned."
    forecast = weather.strip() if weather else "Unknown, assume mild."
    return f"Occasion / notes: {occasion}\nWeather: {forecast}"


OUTFIT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "STRING", "description": "Outfit name, at most 6 words"},
        "item_ids": {"type": "ARRAY", "items": {"type": "STRING"}},
        "reasoning": {"type": "STRING", "description": "Why it works, at most 40 words"},
        "missing": {
            "type": "STRING",
            "description": "Empty, or what they would need to complete the look",
        },
    },
    "required": ["title", "item_ids", "reasoning", "missing"],
}


def build_outfit(wardrobe: List[dict], notes: str, weather: Optional[str]) -> dict:
    listing, back = _describe(wardrobe)
    prompt = (
        f"{_context(notes, weather)}\n\nTheir wardrobe:\n{listing}\n\n"
        "Pick one outfit for this from their wardrobe."
    )
    result = _generate(prompt, OUTFIT_SCHEMA)
    item_ids = _resolve(result.get("item_ids"), back)
    if not item_ids:
        raise StylistError("no usable items in the answer")
    return {
        "title": str(result.get("title", "")).strip() or "Today's outfit",
        "item_ids": item_ids,
        "reasoning": str(result.get("reasoning", "")).strip(),
        "missing": str(result.get("missing", "")).strip() or None,
    }


SIDE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "item_ids": {"type": "ARRAY", "items": {"type": "STRING"}},
        "reasoning": {"type": "STRING", "description": "This person's look, at most 25 words"},
    },
    "required": ["item_ids", "reasoning"],
}

MATCH_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "STRING", "description": "Name for the pair of looks, at most 6 words"},
        "theme": {"type": "STRING", "description": "How the two outfits go together, at most 35 words"},
        "you": SIDE_SCHEMA,
        "friend": SIDE_SCHEMA,
    },
    "required": ["title", "theme", "you", "friend"],
}


def build_matching(
    you: List[dict], friend: List[dict], friend_name: str, notes: str, weather: Optional[str]
) -> dict:
    # Separate id ranges so neither side can borrow the other's clothes.
    your_listing, your_back = _describe(you, "g")
    friend_listing, friend_back = _describe(friend, "f")

    prompt = (
        f"{_context(notes, weather)}\n\n"
        f"Two friends are going together. Build a coordinated pair of outfits that look good side "
        f"by side (shared palette, matching level of dressiness, not identical). Each person may only "
        f"wear their own clothes, and each outfit must be complete (a top and a bottom, or a dress) "
        f"whenever their wardrobe allows it. The theme must describe the pieces you actually picked.\n\n"
        f"Person A (\"you\") owns:\n{your_listing}\n\n"
        f"Person B (\"{friend_name}\") owns:\n{friend_listing}"
    )
    result = _generate(prompt, MATCH_SCHEMA)
    your_ids = _resolve((result.get("you") or {}).get("item_ids"), your_back)
    friend_ids = _resolve((result.get("friend") or {}).get("item_ids"), friend_back)
    if not your_ids or not friend_ids:
        raise StylistError("an outfit came back empty")
    return {
        "title": str(result.get("title", "")).strip() or "Matching looks",
        "theme": str(result.get("theme", "")).strip(),
        "you": {"item_ids": your_ids, "reasoning": str(result["you"].get("reasoning", "")).strip()},
        "friend": {"item_ids": friend_ids, "reasoning": str(result["friend"].get("reasoning", "")).strip()},
    }
