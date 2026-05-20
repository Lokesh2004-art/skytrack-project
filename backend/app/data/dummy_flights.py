from __future__ import annotations

from datetime import datetime, timedelta


# Dummy flights shaped for the React UI:
# - position: {lat,lng}
# - from/to: {iata, city, lat, lng}
# - speedKts, altitudeFt, progress, etaLocal

def get_dummy_flights(now: datetime | None = None):
    now = now or datetime.utcnow()
    epoch = int(now.timestamp())
    tick10 = epoch // 10
    tick120 = epoch // 120

    def mix(n: int) -> int:
        # Deterministic pseudo-random mixer for stable demo data.
        n ^= n << 13
        n ^= n >> 17
        n ^= n << 5
        return n & 0xFFFFFFFF

    flights = [
        {
            "id": 1,
            "flightNumber": "EK203",
            "airline": "Emirates",
            "aircraft": "Boeing 777-300ER",
            "type": "commercial",
            "status": "enroute",
            "from": {"iata": "DXB", "city": "Dubai", "country": "United Arab Emirates", "lat": 25.2532, "lng": 55.3657},
            "to": {"iata": "LHR", "city": "London", "country": "United Kingdom", "lat": 51.4700, "lng": -0.4543},
            "speedKts": 487,
            "altitudeFt": 33000,
            "progress": 0.62,
            "distanceKm": 13960,
            "efficiencyPct": 82,
            "updatedSecondsAgo": 18,
        },
        {
            "id": 2,
            "flightNumber": "AI171",
            "airline": "Air India",
            "aircraft": "Boeing 787-8",
            "type": "commercial",
            "status": "enroute",
            "from": {"iata": "DEL", "city": "Delhi", "country": "India", "lat": 28.5562, "lng": 77.1000},
            "to": {"iata": "JFK", "city": "New York", "country": "United States", "lat": 40.6413, "lng": -73.7781},
            "speedKts": 510,
            "altitudeFt": 35000,
            "progress": 0.44,
            "distanceKm": 11750,
            "efficiencyPct": 79,
            "updatedSecondsAgo": 42,
        },
        {
            "id": 3,
            "flightNumber": "SQ12",
            "airline": "Singapore Airlines",
            "aircraft": "Airbus A350-900",
            "type": "cargo",
            "status": "delayed",
            "from": {"iata": "SIN", "city": "Singapore", "country": "Singapore", "lat": 1.3644, "lng": 103.9915},
            "to": {"iata": "LAX", "city": "Los Angeles", "country": "United States", "lat": 33.9416, "lng": -118.4085},
            "speedKts": 460,
            "altitudeFt": 31000,
            "progress": 0.28,
            "distanceKm": 14110,
            "efficiencyPct": 76,
            "updatedSecondsAgo": 95,
        },
        {
            "id": 4,
            "flightNumber": "QF1",
            "airline": "Qantas",
            "aircraft": "Airbus A380",
            "type": "commercial",
            "status": "enroute",
            "from": {"iata": "SYD", "city": "Sydney", "country": "Australia", "lat": -33.9399, "lng": 151.1753},
            "to": {"iata": "LHR", "city": "London", "country": "United Kingdom", "lat": 51.4700, "lng": -0.4543},
            "speedKts": 495,
            "altitudeFt": 34000,
            "progress": 0.71,
            "distanceKm": 17020,
            "efficiencyPct": 84,
            "updatedSecondsAgo": 63,
        },
        {
            "id": 5,
            "flightNumber": "LH247",
            "airline": "Lufthansa",
            "aircraft": "Airbus A340",
            "type": "private",
            "status": "enroute",
            "from": {"iata": "MUC", "city": "Munich", "country": "Germany", "lat": 48.3538, "lng": 11.7861},
            "to": {"iata": "YVR", "city": "Vancouver", "country": "Canada", "lat": 49.1967, "lng": -123.1815},
            "speedKts": 500,
            "altitudeFt": 36000,
            "progress": 0.51,
            "distanceKm": 8400,
            "efficiencyPct": 81,
            "updatedSecondsAgo": 28,
        },
    ]

    # Add more flights to make the map look like a real radar dashboard.
    airports = [
        {"iata": "DXB", "city": "Dubai", "country": "United Arab Emirates", "lat": 25.2532, "lng": 55.3657},
        {"iata": "LHR", "city": "London", "country": "United Kingdom", "lat": 51.4700, "lng": -0.4543},
        {"iata": "DEL", "city": "Delhi", "country": "India", "lat": 28.5562, "lng": 77.1000},
        {"iata": "JFK", "city": "New York", "country": "United States", "lat": 40.6413, "lng": -73.7781},
        {"iata": "SIN", "city": "Singapore", "country": "Singapore", "lat": 1.3644, "lng": 103.9915},
        {"iata": "LAX", "city": "Los Angeles", "country": "United States", "lat": 33.9416, "lng": -118.4085},
        {"iata": "SYD", "city": "Sydney", "country": "Australia", "lat": -33.9399, "lng": 151.1753},
        {"iata": "MUC", "city": "Munich", "country": "Germany", "lat": 48.3538, "lng": 11.7861},
        {"iata": "YVR", "city": "Vancouver", "country": "Canada", "lat": 49.1967, "lng": -123.1815},
        {"iata": "HND", "city": "Tokyo", "country": "Japan", "lat": 35.5494, "lng": 139.7798},
        {"iata": "ICN", "city": "Seoul", "country": "South Korea", "lat": 37.4602, "lng": 126.4407},
        {"iata": "CDG", "city": "Paris", "country": "France", "lat": 49.0097, "lng": 2.5479},
        {"iata": "FRA", "city": "Frankfurt", "country": "Germany", "lat": 50.0379, "lng": 8.5622},
        {"iata": "DOH", "city": "Doha", "country": "Qatar", "lat": 25.2736, "lng": 51.6081},
        {"iata": "BOM", "city": "Mumbai", "country": "India", "lat": 19.0896, "lng": 72.8656},
        {"iata": "BLR", "city": "Bengaluru", "country": "India", "lat": 13.1986, "lng": 77.7066},
        {"iata": "YYZ", "city": "Toronto", "country": "Canada", "lat": 43.6777, "lng": -79.6248},
        {"iata": "SFO", "city": "San Francisco", "country": "United States", "lat": 37.6213, "lng": -122.3790},
        {"iata": "GRU", "city": "Sao Paulo", "country": "Brazil", "lat": -23.4356, "lng": -46.4731},
        {"iata": "JNB", "city": "Johannesburg", "country": "South Africa", "lat": -26.1337, "lng": 28.2420},
    ]

    airlines = [
        ("SkyTrack", "A320neo"),
        ("Emirates", "Boeing 777-300ER"),
        ("Qatar Airways", "Boeing 787-9"),
        ("Singapore Airlines", "Airbus A350-900"),
        ("Lufthansa", "Airbus A350-900"),
        ("Air India", "Boeing 787-8"),
        ("Qantas", "Boeing 787-9"),
    ]

    types = ["commercial", "commercial", "commercial", "cargo", "private"]

    # Create ~30 flights total (enough density, still fast).
    next_id = 6
    target_total = 30
    while next_id <= target_total:
        h = mix(next_id * 97)
        origin = airports[h % len(airports)]
        dest = airports[(h // 7) % len(airports)]
        if origin["iata"] == dest["iata"]:
            dest = airports[(h // 11 + 3) % len(airports)]

        airline, aircraft = airlines[(h // 13) % len(airlines)]
        flight_type = types[(h // 17) % len(types)]
        delayed = (h % 11) == 0
        status = "delayed" if delayed else "enroute"

        # Stable numeric values.
        progress = 0.12 + ((h % 780) / 1000.0)  # 0.12 .. 0.90
        speed = 430 + (h % 120)  # 430..549
        altitude = 29000 + ((h // 3) % 9000)  # 29k..38k
        efficiency = 74 + ((h // 5) % 16)  # 74..89
        updated_ago = 8 + ((h // 19) % 180)  # 8..187

        flights.append(
            {
                "id": next_id,
                "flightNumber": f"SK{100 + next_id}",
                "airline": airline,
                "aircraft": aircraft,
                "type": flight_type,
                "status": status,
                "from": origin,
                "to": dest,
                "speedKts": speed,
                "altitudeFt": altitude,
                "progress": round(progress, 3),
                "distanceKm": 5000 + (h % 14000),
                "efficiencyPct": efficiency,
                "updatedSecondsAgo": updated_ago,
            }
        )
        next_id += 1

    # Derive position + ETA from progress for consistent UI.
    for f in flights:
        base_p = float(f.get("progress", 0.2))

        # Time-based drift so polling feels "live".
        drift = ((mix(f["id"] * 997 + tick10) % 900) / 900.0) * 0.06  # 0..0.06
        p = max(0.02, min(0.98, base_p + drift))
        f["progress"] = round(p, 3)

        # Small telemetry jitter.
        f["speedKts"] = max(0, int(f.get("speedKts", 480)) + (mix(f["id"] * 301 + tick10) % 25 - 12))
        f["altitudeFt"] = max(0, int(f.get("altitudeFt", 33000)) + (mix(f["id"] * 701 + tick10) % 1200 - 600))

        # A few flights go delayed for a while (changes every ~2 minutes).
        is_delayed = (mix(f["id"] * 12345 + tick120) % 17) == 0

        # Arrivals: once a flight gets close to the end, mark as landed.
        if p > 0.96:
            f["status"] = "landed"
            f["delayMinutes"] = 0
            f["speedKts"] = min(f["speedKts"], 35)
            f["altitudeFt"] = min(f["altitudeFt"], 1200)
        elif is_delayed:
            f["status"] = "delayed"
            f["delayMinutes"] = 5 * (2 + (mix(f["id"] * 333 + tick120) % 12))  # 10..65
        else:
            f["status"] = "enroute"
            f["delayMinutes"] = 0

        # Occasionally simulate a critical / crash-like situation.
        # Keep it rare, time-varying, and never for landed flights.
        critical_on = (mix(f["id"] * 99991 + tick120) % 41) == 0
        if f["status"] != "landed" and p < 0.95 and critical_on:
            f["critical"] = True
            f["criticalReason"] = "Unstable descent profile (low altitude)"
            f["altitudeFt"] = min(f["altitudeFt"], 1400 + (mix(f["id"] * 1703 + tick10) % 900))
            f["speedKts"] = min(f["speedKts"], 180 + (mix(f["id"] * 2207 + tick10) % 120))
        else:
            f["critical"] = False
            f.pop("criticalReason", None)

        # Looks like a live feed timestamp.
        f["updatedSecondsAgo"] = 5 + (mix(f["id"] * 77 + epoch) % 55)  # 5..59

        origin = f["from"]
        dest = f["to"]
        f["position"] = {
            "lat": origin["lat"] + (dest["lat"] - origin["lat"]) * p,
            "lng": origin["lng"] + (dest["lng"] - origin["lng"]) * p,
        }

        eta_minutes = int((1.0 - p) * 420)
        eta = now + timedelta(minutes=max(10, eta_minutes))
        f["etaLocal"] = eta.strftime("%I:%M %p")

    return flights
