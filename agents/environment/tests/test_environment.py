"""Smoke tests for the Environment Agent stub."""
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
    assert body["source"] == "stub"
    assert "timestamp" in body


def test_environment_status_data_fields():
    response = client.get("/environment/status")
    data = response.json()["data"]
    for field in ["aqi", "temperature_celsius", "noise_db", "anomaly_detected"]:
        assert field in data


def test_environment_aqi_positive():
    response = client.get("/environment/status")
    assert response.json()["data"]["aqi"] > 0


def test_overview_schema():
    response = client.get("/overview")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "data" in body
    data = body["data"]
    for key in ["traffic", "events", "student", "environment"]:
        assert key in data


def test_overview_cross_agent_alert():
    """High-attendance event should trigger a cross-agent warning."""
    response = client.get("/overview")
    body = response.json()
    alerts = body.get("alerts", [])
    warning_alerts = [a for a in alerts if a["level"] == "warning"]
    assert len(warning_alerts) >= 1
