from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request

from flask import Blueprint, request


weather_bp = Blueprint("weather", __name__, url_prefix="/weather")

# Tiny in-memory cache to avoid hammering the free API during polling.
_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = 90


def _cache_get(key: str):
    item = _CACHE.get(key)
    if not item:
        return None
    ts, data = item
    if time.time() - ts > _CACHE_TTL_SECONDS:
        _CACHE.pop(key, None)
        return None
    return data


def _cache_set(key: str, data: dict):
    _CACHE[key] = (time.time(), data)


@weather_bp.get("/current")
def current_weather():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    if lat is None or lng is None:
        return {
            "success": False,
            "error": {"code": "BAD_REQUEST", "message": "Missing lat/lng"},
        }, 400

    # round to reduce cache fragmentation
    lat_r = round(lat, 2)
    lng_r = round(lng, 2)
    key = f"{lat_r},{lng_r}"

    cached = _cache_get(key)
    if cached is not None:
        return {"success": True, "data": cached}

    # Open-Meteo (no API key). Docs: https://open-meteo.com/
    params = {
        "latitude": lat_r,
        "longitude": lng_r,
        "current": "temperature_2m,wind_speed_10m",
        "timezone": "auto",
    }
    url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(params)

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SkyTrack/1.0"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            payload = json.loads(resp.read().decode("utf-8"))

        current = payload.get("current") or {}
        data = {
            "lat": lat_r,
            "lng": lng_r,
            "temperatureC": current.get("temperature_2m"),
            "windSpeedKph": current.get("wind_speed_10m"),
            "observedAt": current.get("time"),
        }

        _cache_set(key, data)
        return {"success": True, "data": data}
    except Exception:
        return {
            "success": False,
            "error": {"code": "UPSTREAM_ERROR", "message": "Weather service unavailable"},
        }, 502
