from __future__ import annotations

from datetime import datetime

from flask import Blueprint

from ..data.dummy_flights import get_dummy_flights


analytics_bp = Blueprint("analytics", __name__, url_prefix="/analytics")


@analytics_bp.get("/summary")
def summary():
    flights = get_dummy_flights(now=datetime.utcnow())

    total = len(flights)
    delayed = [f for f in flights if f.get("status") == "delayed"]
    landed = sum(1 for f in flights if f.get("status") == "landed")

    delayed_count = len(delayed)
    delay_sum = sum(int(f.get("delayMinutes") or 0) for f in delayed)
    avg_delay = round(delay_sum / delayed_count) if delayed_count else 0

    on_time_pct = round(((total - delayed_count) / total) * 100) if total else 0

    return {
        "success": True,
        "data": {
            "total": total,
            "delayed": delayed_count,
            "landed": landed,
            "onTimePct": on_time_pct,
            "avgDelayMinutes": avg_delay,
        },
    }
