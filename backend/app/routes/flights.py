from __future__ import annotations

from datetime import datetime

import os

from flask import Blueprint, request

from ..data.dummy_flights import get_dummy_flights
from ..data.real_flights import get_real_flights

flights_bp = Blueprint("flights", __name__)


def _pick_source() -> str:
    src = (request.args.get("source") or "").strip().lower()
    if src in {"real", "dummy"}:
        return src
    return (os.getenv("SKYTRACK_DATA_SOURCE") or "dummy").strip().lower() or "dummy"


def _load_flights(now: datetime) -> list[dict]:
    src = _pick_source()
    if src == "real":
        try:
            flights = get_real_flights(now=now)
            # If upstream returns nothing, fall back so UI isn't empty.
            if flights:
                return flights
        except Exception:
            pass
    return get_dummy_flights(now=now)


@flights_bp.get("/flights")
def list_flights():
    flights = _load_flights(now=datetime.utcnow())
    return {"success": True, "data": flights}


@flights_bp.get("/flight/<int:flight_id>")
def get_flight(flight_id: int):
    flights = _load_flights(now=datetime.utcnow())
    flight = next((f for f in flights if f["id"] == flight_id), None)

    if not flight:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Flight not found"}}, 404

    return {"success": True, "data": flight}
