from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_student_matches_schema():
    response = client.get("/student/matches")

    assert response.status_code == 200

    body = response.json()

    assert body["agent"] == "student"
    assert body["status"] == "ok"
    assert body["source"] == "csv_fallback"


def test_student_matches_returns_csv_data():
    response = client.get("/student/matches")

    data = response.json()["data"]

    assert data["query_student"] == "Priya Kulkarni"
    assert len(data["matches"]) > 0
    assert len(data["matches"]) <= 5


def test_student_matches_fields():
    response = client.get("/student/matches")

    matches = response.json()["data"]["matches"]

    for match in matches:
        for field in [
            "name",
            "shared_interests",
            "similarity",
            "department",
            "year",
        ]:
            assert field in match


def test_student_similarity_range():
    response = client.get("/student/matches")

    matches = response.json()["data"]["matches"]

    for match in matches:
        assert 0.0 < match["similarity"] <= 1.0


def test_student_matches_excludes_query_student():
    response = client.get("/student/matches")

    data = response.json()["data"]

    names = [match["name"] for match in data["matches"]]

    assert data["query_student"] not in names


def test_recommended_groups_structure():
    response = client.get("/student/matches")

    groups = response.json()["data"]["recommended_groups"]

    for group in groups:
        assert "name" in group
        assert "members" in group
        assert group["members"] >= 2
