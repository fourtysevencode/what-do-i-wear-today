import time
from typing import Optional

import httpx


# Open-Meteo: free, no API key (https://open-meteo.com)
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

TIMEOUT = httpx.Timeout(10.0)
CACHE_TTL = 600  # seconds; forecasts don't change minute to minute

# WMO weather interpretation codes -> plain descriptions
WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Light snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


class PlaceNotFound(Exception):
    """The geocoder had no match for the query."""


class WeatherUnavailable(Exception):
    """Open-Meteo didn't answer, or answered with something unusable."""


_cache = {}


def _get_json(url: str, params: dict) -> dict:
    try:
        response = httpx.get(url, params=params, timeout=TIMEOUT)
        response.raise_for_status()
        return response.json()
    except (httpx.HTTPError, ValueError) as e:
        raise WeatherUnavailable(f"weather service request failed: {e}") from e


def geocode(query: str) -> dict:
    """
    Look up a place by name.

    Returns:
        {"label", "latitude", "longitude"}, e.g. label "Pune, Maharashtra, India".
    """

    data = _get_json(GEOCODE_URL, {"name": query, "count": 1, "language": "en", "format": "json"})
    results = data.get("results") or []
    if not results:
        raise PlaceNotFound(query)

    place = results[0]
    parts = [place.get("name"), place.get("admin1"), place.get("country")]
    # Drop empty and repeated parts ("Singapore, Singapore")
    label = ", ".join(dict.fromkeys(p for p in parts if p))
    return {"label": label, "latitude": place["latitude"], "longitude": place["longitude"]}


def get_weather(latitude: float, longitude: float, label: Optional[str] = None) -> dict:
    """
    Current conditions plus today's range for a point.

    Args:
        latitude, longitude: Where to look.
        label: Human-readable place name to echo back, if known.
    """

    key = (round(latitude, 2), round(longitude, 2))
    cached = _cache.get(key)
    if cached and time.time() - cached[0] < CACHE_TTL:
        forecast = cached[1]
    else:
        forecast = _get_json(
            FORECAST_URL,
            {
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                "timezone": "auto",
                "forecast_days": 1,
            },
        )
        _cache[key] = (time.time(), forecast)

    try:
        current = forecast["current"]
        daily = forecast["daily"]
        code = int(current["weather_code"])
        return {
            "location": {"label": label, "latitude": latitude, "longitude": longitude},
            "current": {
                "temp_c": current["temperature_2m"],
                "feels_like_c": current["apparent_temperature"],
                "description": WEATHER_CODES.get(code, "Unknown"),
                "code": code,
                "wind_kmh": current["wind_speed_10m"],
                "precipitation_mm": current["precipitation"],
            },
            "today": {
                "max_c": daily["temperature_2m_max"][0],
                "min_c": daily["temperature_2m_min"][0],
                "precip_chance": daily["precipitation_probability_max"][0],
            },
        }
    except (KeyError, IndexError, TypeError, ValueError) as e:
        raise WeatherUnavailable(f"unexpected weather response: {e}") from e
