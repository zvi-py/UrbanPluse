"""Smoke tests for the Event Agent stub."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_events_nearby_schema():
    response = client.get("/events/nearby")
    assert response.status_code == 200
    body = response.json()
    assert body["agent"] == "events"
    assert body["status"] == "ok"
    assert body["source"] == "stub"
    assert "timestamp" in body
    assert "data" in body


def test_events_nearby_returns_three_events():
    response = client.get("/events/nearby")
    events = response.json()["data"]["events"]
    assert len(events) == 3


def test_events_nearby_event_fields():
    response = client.get("/events/nearby")
    event = response.json()["data"]["events"][0]
    for field in ["title", "category", "date", "lat", "lng", "score"]:
        assert field in event
