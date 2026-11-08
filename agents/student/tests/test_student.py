"""Smoke tests for the Student Agent stub."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_student_matches_schema():
    response = client.get("/student/matches")
    assert response.status_code == 200
    body = response.json()
    assert body["agent"] == "student"
    assert body["status"] == "ok"
    assert body["source"] == "stub"


def test_student_matches_returns_three():
    response = client.get("/student/matches")
    matches = response.json()["data"]["matches"]
    assert len(matches) == 3


def test_student_matches_fields():
    response = client.get("/student/matches")
    match = response.json()["data"]["matches"][0]
    for field in ["name", "shared_interests", "similarity"]:
        assert field in match

def test_student_similarity_range():
    response = client.get("/student/matches")
    for match in response.json()["data"]["matches"]:
        assert 0.0 <= match["similarity"] <= 1.0
