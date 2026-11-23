"""
Comprehensive test suite for Phase 6: Workshops, Hackathons, and Opportunities.
"""
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_opportunity_environment():
    """
    Creates a student and sample opportunities for testing.
    """
    # Create student
    student_res = client.post("/api/v1/students/", json={
        "full_name": "Marcus Aurel",
        "email": "marcus.a@campus.edu",
        "college_name": "Polytechnic Institute",
        "department": "Computer Science",
        "year_of_study": 3,
        "skills": ["Python", "FastAPI", "React"],
        "interests": ["Hackathons", "Smart Cities", "Web Development"],
        "bio": "Competitive hackathon builder."
    })
    student_id = student_res.json()["id"]

    return {"student_id": student_id}


def test_create_opportunity_success(setup_opportunity_environment):
    """Test publishing a hackathon opportunity."""
    student_id = setup_opportunity_environment["student_id"]

    event_time = (datetime.now() + timedelta(days=14)).isoformat()
    deadline = (datetime.now() + timedelta(days=10)).isoformat()

    payload = {
        "title": "UrbanPulse AI & Mobility Hackathon",
        "description": "48-hour hackathon focused on building intelligent city mobility solutions.",
        "opportunity_type": "Hackathon",
        "organization": "UrbanPulse Tech Club",
        "location": "Innovation Hub, Room 101",
        "is_online": False,
        "tags": ["Python", "Smart Cities", "FastAPI", "AI"],
        "event_date": event_time,
        "application_deadline": deadline,
        "registration_link": "https://urbanpulse.college.edu/hackathon",
        "created_by_student_id": student_id
    }

    res = client.post("/api/v1/opportunities/", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] is not None
    assert data["title"] == payload["title"]
    assert data["opportunity_type"] == "Hackathon"
    assert data["bookmark_count"] == 0
    assert "FastAPI" in data["tags"]


def test_list_and_search_opportunities():
    """Test listing and filtering opportunities by keyword, type, and tags."""
    # List all
    res = client.get("/api/v1/opportunities/")
    assert res.status_code == 200
    all_opps = res.json()
    assert len(all_opps) >= 1

    # Search keyword
    res_search = client.get("/api/v1/opportunities/?search=Mobility")
    assert res_search.status_code == 200
    assert any("UrbanPulse AI" in o["title"] for o in res_search.json())

    # Filter by type
    res_type = client.get("/api/v1/opportunities/?opportunity_type=Hackathon")
    assert res_type.status_code == 200
    assert all(o["opportunity_type"] == "Hackathon" for o in res_type.json())

    # Filter by tag
    res_tag = client.get("/api/v1/opportunities/?tag=python")
    assert res_tag.status_code == 200
    assert len(res_tag.json()) >= 1


def test_get_opportunity_by_id():
    """Test fetching opportunity details by ID."""
    opps = client.get("/api/v1/opportunities/").json()
    opp_id = opps[0]["id"]

    res = client.get(f"/api/v1/opportunities/{opp_id}")
    assert res.status_code == 200
    assert res.json()["id"] == opp_id


def test_get_invalid_opportunity_id():
    """Test that requesting an invalid opportunity ID returns 404."""
    res = client.get("/api/v1/opportunities/999999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_update_opportunity():
    """Test updating opportunity details."""
    opps = client.get("/api/v1/opportunities/").json()
    opp_id = opps[0]["id"]

    update_payload = {
        "location": "Main Auditorium & Online Discord",
        "is_online": True
    }
    res = client.put(f"/api/v1/opportunities/{opp_id}", json=update_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["location"] == update_payload["location"]
    assert data["is_online"] is True


def test_bookmark_and_unbookmark_opportunity(setup_opportunity_environment):
    """Test student bookmarking and unbookmarking an opportunity."""
    student_id = setup_opportunity_environment["student_id"]
    opps = client.get("/api/v1/opportunities/").json()
    opp_id = opps[0]["id"]

    # 1. Bookmark
    res_bm = client.post(f"/api/v1/opportunities/{opp_id}/bookmark", json={"student_id": student_id})
    assert res_bm.status_code == 201

    # Check bookmark count increased
    opp_detail = client.get(f"/api/v1/opportunities/{opp_id}").json()
    assert opp_detail["bookmark_count"] == 1

    # 2. Duplicate bookmark fails with 400
    res_dup = client.post(f"/api/v1/opportunities/{opp_id}/bookmark", json={"student_id": student_id})
    assert res_dup.status_code == 400

    # 3. View student's saved bookmarks
    res_saved = client.get(f"/api/v1/students/{student_id}/bookmarks")
    assert res_saved.status_code == 200
    assert any(o["id"] == opp_id for o in res_saved.json())

    # 4. Unbookmark
    res_un = client.post(f"/api/v1/opportunities/{opp_id}/unbookmark", json={"student_id": student_id})
    assert res_un.status_code == 204

    # Check count decreased back to 0
    opp_detail2 = client.get(f"/api/v1/opportunities/{opp_id}").json()
    assert opp_detail2["bookmark_count"] == 0

    # 5. Unbookmark again fails with 400
    res_un2 = client.post(f"/api/v1/opportunities/{opp_id}/unbookmark", json={"student_id": student_id})
    assert res_un2.status_code == 400


def test_recommend_opportunities_for_student(setup_opportunity_environment):
    """
    Test personalized opportunity discovery.
    Marcus has skills ['Python', 'FastAPI', 'React'] and interests ['Hackathons', 'Smart Cities'].
    The Hackathon tags include ['Python', 'Smart Cities', 'FastAPI', 'AI'].
    He should receive this opportunity with high relevance and matched tags.
    """
    student_id = setup_opportunity_environment["student_id"]

    res = client.get(f"/api/v1/opportunities/recommendations/{student_id}")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) >= 1

    first = recs[0]
    assert "Python" in first["matched_tags"]
    assert "Smart Cities" in first["matched_tags"]
    assert first["relevance_score"] > 0
    assert first["match_percentage"] > 0
    assert "Matches your skills" in first["recommendation_reason"]


def test_delete_opportunity():
    """Test deleting an opportunity."""
    # Create temporary opportunity
    temp = client.post("/api/v1/opportunities/", json={
        "title": "Temporary Git Workshop",
        "opportunity_type": "Workshop",
        "organization": "Open Source Club",
        "tags": ["Git"]
    }).json()

    # Delete
    res = client.delete(f"/api/v1/opportunities/{temp['id']}")
    assert res.status_code == 204

    # Verify 404
    assert client.get(f"/api/v1/opportunities/{temp['id']}").status_code == 404

