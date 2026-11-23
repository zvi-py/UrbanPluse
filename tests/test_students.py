"""
Unit tests for Student Registration and Profile endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_STUDENT = {
    "full_name": "Maya Lin",
    "email": "maya.lin@urbanpulse.edu",
    "college_name": "Urban College of Engineering",
    "department": "Computer Science",
    "year_of_study": 2,
    "skills": ["Python", "FastAPI", "Docker"],
    "interests": ["Artificial Intelligence", "Autonomous Systems"],
    "bio": "Sophomore fascinated by machine learning and multi-agent systems."
}


def test_register_student_success():
    """Verify that a valid student can be successfully registered."""
    response = client.post("/api/v1/students/", json=SAMPLE_STUDENT)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["full_name"] == SAMPLE_STUDENT["full_name"]
    assert data["email"] == SAMPLE_STUDENT["email"]
    assert data["skills"] == SAMPLE_STUDENT["skills"]
    assert data["interests"] == SAMPLE_STUDENT["interests"]
    assert "created_at" in data


def test_register_duplicate_email_fails():
    """Verify that registering with an existing email returns 400 Bad Request."""
    response = client.post("/api/v1/students/", json=SAMPLE_STUDENT)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_view_all_students():
    """Verify that viewing all registered students returns a non-empty list."""
    response = client.get("/api/v1/students/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(s["email"] == SAMPLE_STUDENT["email"] for s in data)


def test_view_student_by_id():
    """Verify fetching an existing student by ID."""
    # First get Maya's ID from listing
    list_res = client.get("/api/v1/students/")
    maya = [s for s in list_res.json() if s["email"] == SAMPLE_STUDENT["email"]][0]

    response = client.get(f"/api/v1/students/{maya['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == maya["id"]
    assert data["full_name"] == maya["full_name"]


def test_view_invalid_student_id_returns_404():
    """Verify that querying a non-existent student ID returns 404."""
    response = client.get("/api/v1/students/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_student_profile():
    """Verify updating fields of an existing student profile."""
    # Retrieve Maya's ID
    list_res = client.get("/api/v1/students/")
    maya = [s for s in list_res.json() if s["email"] == SAMPLE_STUDENT["email"]][0]

    update_payload = {
        "year_of_study": 3,
        "skills": ["Python", "FastAPI", "Docker", "PyTorch"],
        "bio": "Junior student currently researching multi-agent architectures."
    }

    response = client.put(f"/api/v1/students/{maya['id']}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["year_of_study"] == 3
    assert "PyTorch" in data["skills"]
    assert data["bio"] == update_payload["bio"]
    # Check that untouched fields remain unchanged
    assert data["full_name"] == maya["full_name"]
    assert data["college_name"] == maya["college_name"]


def test_invalid_input_validation():
    """Verify that invalid inputs (e.g. invalid year of study) return 422 Unprocessable Entity."""
    invalid_payload = {
        **SAMPLE_STUDENT,
        "email": "unique.invalid@college.edu",
        "year_of_study": 10  # Exceeds max 6
    }
    response = client.post("/api/v1/students/", json=invalid_payload)
    assert response.status_code == 422

