# SkyTrack — Flight Tracking Dashboard (React + Flask + MySQL)

A modern, dark, radar-style flight tracking dashboard.

## Tech Stack

- Frontend: React (functional components), Tailwind CSS, Leaflet (Carto Dark tiles), Framer Motion
- Backend: Python Flask (JSON API)
- Database: MySQL (schema + sample seed provided)

---

## Folder Structure

- `frontend/` — React UI
  - `src/components/` — layout + widgets (Sidebar/Topbar/Stats)
  - `src/features/flights/` — map + flight details panel
  - `src/lib/` — Axios API client
- `backend/` — Flask API + SQL scripts
  - `app/routes/` — API routes
  - `app/data/` — dummy flight data generator
  - `sql/` — MySQL schema + seed

---

## Backend Setup (Flask)

### 1) Create a virtualenv (recommended)

From `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2) Install dependencies

```powershell
pip install -r requirements.txt
```

### 3) Run the API

```powershell
python run.py
```

Or from the repo root:

```powershell
npm run backend
```

API:
- `GET http://localhost:5000/health`
- `GET http://localhost:5000/flights`
- `GET http://localhost:5000/flight/1`
- `POST http://localhost:5000/auth/login`
- `GET http://localhost:5000/auth/me`

---

## Database Setup (MySQL)

These scripts create tables `flights`, `locations`, `users` and insert sample data.

Run in MySQL:

```sql
SOURCE backend/sql/schema.sql;
SOURCE backend/sql/seed.sql;
```

Note: the current API endpoints return dummy data (for fast UI iteration). You can later swap to DB-backed queries using the same schema.

---

## Frontend Setup (React)

From `frontend/`:

```powershell
npm install
```

Create `frontend/.env` (optional):

```bash
VITE_API_URL=http://localhost:5000
```

Run dev server:

```powershell
npm run dev
```

Or from the repo root:

```powershell
npm run dev
```

Note: open the app via the Vite dev server URL (don’t double-click/open `index.html` directly, or you may see “Failed to load module script”).

- Same PC: `http://localhost:5173`
- From phone / another laptop: use the **Network** URL printed by Vite (e.g. `http://192.168.x.x:5173`).
  - Important: on a phone, `localhost` means the phone itself.
  - If you try a custom hostname like `http://anthundu:5173` it will only work if that name resolves via DNS/hosts to your PC.

Open:
- `http://localhost:5173`

Login:
- Demo creds: `demo@skytrack.ai` / `demo123`

### Optional: Real photo background on Login/Signup

To use a real airplane/cloud photo (instead of the default SVG), add your image here:

- `frontend/public/auth-bg.jpg` (or `.jpeg` / `.png` / `.webp`)

Then refresh `http://localhost:5173/login` (the UI auto-detects the file and switches to the photo background).

Alternative (easiest): open `http://localhost:5173/login` and click **Set background photo** to pick an image from your PC (saved in browser storage).

Windows note: make sure the filename isn’t accidentally `auth-bg.jpg.png` (turn on “File name extensions” in File Explorer, or rename it to `auth-bg.png`).

---

## What You Get

- Left sidebar navigation (Dashboard / Live Map / Flights / Airports / Settings)
- Top navbar: logo, search (flight/airport/route), profile icon
- Full-screen dark world map using Leaflet + Carto dark tiles
- Multiple flight markers (dummy data) with glowing airplane icons and popups
- Route lines between origin and destination
- Dashboard widget cards (live flights, delays, distance, efficiency)
- Right-side sliding flight details panel with route, speed/altitude, progress bar, ETA

---

## Notes

- This is intentionally built to look premium (dark glass panels, gradients, smooth motion) while keeping the UX exactly as requested.
- If you want the backend to read from MySQL instead of dummy data, tell me and I’ll wire SQLAlchemy models + queries to match the current UI JSON shape.
