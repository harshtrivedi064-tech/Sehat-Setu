import tempfile
import unittest
from io import BytesIO
from pathlib import Path
from urllib.parse import parse_qs
from unittest.mock import patch

from fastapi import HTTPException
from fastapi.testclient import TestClient
from fastapi import HTTPException

from backend import main


class BackendApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        main.DB_PATH = Path(self.temporary_directory.name) / "test.sqlite3"
        main.initialize_database()
        self.client = TestClient(main.app)
        self.client.__enter__()
        self.addCleanup(self.client.__exit__, None, None, None)

    def test_state_is_seeded_and_hospital_updates_persist(self) -> None:
        state = self.client.get("/api/state").json()
        self.assertEqual(len(state["hospitals"]), 19)

        updated = self.client.patch("/api/hospitals/1", json={"load": 61})
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["status"], "busy")

        main.initialize_database()
        reloaded_state = self.client.get("/api/state").json()
        hospital = next(item for item in reloaded_state["hospitals"] if item["id"] == 1)
        self.assertEqual(hospital["load"], 61)

    def test_hospital_updates_validate_fields_and_ids(self) -> None:
        invalid = self.client.patch("/api/hospitals/1", json={"load": 101})
        missing = self.client.patch("/api/hospitals/999", json={"queue": 4})
        empty = self.client.patch("/api/hospitals/1", json={})

        self.assertEqual(invalid.status_code, 422)
        self.assertEqual(missing.status_code, 404)
        self.assertEqual(empty.status_code, 422)

    def test_resource_routes_and_stockout_updates(self) -> None:
        self.assertEqual(len(self.client.get("/api/hospitals").json()), 19)
        self.assertEqual(len(self.client.get("/api/ambulances").json()), 4)

        updated = self.client.patch(
            "/api/stockouts/stock-1",
            json={"currentStock": 99, "status": "warning"},
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["currentStock"], 99)
        self.assertEqual(
            next(
                item for item in self.client.get("/api/stockouts").json()
                if item["id"] == "stock-1"
            )["currentStock"],
            99,
        )

    def test_alert_read_state_is_saved(self) -> None:
        response = self.client.patch("/api/alerts/alert-1", json={"unread": False})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["unread"])

        remaining = self.client.post("/api/alerts/read")
        self.assertEqual(remaining.json()["updated"], 4)
        alert = next(
            item for item in self.client.get("/api/state").json()["alerts"]
            if item["id"] == "alert-1"
        )
        self.assertFalse(alert["unread"])

    def test_transfer_requests_are_persisted(self) -> None:
        response = self.client.post(
            "/api/transfers",
            json={"medicine": "ORS Sachets", "hospital": "PHC Kakori"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["status"], "pending")

        transfers = self.client.get("/api/state").json()["transfers"]
        self.assertEqual(transfers[-1]["to"], "PHC Kakori")

    def test_patient_discovery_and_inventory_endpoints(self) -> None:
        self.assertGreaterEqual(len(self.client.get("/api/doctors").json()), 5)
        self.assertTrue(all("Cardiology" in d["specialty"] for d in self.client.get("/api/doctors?specialty=cardiology").json()))
        self.assertGreaterEqual(len(self.client.get("/api/blood-banks?group=B%2B").json()), 1)
        self.assertGreaterEqual(len(self.client.get("/api/pharmacies?medicine=Paracetamol").json()), 1)

    def test_appointment_and_emergency_demo_requests(self) -> None:
        appointment = self.client.post("/api/appointments", json={"doctorId":"DOC-001","patientName":"Demo Patient","phone":"9999999999","slot":"Today 11:30 AM"})
        self.assertEqual(appointment.status_code, 201)
        self.assertEqual(appointment.json()["status"], "requested")
        emergency = self.client.post("/api/emergency-requests", json={"patientName":"Demo Patient","phone":"9999999999","lat":26.85,"lng":80.91,"issue":"Demo request"})
        self.assertEqual(emergency.status_code, 201)
        self.assertIn("DEMO DISPATCH", emergency.json()["dataLabel"])

    def test_ambulance_gps_and_emergency_assistant(self) -> None:
        gps = self.client.post("/api/ambulances/AMB-01/location", json={"lat":26.9,"lng":80.95,"status":"on-duty"})
        self.assertEqual(gps.status_code, 200)
        self.assertEqual(gps.json()["lat"], 26.9)
        assistant = self.client.post("/api/assistant", json={"message":"I have chest pain and difficulty breathing"})
        self.assertEqual(assistant.status_code, 200)
        self.assertEqual(assistant.json()["triage"], "emergency")
        self.assertIn("112", assistant.json()["reply"])

    def test_dashboard_is_served_by_the_backend(self) -> None:
        self.assertEqual(self.client.get("/").status_code, 200)
        self.assertIn("SehatSetu", self.client.get("/app.js").text)

    def test_osm_elements_are_normalized_and_deduplicated(self) -> None:
        facilities = main.normalize_osm_facilities(
            [
                {
                    "type": "way",
                    "id": 123,
                    "center": {"lat": 26.8, "lon": 80.9},
                    "tags": {
                        "name": "Community Clinic",
                        "healthcare": "clinic",
                        "addr:city": "Lucknow",
                    },
                },
                {
                    "type": "way",
                    "id": 123,
                    "center": {"lat": 26.8, "lon": 80.9},
                    "tags": {"name": "Community Clinic", "healthcare": "clinic"},
                },
                {
                    "type": "node",
                    "id": 456,
                    "lat": 26.9,
                    "lon": 81.0,
                    "tags": {"amenity": "hospital"},
                },
                {"type": "relation", "id": 789, "tags": {"healthcare": "hospital"}},
            ]
        )

        self.assertEqual(len(facilities), 2)
        self.assertEqual(facilities[0]["id"], "way/123")
        self.assertEqual(facilities[0]["address"], "Lucknow")
        self.assertEqual(facilities[1]["name"], "Unnamed hospital")

    def test_overpass_request_queries_the_up_boundary(self) -> None:
        response_body = (
            b'{"elements":[{"type":"node","id":123,"lat":26.8,"lon":80.9,'
            b'"tags":{"name":"Community Clinic","healthcare":"clinic"}}]}'
        )
        with patch("backend.main.urlopen", return_value=BytesIO(response_body)) as urlopen:
            facilities = main.fetch_osm_facilities()

        request = urlopen.call_args.args[0]
        query = parse_qs(request.data.decode("utf-8"))["data"][0]
        self.assertIn('ISO3166-2"="IN-UP', query)
        self.assertIn("out center", query)
        self.assertEqual(facilities[0]["id"], "node/123")
        self.assertEqual(facilities[0]["name"], "Community Clinic")

    def test_overpass_errors_are_returned_as_gateway_errors(self) -> None:
        with patch("backend.main.urlopen", side_effect=OSError("network unavailable")):
            with self.assertRaises(HTTPException) as error:
                main.fetch_osm_facilities()

        self.assertEqual(error.exception.status_code, 502)

    def test_osm_facility_endpoint_caches_statewide_data(self) -> None:
        response_data = [
            {
                "id": "node/123",
                "name": "Community Clinic",
                "type": "clinic",
                "lat": 26.8,
                "lng": 80.9,
                "operator": None,
                "address": "",
            }
        ]
        with patch("backend.main.fetch_osm_facilities", return_value=response_data) as fetch:
            first = self.client.get("/api/map/facilities")
            second = self.client.get("/api/map/facilities")

        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json()["facilities"], response_data)
        self.assertEqual(first.json()["attribution"], "© OpenStreetMap contributors")
        self.assertEqual(second.json(), first.json())
        fetch.assert_called_once()
