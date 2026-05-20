from __future__ import annotations

import json
import time
import urllib.request
from datetime import datetime


# OpenSky Network live states feed (no API key), but rate-limited.
# Docs: https://openskynetwork.github.io/opensky-api/rest.html

_STATE_CACHE: dict[str, tuple[float, list[dict]]] = {}
_CACHE_TTL_SECONDS = 15


def _cache_get(key: str):
    item = _STATE_CACHE.get(key)
    if not item:
        return None
    ts, data = item
    if time.time() - ts > _CACHE_TTL_SECONDS:
        _STATE_CACHE.pop(key, None)
        return None
    return data


def _cache_set(key: str, data: list[dict]):
    _STATE_CACHE[key] = (time.time(), data)


def _safe_str(v) -> str:
    return (v or "").strip()


def _id_from_icao24(icao24: str) -> int:
    try:
        return int(icao24, 16) % 10_000_000
    except Exception:
        return abs(hash(icao24)) % 10_000_000


def get_real_flights(now: datetime | None = None) -> list[dict]:
    now = now or datetime.utcnow()
    cache_key = "opensky:states"

    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    url = "https://opensky-network.org/api/states/all"
    req = urllib.request.Request(url, headers={"User-Agent": "SkyTrack/1.0"})

    with urllib.request.urlopen(req, timeout=8) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    states = payload.get("states") or []
    out: list[dict] = []

    # Keep it reasonably sized for UI + demo.
    # Prefer only aircraft with valid lat/lng.
    for row in states:
        # OpenSky schema indexes
        # 0 icao24, 1 callsign, 2 origin_country, 3 time_position, 4 last_contact,
        # 5 longitude, 6 latitude, 7 baro_altitude, 8 on_ground, 9 velocity,
        # 10 true_track, 11 vertical_rate, 12 sensors, 13 geo_altitude, ...
        if not isinstance(row, list) or len(row) < 14:
            continue

        icao24 = _safe_str(row[0])
        callsign = _safe_str(row[1])
        origin_country = _safe_str(row[2])
        last_contact = row[4]
        lng = row[5]
        lat = row[6]
        baro_alt_m = row[7]
        on_ground = bool(row[8])
        velocity_ms = row[9]
        geo_alt_m = row[13]

        if lat is None or lng is None:
            continue

        flight_id = _id_from_icao24(icao24 or callsign or f"{lat},{lng}")

        alt_m = geo_alt_m if isinstance(geo_alt_m, (int, float)) else baro_alt_m
        altitude_ft = (alt_m or 0) * 3.28084 if isinstance(alt_m, (int, float)) else 0
        speed_kts = (velocity_ms or 0) * 1.94384 if isinstance(velocity_ms, (int, float)) else 0

        updated_ago = 0
        if isinstance(last_contact, (int, float)):
            updated_ago = max(0, int(now.timestamp() - float(last_contact)))

        out.append(
            {
                "id": flight_id,
                "flightNumber": callsign or (icao24.upper() if icao24 else "—"),
                "airline": "Live Feed",
                "aircraft": "Unknown",
                "type": "commercial",
                "status": "landed" if on_ground else "enroute",
                "from": {
                    "iata": "—",
                    "city": "",
                    "country": origin_country or "—",
                    "lat": None,
                    "lng": None,
                },
                "to": {
                    "iata": "—",
                    "city": "",
                    "country": "—",
                    "lat": None,
                    "lng": None,
                },
                "speedKts": float(speed_kts),
                "altitudeFt": float(altitude_ft),
                "progress": 0.5,
                "distanceKm": 0,
                "efficiencyPct": 0,
                "delayMinutes": 0,
                "updatedSecondsAgo": updated_ago,
                "position": {"lat": float(lat), "lng": float(lng)},
                "etaLocal": "—",
                "critical": False,
            }
        )

        if len(out) >= 60:
            break

    _cache_set(cache_key, out)
    return out
