"""
Tests for UrbanPulse Student Community Agent endpoints.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_home_endpoint():
    """Test that the root home endpoint returns 200 OK and expected keys."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "project" in data
    assert "UrbanPulse" in data["project"]
    assert data["status"] == "online"
    assert "documentation" in data


def test_api_v1_status_endpoint():
    """Test that the API v1 status endpoint returns 200 OK and healthy status."""
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["api_version"] == "v1"

