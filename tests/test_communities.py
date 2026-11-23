"""
Comprehensive test suite for Phase 4: Study Groups and Communities.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_community_environment():
    """
    Creates two students for community testing:
    - Founder Student (creates groups)
    - Joiner Student (joins/leaves groups)
    """
    s1_payload = {
        "full_name": "Elena Rostova",
        "email": "elena.r@college.edu",
        "college_name": "Tech Institute",
        "department": "Computer Science",
        "year_of_study": 3,
        "skills": ["Python", "Machine Learning", "PyTorch"],
        "interests": ["Deep Learning", "Computer Vision"],
        "bio": "AI Researcher"
    }
    s2_payload = {
        "full_name": "Liam Vance",
        "email": "liam.v@college.edu",
        "college_name": "Tech Institute",
        "department": "Data Science",
        "year_of_study": 2,
        "skills": ["Python", "SQL", "Pandas"],
        "interests": ["Deep Learning", "Data Engineering"],
        "bio": "Aspiring data engineer"
    }

    r1 = client.post("/api/v1/students/", json=s1_payload)
    elena_id = r1.json()["id"]

    r2 = client.post("/api/v1/students/", json=s2_payload)
    liam_id = r2.json()["id"]

    return {"elena_id": elena_id, "liam_id": liam_id}


def test_create_community_success(setup_community_environment):
    """Test creating a study group; creator is automatically assigned as admin member."""
    elena_id = setup_community_environment["elena_id"]

    comm_payload = {
        "name": "Deep Learning Study Circle",
        "description": "Weekly paper discussions on neural networks and transformers.",
        "category": "Study Group",
        "topic_tags": ["Deep Learning", "PyTorch", "Computer Vision"],
        "created_by_student_id": elena_id
    }

    res = client.post("/api/v1/communities/", json=comm_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] is not None
    assert data["name"] == comm_payload["name"]
    assert data["category"] == "Study Group"
    assert data["member_count"] == 1
    assert data["created_by_student_id"] == elena_id


def test_create_duplicate_community_name_fails(setup_community_environment):
    """Test that creating a community with an existing name returns 400 Bad Request."""
    elena_id = setup_community_environment["elena_id"]
    comm_payload = {
        "name": "Deep Learning Study Circle",
        "description": "Another group with the exact same name.",
        "category": "Study Group",
        "topic_tags": ["AI"],
        "created_by_student_id": elena_id
    }
    res = client.post("/api/v1/communities/", json=comm_payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


def test_create_community_invalid_creator():
    """Test that creating a community with a non-existent student ID returns 404."""
    comm_payload = {
        "name": "Ghost Club",
        "category": "Club",
        "created_by_student_id": 999999
    }
    res = client.post("/api/v1/communities/", json=comm_payload)
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_list_and_search_communities(setup_community_environment):
    """Test browsing and filtering communities by search keyword, category, and tag."""
    # List all
    res = client.get("/api/v1/communities/")
    assert res.status_code == 200
    all_comms = res.json()
    assert len(all_comms) >= 1

    # Search keyword
    res_search = client.get("/api/v1/communities/?search=neural")
    assert res_search.status_code == 200
    assert any("Deep Learning Study Circle" in c["name"] for c in res_search.json())

    # Filter by category
    res_cat = client.get("/api/v1/communities/?category=Study Group")
    assert res_cat.status_code == 200
    assert all(c["category"] == "Study Group" for c in res_cat.json())

    # Filter by tag
    res_tag = client.get("/api/v1/communities/?tag=pytorch")
    assert res_tag.status_code == 200
    assert len(res_tag.json()) >= 1


def test_get_community_detail_and_members(setup_community_environment):
    """Test viewing community details with the member roster."""
    elena_id = setup_community_environment["elena_id"]

    # Get community ID
    comms = client.get("/api/v1/communities/").json()
    comm_id = [c["id"] for c in comms if c["name"] == "Deep Learning Study Circle"][0]

    res = client.get(f"/api/v1/communities/{comm_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == comm_id
    assert len(data["members"]) == 1
    assert data["members"][0]["student_id"] == elena_id
    assert data["members"][0]["role"] == "admin"


def test_join_community_success_and_prevent_duplicate(setup_community_environment):
    """Test student joining a community, and preventing joining twice."""
    liam_id = setup_community_environment["liam_id"]

    comms = client.get("/api/v1/communities/").json()
    comm_id = [c["id"] for c in comms if c["name"] == "Deep Learning Study Circle"][0]

    # Join
    res = client.post(f"/api/v1/communities/{comm_id}/join", json={"student_id": liam_id})
    assert res.status_code == 201
    assert res.json()["student_id"] == liam_id
    assert res.json()["role"] == "member"

    # Member count should now be 2
    detail = client.get(f"/api/v1/communities/{comm_id}").json()
    assert detail["member_count"] == 2

    # Attempt to join again -> 400
    res_dup = client.post(f"/api/v1/communities/{comm_id}/join", json={"student_id": liam_id})
    assert res_dup.status_code == 400
    assert "already a member" in res_dup.json()["detail"].lower()


def test_view_student_joined_communities(setup_community_environment):
    """Test fetching all communities a student is enrolled in."""
    liam_id = setup_community_environment["liam_id"]

    res = client.get(f"/api/v1/students/{liam_id}/communities")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert any(c["name"] == "Deep Learning Study Circle" for c in data)


def test_leave_community(setup_community_environment):
    """Test a student leaving a community."""
    liam_id = setup_community_environment["liam_id"]

    comms = client.get("/api/v1/communities/").json()
    comm_id = [c["id"] for c in comms if c["name"] == "Deep Learning Study Circle"][0]

    # Leave
    res = client.post(f"/api/v1/communities/{comm_id}/leave", json={"student_id": liam_id})
    assert res.status_code == 204

    # Member count back to 1
    detail = client.get(f"/api/v1/communities/{comm_id}").json()
    assert detail["member_count"] == 1

    # Leaving again should return 400
    res_again = client.post(f"/api/v1/communities/{comm_id}/leave", json={"student_id": liam_id})
    assert res_again.status_code == 400


def test_creator_manage_community_authorization(setup_community_environment):
    """Test that only the creator can update community details (403 for others)."""
    elena_id = setup_community_environment["elena_id"]
    liam_id = setup_community_environment["liam_id"]

    comms = client.get("/api/v1/communities/").json()
    comm_id = [c["id"] for c in comms if c["name"] == "Deep Learning Study Circle"][0]

    # Liam tries to update -> 403 Forbidden
    update_payload = {"description": "Hacked description"}
    res_unauth = client.put(f"/api/v1/communities/{comm_id}?requester_student_id={liam_id}", json=update_payload)
    assert res_unauth.status_code == 403
    assert "permission" in res_unauth.json()["detail"].lower()

    # Elena (creator) updates -> 200 OK
    res_auth = client.put(
        f"/api/v1/communities/{comm_id}?requester_student_id={elena_id}",
        json={"description": "Updated official group description"}
    )
    assert res_auth.status_code == 200
    assert res_auth.json()["description"] == "Updated official group description"


def test_community_recommendations_for_student(setup_community_environment):
    """
    Test community recommendations based on student's skills and interests.
    Liam has interests ['Deep Learning', 'Data Engineering'] and skill ['Python'].
    Should receive recommendation for 'Deep Learning Study Circle' because he is not currently a member.
    """
    liam_id = setup_community_environment["liam_id"]

    res = client.get(f"/api/v1/communities/recommendations/{liam_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == liam_id
    assert data["total_recommendations"] >= 1
    rec = data["recommendations"][0]
    assert rec["name"] == "Deep Learning Study Circle"
    assert "Deep Learning" in rec["matched_tags"]
    assert rec["relevance_score"] > 0
    assert rec["match_percentage"] > 0


def test_creator_delete_community(setup_community_environment):
    """Test community creator deleting the community."""
    elena_id = setup_community_environment["elena_id"]
    liam_id = setup_community_environment["liam_id"]

    # Create temporary community
    temp_comm = client.post("/api/v1/communities/", json={
        "name": "Temporary Python Sprint",
        "category": "Hackathon Squad",
        "topic_tags": ["Python", "FastAPI"],
        "created_by_student_id": elena_id
    }).json()

    # Liam tries to delete -> 403 Forbidden
    res_unauth = client.delete(f"/api/v1/communities/{temp_comm['id']}?requester_student_id={liam_id}")
    assert res_unauth.status_code == 403

    # Elena deletes -> 204 No Content
    res_auth = client.delete(f"/api/v1/communities/{temp_comm['id']}?requester_student_id={elena_id}")
    assert res_auth.status_code == 204

    # Verify 404 on get
    res_check = client.get(f"/api/v1/communities/{temp_comm['id']}")
    assert res_check.status_code == 404

