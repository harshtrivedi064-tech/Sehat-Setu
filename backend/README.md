# SehatSetu backend

The FastAPI service serves the dashboard and stores hospital, ambulance, medicine, alert, and transfer records in SQLite. The database is created and seeded from `seed_data.json` on first startup; later starts keep existing records.

From the repository root, install the dependencies and start the service:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

Open `http://127.0.0.1:8000`. The API is available under `/api`; interactive documentation is at `/docs`.

The API exposes `/api/hospitals`, `/api/ambulances`, `/api/stockouts`, `/api/alerts`, `/api/transfers`, and a combined `/api/state` endpoint. Use `PATCH` on hospital, ambulance, stockout, or alert IDs to persist updates; `POST /api/transfers` creates a pending transfer request, and `POST /api/alerts/read` marks all alerts read.

`GET /api/map/facilities` loads mapped hospital, clinic, doctor, and health-centre locations for Uttar Pradesh from OpenStreetMap through Overpass. Results are cached in SQLite for 24 hours. Set `SEHATSETU_OVERPASS_URL` to use another compatible Overpass endpoint. Map locations include OSM attribution and links to their source objects. Availability, patient demand, and ambulance positions are not provided by OpenStreetMap; the map labels any illustrative overlays as demo data and has no live ambulance tracking.

The default database is `backend/data/sehatsetu.sqlite3`. Set `SEHATSETU_DB_PATH` to use another file. For development tests, install `backend/requirements-dev.txt` and run `python -m unittest discover -s backend/tests`.

This prototype API has no authentication or authorization. Do not expose it publicly or use it with real patient or health records.
