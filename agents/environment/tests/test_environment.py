"""
agents/environment/tests/test_environment.py
Comprehensive test suite for Belagavi City Environmental Intelligence Agent.
Verifies all 58 wards, CPCB AQI calculation, Open-Meteo weather integration,
Isolation Forest anomaly inference, noise reports, and schema compliance.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_environment_status_schema():
    response = client.get("/environment/status")
    assert response.status_code == 200
    body = response.json()
    assert body["agent"] == "environment"
    assert body["status"] == "ok"
    assert "timestamp" in body
    data = body["data"]
    for field in ["aqi", "temperature_celsius", "humidity_percent", "wind_speed_kmh", "anomaly_detected"]:
        assert field in data
    assert data["total_wards"] == 58


def test_environment_overview():
    response = client.get("/environment/overview")
    assert response.status_code == 200
    body = response.json()
    data = body["data"]
    assert data["total_wards"] == 58
    assert "city_summary" in data
    assert "active_alerts" in data
    assert "trends_24h" in data


def test_all_58_wards_registry():
    response = client.get("/environment/wards")
    assert response.status_code == 200
    body = response.json()
    wards = body["data"]["wards"]
    assert len(wards) == 58
    assert body["data"]["total"] == 58

    # Verify first and last wards have required properties
    w1 = wards[0]
    assert w1["ward_number"] == 1
    assert "Tilakwadi" in w1["name"]
    assert "lat" in w1 and "lng" in w1
    assert "polygon" in w1 and len(w1["polygon"]) >= 4

    w58 = wards[57]
    assert w58["ward_number"] == 58
    assert "Khasbag" in w58["name"]


def test_ward_search_filtering():
    response = client.get("/environment/wards?q=Tilakwadi")
    assert response.status_code == 200
    wards = response.json()["data"]["wards"]
    assert len(wards) >= 2
    for w in wards:
        assert "tilakwadi" in w["name"].lower() or "tilakwadi" in w["locality"].lower()


def test_ward_detail_and_invalid_id():
    # Valid
    response = client.get("/environment/wards/38")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["ward_number"] == 38
    assert "Nehru Nagar" in data["name"]
    assert "diurnal_trends" in data

    # Invalid ward ID
    resp_404 = client.get("/environment/wards/999")
    assert resp_404.status_code == 404


def test_air_quality_metrics():
    response = client.get("/environment/air-quality")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "aqi" in data
    assert "pollutants" in data
    assert "pm25" in data["pollutants"]
    assert "pm10" in data["pollutants"]
    assert data["aqi"] > 0


def test_weather_intelligence():
    response = client.get("/environment/weather")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "temperature_celsius" in data
    assert "humidity_percent" in data
    assert "wind_speed_kmh" in data
    assert data["location"]["city"] == "Belagavi"


def test_noise_reporting_and_listing():
    from agents.environment.services.noise_service import NoiseService
    svc = NoiseService.get_instance()
    initial_reports = svc._read_reports()

    try:
        # Submit report
        post_payload = {
            "ward_id": 26,
            "category": "industrial",
            "description": "Continuous high-frequency compressor hum from industrial shed.",
            "decibel_estimate": 76.0,
            "reporter_alias": "PyTest Verifier",
        }
        post_res = client.post("/environment/noise/report", json=post_payload)
        assert post_res.status_code == 200
        created = post_res.json()["data"]
        assert created["ward_id"] == 26
        assert created["category"] == "industrial"

        # List reports
        list_res = client.get("/environment/noise")
        assert list_res.status_code == 200
        reports = list_res.json()["data"]["reports"]
        assert len(reports) >= 1
    finally:
        svc._save_reports(initial_reports)


def test_ai_anomaly_detection_endpoints():
    # Model status
    status_res = client.get("/environment/anomalies")
    assert status_res.status_code == 200
    data = status_res.json()["data"]
    assert "model_parameters" in data
    assert data["model_parameters"]["algorithm"] == "Isolation Forest"

    # Custom inference: Severe spike
    infer_payload = {
        "pm25": 145.0,
        "pm10": 260.0,
        "temperature_celsius": 32.0,
        "humidity_percent": 90.0,
        "wind_speed_kmh": 1.0,
        "noise_db": 85.0,
    }
    infer_res = client.post("/environment/anomalies/detect", json=infer_payload)
    assert infer_res.status_code == 200
    eval_result = infer_res.json()["data"]
    assert eval_result["is_anomaly"] is True
    assert eval_result["anomaly_score"] > 0.5


def test_alerts_endpoint():
    response = client.get("/environment/alerts")
    assert response.status_code == 200
    body = response.json()
    assert "alerts" in body["data"]


def test_historical_trends_and_reports():
    hist_res = client.get("/environment/historical?timeframe=24h")
    assert hist_res.status_code == 200
    series = hist_res.json()["data"]["series"]
    assert len(series) > 0

    rep_res = client.get("/environment/reports/export?timeframe=7d")
    assert rep_res.status_code == 200
    rep_data = rep_res.json()["data"]
    assert "summary_metrics" in rep_data
    assert "data_limitations" in rep_data


def test_external_sources_count():
    response = client.get("/environment/sources")
    assert response.status_code == 200
    sources = response.json()["data"]["sources"]
    assert len(sources) == 5


def test_central_orchestrator_overview_compatibility():
    """Verify that backend/main.py /overview seamlessly includes environment agent."""
    response = client.get("/overview")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    env_data = body["data"]["environment"]
    assert env_data["total_wards"] == 58
    assert "aqi" in env_data
