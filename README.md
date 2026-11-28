# Sehat Setu — Healthcare Coordination Prototype

Sehat Setu is a FastAPI + SQLite healthcare coordination prototype. The existing district dashboard is retained and extended with patient-facing hospital/doctor discovery, sample blood-bank and pharmacy directories, appointment requests, ambulance GPS reporting, emergency request logging, and a cautious health-information assistant.

## Run locally

Requirements: Python 3.10+ and a modern browser. From this folder:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

Open http://127.0.0.1:8000. API documentation is at http://127.0.0.1:8000/docs.

## New modules

- **Find Care:** searches the seeded hospital directory and doctor profiles by disease-related specialty, doctor name, or specialty. Appointment requests are stored for demonstration.
- **Blood Banks:** filters sample inventory by blood group and displays component listings.
- **Medicine Finder:** searches sample pharmacy stock and prescription flags.
- **Ambulance Live:** displays ambulance coordinates and lets a driver device share browser GPS to the backend. Browser geolocation requires permission and, outside localhost, HTTPS. This is not connected to an actual ambulance operator or emergency dispatch service.
- **Health Assistant:** emergency red-flag rules always take precedence. Without an API key, the assistant uses a conservative local fallback. To enable optional OpenAI-generated general health information, set `OPENAI_API_KEY` in the server environment; optionally set `OPENAI_MODEL` (default `gpt-4o-mini`). Symptom text is sent to OpenAI when this option is enabled. Do not send identifying or sensitive patient information. Emergency red flags are handled locally and do not call the model.

## Data and safety limitations

The doctor, blood-bank, pharmacy, capacity, and inventory records in `backend/seed_data.json` are **illustrative demo data**. They are not verified, live provider feeds. Availability must be confirmed directly with the hospital, doctor, blood bank, or pharmacy. The ambulance request endpoint records a demonstration request only; it does not contact 112, a hospital, or an ambulance fleet. In India, call **112** for emergencies.

This repository remains a prototype: it does not yet implement production identity verification, patient authentication/role authorization, clinical validation, ABDM/ABHA integration, payment processing, or legally compliant handling of real patient records. Do not deploy it for real clinical decisions or enter real patient data. Before production, add strong authentication and role-based access, consent and privacy controls, encryption, audit logging, verified provider integrations, rate limiting, secure secrets management, and clinical/safety review.

## Database

SQLite is created and seeded automatically on first startup. The default database is `backend/data/sehatsetu.sqlite3`; override with `SEHATSETU_DB_PATH`. Existing databases are preserved and new demo resources are seeded without overwriting existing records.

## Tests

```bash
pip install -r backend/requirements-dev.txt
python -m unittest discover -s backend/tests -v
```

## Render deployment

A `render.yaml` Blueprint is included. It configures the FastAPI start command and a persistent disk mounted at `/var/data` for SQLite. Persistent disks may require a paid Render plan. If you do not attach persistent storage, local SQLite data can be lost when an instance is replaced or redeployed. Add `OPENAI_API_KEY` as a secret environment variable in Render only if you want optional generated assistant responses; never commit the key to Git.
