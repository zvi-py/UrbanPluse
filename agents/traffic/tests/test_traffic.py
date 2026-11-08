"""Smoke tests for the Traffic Agent stub."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_traffic_status_schema():
    response = client.get("/traffic/status")
    assert response.status_code == 200
    body = response.json()
    assert body["agent"] == "traffic"
    assert body["status"] == "ok"
    assert body["source"] == "stub"
    assert "timestamp" in body
    assert "data" in body
    assert "alerts" in body
    assert isinstance(body["alerts"], list)


def test_traffic_status_data_fields():
    response = client.get("/traffic/status")
    data = response.json()["data"]
    assert "congestion_level" in data
    assert "alternate_routes" in data
    assert isinstance(data["alternate_routes"], list)
