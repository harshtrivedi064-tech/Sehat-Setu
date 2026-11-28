import json
import os
import sqlite3
import time
import uuid
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent
SEED_FILE = BACKEND_DIR / "seed_data.json"
DB_PATH = Path(os.environ.get("SEHATSETU_DB_PATH", BACKEND_DIR / "data" / "sehatsetu.sqlite3"))
OVERPASS_URL = os.environ.get(
    "SEHATSETU_OVERPASS_URL",
    "https://overpass-api.de/api/interpreter",
)
OSM_CACHE_KEY = "osm:IN-UP"
OSM_CACHE_TTL_SECONDS = 24 * 60 * 60
OSM_ATTRIBUTION = "© OpenStreetMap contributors"
RESOURCES = ("hospitals", "ambulances", "stockouts", "alerts", "transfers", "doctors", "blood_banks", "pharmacies", "appointments", "emergency_requests", "ambulance_locations")


def connect_database() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def database_connection():
    connection = connect_database()
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database() -> None:
    seed_data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    with database_connection() as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS records (
                resource TEXT NOT NULL,
                id TEXT NOT NULL,
                payload TEXT NOT NULL,
                PRIMARY KEY (resource, id)
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS map_cache (
                cache_key TEXT PRIMARY KEY,
                fetched_at REAL NOT NULL,
                payload TEXT NOT NULL
            )"""
        )
        for resource, records in seed_data.items():
            for record in records:
                connection.execute(
                    "INSERT OR IGNORE INTO records (resource, id, payload) VALUES (?, ?, ?)",
                    (resource, str(record["id"]), json.dumps(record)),
                )


def list_records(resource: str) -> list[dict]:
    with database_connection() as connection:
        rows = connection.execute(
            "SELECT payload FROM records WHERE resource = ? ORDER BY rowid",
            (resource,),
        ).fetchall()
    return [json.loads(row["payload"]) for row in rows]


def find_record(resource: str, record_id: str) -> dict | None:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT payload FROM records WHERE resource = ? AND id = ?",
            (resource, record_id),
        ).fetchone()
    return json.loads(row["payload"]) if row else None


def save_record(resource: str, record: dict) -> None:
    with database_connection() as connection:
        connection.execute(
            """INSERT INTO records (resource, id, payload) VALUES (?, ?, ?)
               ON CONFLICT(resource, id) DO UPDATE SET payload = excluded.payload""",
            (resource, str(record["id"]), json.dumps(record)),
        )


def normalize_osm_facilities(elements: list[dict]) -> list[dict]:
    facilities = []
    seen = set()

    for element in elements:
        if not isinstance(element, dict):
            continue
        osm_type = element.get("type")
        osm_id = element.get("id")
        key = (osm_type, osm_id)
        if not osm_type or osm_id is None or key in seen:
            continue
        seen.add(key)

        tags = element.get("tags", {})
        if not isinstance(tags, dict):
            tags = {}
        center = element.get("center", {})
        if not isinstance(center, dict):
            center = {}
        lat = element.get("lat", center.get("lat"))
        lng = element.get("lon", center.get("lon"))
        try:
            lat = float(lat)
            lng = float(lng)
        except (TypeError, ValueError):
            continue
        if not -90 <= lat <= 90 or not -180 <= lng <= 180:
            continue

        facility_type = tags.get("healthcare") or tags.get("amenity") or "healthcare"
        name = (
            tags.get("name")
            or tags.get("name:en")
            or tags.get("official_name")
            or tags.get("brand")
            or f"Unnamed {facility_type.replace('_', ' ')}"
        )

        facilities.append(
            {
                "id": f"{osm_type}/{osm_id}",
                "name": name,
                "type": facility_type,
                "lat": lat,
                "lng": lng,
                "operator": tags.get("operator"),
                "address": ", ".join(
                    value
                    for value in (
                        tags.get("addr:suburb"),
                        tags.get("addr:city"),
                        tags.get("addr:district"),
                    )
                    if value
                ),
            }
        )

    return facilities


def fetch_osm_facilities() -> list[dict]:
    query = (
        '[out:json][timeout:90];'
        'area["ISO3166-2"="IN-UP"]->.state;'
        '(nwr["amenity"~"^(hospital|clinic|doctors)$"](area.state);'
        'nwr["healthcare"~"^(hospital|clinic|doctor|doctors|centre|health_centre|dispensary|health_post)$"](area.state););'
        'out center;'
    )
    request = Request(
        OVERPASS_URL,
        data=urlencode({"data": query}).encode("utf-8"),
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "SehatSetu/1.0 (OpenStreetMap facility map)",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=100) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (OSError, TimeoutError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=502,
            detail="OpenStreetMap facility data is temporarily unavailable",
        ) from error

    if not isinstance(result, dict) or not isinstance(result.get("elements", []), list):
        raise HTTPException(
            status_code=502,
            detail="OpenStreetMap facility data is temporarily unavailable",
        )
    return normalize_osm_facilities(result.get("elements", []))


def get_osm_facility_data() -> dict:
    now = time.time()
    with database_connection() as connection:
        cached = connection.execute(
            "SELECT fetched_at, payload FROM map_cache WHERE cache_key = ?",
            (OSM_CACHE_KEY,),
        ).fetchone()
        cached_payload = None
        if cached:
            try:
                cached_payload = json.loads(cached["payload"])
            except json.JSONDecodeError:
                cached_payload = None
        if cached and cached_payload is not None and now - cached["fetched_at"] < OSM_CACHE_TTL_SECONDS:
            return cached_payload
        stale_payload = cached_payload

    try:
        facilities = fetch_osm_facilities()
    except HTTPException:
        if stale_payload is not None:
            return stale_payload
        raise
    fetched_at = datetime.now(timezone.utc).isoformat()
    payload = {
        "source": "OpenStreetMap",
        "attribution": OSM_ATTRIBUTION,
        "attributionUrl": "https://www.openstreetmap.org/copyright",
        "licence": "ODbL",
        "fetchedAt": fetched_at,
        "facilities": facilities,
    }

    with database_connection() as connection:
        connection.execute(
            """INSERT INTO map_cache (cache_key, fetched_at, payload) VALUES (?, ?, ?)
               ON CONFLICT(cache_key) DO UPDATE SET
               fetched_at = excluded.fetched_at, payload = excluded.payload""",
            (OSM_CACHE_KEY, now, json.dumps(payload)),
        )

    return payload


def update_existing_record(resource: str, record_id: str, changes: dict) -> dict:
    record = find_record(resource, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"{resource[:-1].capitalize()} not found")
    record.update(changes)
    save_record(resource, record)
    return record


class HospitalUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    load: int | None = Field(default=None, ge=0, le=100)
    queue: int | None = Field(default=None, ge=0)
    waitTime: int | None = Field(default=None, ge=0)
    bedsOccupied: int | None = Field(default=None, ge=0)
    status: Literal["normal", "busy", "critical"] | None = None


class AmbulanceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    destination: str | None = Field(default=None, min_length=1, max_length=160)
    eta: str | None = Field(default=None, min_length=1, max_length=40)


class StockoutUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    currentStock: int | None = Field(default=None, ge=0)
    daysLeft: int | None = Field(default=None, ge=0)
    predictedNeed: int | None = Field(default=None, ge=0)
    status: Literal["normal", "warning", "critical"] | None = None


class TransferCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    medicine: str = Field(min_length=1, max_length=120)
    hospital: str = Field(min_length=1, max_length=160)

    @field_validator("medicine", "hospital")
    @classmethod
    def require_nonempty_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value must not be blank")
        return normalized


class DoctorCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=120)
    hospitalId: int
    specialty: str = Field(min_length=2, max_length=80)
    availability: str = "Availability to be confirmed"
    nextSlot: str = "Contact hospital"

    @field_validator("name", "specialty", "availability", "nextSlot")
    @classmethod
    def require_doctor_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value must not be blank")
        return normalized

    @field_validator("hospitalId")
    @classmethod
    def require_positive_hospital_id(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("Hospital ID must be positive")
        return value


class AppointmentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    doctorId: str
    patientName: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=20)
    slot: str = Field(min_length=2, max_length=80)
    consultationType: Literal["in-person", "video"] = "in-person"

    @field_validator("doctorId", "patientName", "phone", "slot")
    @classmethod
    def require_appointment_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value must not be blank")
        return normalized

    @field_validator("phone")
    @classmethod
    def require_phone_chars(cls, value: str) -> str:
        if not value.replace("+", "", 1).replace("-", "", 1).replace(" ", "").isdigit():
            raise ValueError("Phone must contain only digits, spaces, + or -")
        return value


class DoctorTalkCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    doctorId: str = Field(min_length=1, max_length=40)
    patientName: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=20)
    mode: Literal["chat", "phone", "video"]
    message: str = Field(min_length=2, max_length=1000)

    @field_validator("doctorId", "patientName", "phone", "message")
    @classmethod
    def require_talk_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value must not be blank")
        return normalized

    @field_validator("phone")
    @classmethod
    def require_talk_phone_chars(cls, value: str) -> str:
        if not value.replace("+", "", 1).replace("-", "", 1).replace(" ", "").isdigit():
            raise ValueError("Phone must contain only digits, spaces, + or -")
        return value


class EmergencyCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    patientName: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=20)
    pickupAddress: str = Field(default="Location not provided", min_length=2, max_length=300)
    ambulanceType: Literal["basic", "advanced", "patient-transfer"] = "basic"
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    issue: str = Field(min_length=2, max_length=300)

    @field_validator("patientName", "phone", "issue")
    @classmethod
    def require_emergency_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value must not be blank")
        return normalized

    @field_validator("phone")
    @classmethod
    def require_emergency_phone_chars(cls, value: str) -> str:
        if not value.replace("+", "", 1).replace("-", "", 1).replace(" ", "").isdigit():
            raise ValueError("Phone must contain only digits, spaces, + or -")
        return value

    @field_validator("pickupAddress")
    @classmethod
    def require_pickup_address(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Pickup address must not be blank")
        return normalized

    @model_validator(mode="after")
    def require_complete_coordinates(self) -> "EmergencyCreate":
        if (self.lat is None) != (self.lng is None):
            raise ValueError("Both latitude and longitude must be provided together")
        return self


class GPSUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    status: Literal["on-duty", "available", "idle", "offline"] = "on-duty"


class AssistantRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(min_length=2, max_length=2000)

    @field_validator("message")
    @classmethod
    def require_assistant_message(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Message must not be blank")
        return normalized


class AlertReadUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    unread: bool


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="SehatSetu API", version="1.0.0", lifespan=lifespan)

cors_origins = [
    origin.strip()
    for origin in os.environ.get("SEHATSETU_CORS_ORIGINS", "").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/state")
def get_state() -> dict[str, list[dict]]:
    return {resource: list_records(resource) for resource in RESOURCES}


@app.get("/api/map/facilities")
def get_map_facilities() -> dict:
    return get_osm_facility_data()


@app.get("/api/hospitals")
def get_hospitals() -> list[dict]:
    return list_records("hospitals")


@app.get("/api/ambulances")
def get_ambulances() -> list[dict]:
    return list_records("ambulances")


@app.get("/api/stockouts")
def get_stockouts() -> list[dict]:
    return list_records("stockouts")


@app.get("/api/alerts")
def get_alerts() -> list[dict]:
    return list_records("alerts")


@app.get("/api/transfers")
def get_transfers() -> list[dict]:
    return list_records("transfers")



@app.get("/api/doctors")
def get_doctors(specialty: str | None = None, hospital_id: int | None = None) -> list[dict]:
    doctors = list_records("doctors")
    if specialty:
        doctors = [d for d in doctors if specialty.lower() in d.get("specialty", "").lower()]
    if hospital_id is not None:
        doctors = [d for d in doctors if d.get("hospitalId") == hospital_id]
    return doctors


@app.get("/api/blood-banks")
def get_blood_banks(group: str | None = None) -> list[dict]:
    banks = list_records("blood_banks")
    if group:
        banks = [b for b in banks if b.get("inventory", {}).get(group, 0) > 0]
    return banks


@app.get("/api/pharmacies")
def get_pharmacies(medicine: str | None = None) -> list[dict]:
    pharmacies = list_records("pharmacies")
    if medicine:
        pharmacies = [p for p in pharmacies if any(medicine.lower() in m.get("name", "").lower() and m.get("stock", 0) > 0 for m in p.get("medicines", []))]
    return pharmacies


@app.post("/api/appointments", status_code=201)
def book_appointment(request: AppointmentCreate) -> dict:
    doctor = find_record("doctors", request.doctorId)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    appointment = {"id": str(uuid.uuid4()), **request.model_dump(), "status": "requested", "createdAt": datetime.now(timezone.utc).isoformat(), "dataLabel": "DEMO REQUEST — hospital confirmation required"}
    save_record("appointments", appointment)
    return appointment


@app.get("/api/appointments")
def get_appointments() -> list[dict]:
    return list_records("appointments")


@app.post("/api/doctor-talks", status_code=201)
def create_doctor_talk(request: DoctorTalkCreate) -> dict:
    doctor = find_record("doctors", request.doctorId)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    talk = {
        "id": str(uuid.uuid4()),
        **request.model_dump(),
        "status": "message-saved" if request.mode == "chat" else "call-requested",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "dataLabel": "DEMO REQUEST — not connected to a clinician",
    }
    save_record("doctor_talks", talk)
    return talk


@app.post("/api/emergency-requests", status_code=201)
def create_emergency_request(request: EmergencyCreate) -> dict:
    available = [a for a in list_records("ambulances") if a.get("status", "available") in ("available", "on-duty", "idle")]
    item = {"id": str(uuid.uuid4()), **request.model_dump(), "status": "request-received", "assignedAmbulance": available[0]["id"] if available else None, "createdAt": datetime.now(timezone.utc).isoformat(), "dataLabel": "DEMO DISPATCH — not connected to emergency services"}
    save_record("emergency_requests", item)
    return item


@app.get("/api/emergency-requests")
def get_emergency_requests() -> list[dict]:
    return list_records("emergency_requests")


@app.post("/api/ambulances/{ambulance_id}/location")
def update_ambulance_location(ambulance_id: str, request: GPSUpdate) -> dict:
    ambulance = find_record("ambulances", ambulance_id)
    if ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    ambulance.update({"lat": request.lat, "lng": request.lng, "status": request.status, "gpsUpdatedAt": datetime.now(timezone.utc).isoformat(), "locationSource": "driver-device GPS"})
    save_record("ambulances", ambulance)
    location = {"id": str(uuid.uuid4()), "ambulanceId": ambulance_id, "lat": request.lat, "lng": request.lng, "status": request.status, "updatedAt": ambulance["gpsUpdatedAt"]}
    save_record("ambulance_locations", location)
    return ambulance


@app.post("/api/assistant")
def healthcare_assistant(request: AssistantRequest) -> dict:
    message = request.message.lower()
    emergency_terms = ["chest pain", "difficulty breathing", "can't breathe", "cannot breathe", "unconscious", "seizure", "stroke", "severe bleeding", "heavy bleeding", "face drooping", "slurred speech", "weakness on one side", "suicidal"]
    red_flags = [term for term in emergency_terms if term in message]
    if red_flags:
        reply = "This may be a medical emergency. Call India's emergency number 112 or seek the nearest emergency department now. Do not wait for an online response. If the person is unconscious or having difficulty breathing, follow the emergency operator's instructions."
        level = "emergency"
    else:
        reply = "I can share general health information, but I cannot diagnose a condition or prescribe treatment. Please tell me the person's age, how long the symptoms have been present, and any other symptoms. For worsening symptoms, severe pain, fainting, or any urgent concern, seek medical care promptly."
        level = "general-guidance"
        provider = "local safety rules (demo fallback)"
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key:
            try:
                payload = {
                    "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                    "messages": [
                        {"role": "system", "content": "You are a cautious health information assistant for an Indian public-facing demo. You are not a doctor. Never diagnose, prescribe, recommend stopping medicines, or claim certainty. Give general educational information only, ask concise clarifying questions when needed, and advise professional evaluation. For emergency symptoms tell the user to call India's 112 emergency number immediately. Do not request names, phone numbers, addresses, Aadhaar numbers, or other identifiers. Mention that your answer is not a substitute for a clinician."},
                        {"role": "user", "content": request.message},
                    ],
                    "temperature": 0.2,
                    "max_tokens": 350,
                }
                ai_request = Request("https://api.openai.com/v1/chat/completions", data=json.dumps(payload).encode("utf-8"), headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, method="POST")
                with urlopen(ai_request, timeout=18) as response:
                    ai_result = json.loads(response.read().decode("utf-8"))
                generated = ai_result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                if generated:
                    reply = generated
                    provider = "OpenAI API"
            except (OSError, TimeoutError, json.JSONDecodeError, KeyError, IndexError):
                provider = "local safety rules (AI provider unavailable)"
    if red_flags:
        provider = "local emergency safety rules"
    return {"reply": reply, "triage": level, "disclaimer": "Not a medical diagnosis or treatment plan. Verify with a qualified clinician; emergency warning rules are not a substitute for emergency services.", "provider": provider}


@app.patch("/api/hospitals/{hospital_id}")
def update_hospital(hospital_id: int, update: HospitalUpdate) -> dict:
    changes = update.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="Provide at least one hospital field to update")
    if "load" in changes and "status" not in changes:
        load = changes["load"]
        changes["status"] = "critical" if load > 85 else "busy" if load > 60 else "normal"
    return update_existing_record("hospitals", str(hospital_id), changes)


@app.patch("/api/ambulances/{ambulance_id}")
def update_ambulance(ambulance_id: str, update: AmbulanceUpdate) -> dict:
    changes = update.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="Provide at least one ambulance field to update")
    return update_existing_record("ambulances", ambulance_id, changes)


@app.patch("/api/stockouts/{stockout_id}")
def update_stockout(stockout_id: str, update: StockoutUpdate) -> dict:
    changes = update.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="Provide at least one stockout field to update")
    return update_existing_record("stockouts", stockout_id, changes)


@app.patch("/api/alerts/{alert_id}")
def update_alert(alert_id: str, update: AlertReadUpdate) -> dict:
    return update_existing_record("alerts", alert_id, update.model_dump())


@app.post("/api/alerts/read")
def mark_all_alerts_read() -> dict[str, int]:
    alerts = list_records("alerts")
    updated = 0
    for alert in alerts:
        if alert["unread"]:
            alert["unread"] = False
            save_record("alerts", alert)
            updated += 1
    return {"updated": updated}


@app.post("/api/transfers", status_code=201)
def create_transfer(request: TransferCreate) -> dict:
    transfer = {
        "id": str(uuid.uuid4()),
        "from": "Unassigned",
        "fromType": "—",
        "to": request.hospital.strip(),
        "toType": "Hospital",
        "medicine": request.medicine.strip(),
        "status": "pending",
        "eta": "Awaiting assignment",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    save_record("transfers", transfer)
    return transfer


@app.get("/", include_in_schema=False)
def serve_index() -> FileResponse:
    return FileResponse(PROJECT_DIR / "index.html")


@app.get("/app.js", include_in_schema=False)
def serve_app_script() -> FileResponse:
    return FileResponse(PROJECT_DIR / "app.js")


@app.get("/styles.css", include_in_schema=False)
def serve_stylesheet() -> FileResponse:
    return FileResponse(PROJECT_DIR / "styles.css")
