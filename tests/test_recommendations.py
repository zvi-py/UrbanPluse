"""
Automated tests for Phase 5: Recommendation and Connectivity Engine.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_recommendation_network():
    """
    Creates a small network of students and communities:
    - Lucas: CS student interested in AI, skills Python & PyTorch.
    - Sophia: CS student interested in AI, skills Python & Docker. (Both join 'AI Guild')
    - Oliver: ME student interested in Robotics, skills ROS. (Joins 'Robotics Club')
    """
    s1 = client.post("/api/v1/students/", json={
        "full_name": "Lucas Silva",
        "email": "lucas.s@tech.edu",
        "college_name": "Tech University",
        "department": "Computer Science",
        "year_of_study": 3,
        "skills": ["Python", "PyTorch"],
        "interests": ["Artificial Intelligence", "Neural Networks"],
        "bio": "AI Researcher"
    }).json()

    s2 = client.post("/api/v1/students/", json={
        "full_name": "Sophia Zhang",
        "email": "sophia.z@tech.edu",
        "college_name": "Tech University",
        "department": "Computer Science",
        "year_of_study": 3,
        "skills": ["Python", "Docker"],
        "interests": ["Artificial Intelligence", "MLOps"],
        "bio": "Machine learning engineer"
    }).json()

    s3 = client.post("/api/v1/students/", json={
        "full_name": "Oliver Twist",
        "email": "oliver.t@tech.edu",
        "college_name": "Tech University",
        "department": "Mechanical Engineering",
        "year_of_study": 2,
        "skills": ["ROS", "C++"],
        "interests": ["Robotics", "Drones"],
        "bio": "Robotics lover"
    }).json()

    # Community 1: AI Guild (Lucas and Sophia both join)
    c1 = client.post("/api/v1/communities/", json={
        "name": "AI Engineers Guild",
        "category": "Project Team",
        "topic_tags": ["Artificial Intelligence", "Python", "MLOps"],
        "created_by_student_id": s1["id"]
    }).json()

    # Sophia joins AI Guild
    client.post(f"/api/v1/communities/{c1['id']}/join", json={"student_id": s2["id"]})

    # Community 2: Robotics Club (Oliver creates, Sophia has NOT joined)
    c2 = client.post("/api/v1/communities/", json={
        "name": "Autonomous Drone Club",
        "category": "Club",
        "topic_tags": ["Robotics", "Drones", "ROS"],
        "created_by_student_id": s3["id"]
    }).json()

    return {
        "lucas_id": s1["id"],
        "sophia_id": s2["id"],
        "oliver_id": s3["id"],
        "ai_guild_id": c1["id"],
        "drone_club_id": c2["id"]
    }


def test_multifactor_peer_recommendations(setup_recommendation_network):
    """
    Test peer recommendation for Lucas:
    - Sophia should be ranked high due to shared interests (AI), skills (Python),
      shared community ('AI Engineers Guild'), and same department ('Computer Science').
    - Match reasons should clearly explain these factors.
    """
    lucas_id = setup_recommendation_network["lucas_id"]
    sophia_id = setup_recommendation_network["sophia_id"]

    res = client.get(f"/api/v1/recommendations/peers/{lucas_id}")
    assert res.status_code == 200
    peers = res.json()
    assert len(peers) >= 1

    sophia_rec = next(p for p in peers if p["student_id"] == sophia_id)
    assert "Artificial Intelligence" in sophia_rec["common_interests"]
    assert "Python" in sophia_rec["common_skills"]
    assert "AI Engineers Guild" in sophia_rec["shared_communities"]
    assert any("department" in r.lower() for r in sophia_rec["match_reasons"])
    assert any("members of" in r.lower() for r in sophia_rec["match_reasons"])
    assert sophia_rec["similarity_score"] > 0.3


def test_smart_community_recommendations(setup_recommendation_network):
    """
    Test community recommendation for Lucas:
    - 'AI Engineers Guild' must be EXCLUDED because Lucas is already a member.
    """
    lucas_id = setup_recommendation_network["lucas_id"]
    ai_guild_id = setup_recommendation_network["ai_guild_id"]

    res = client.get(f"/api/v1/recommendations/communities/{lucas_id}")
    assert res.status_code == 200
    comms = res.json()
    assert all(c["community_id"] != ai_guild_id for c in comms)


def test_community_recommendations_with_peer_presence(setup_recommendation_network):
    """
    Create a new community where Sophia joins.
    Lucas should see Sophia listed under peers_in_community and in recommendation reasons.
    """
    lucas_id = setup_recommendation_network["lucas_id"]
    sophia_id = setup_recommendation_network["sophia_id"]

    # Create new group 'MLOps Deployment Circle'
    c_new = client.post("/api/v1/communities/", json={
        "name": "MLOps Deployment Circle",
        "category": "Study Group",
        "topic_tags": ["Artificial Intelligence", "Docker", "Python"],
        "created_by_student_id": sophia_id
    }).json()

    res = client.get(f"/api/v1/recommendations/communities/{lucas_id}")
    assert res.status_code == 200
    recs = res.json()
    target_rec = next((c for c in recs if c["community_id"] == c_new["id"]), None)
    assert target_rec is not None
    assert "Sophia Zhang" in target_rec["peers_in_community"]
    assert any("Sophia Zhang" in r for r in target_rec["recommendation_reasons"])


def test_unified_recommendation_feed(setup_recommendation_network):
    """Test the unified feed returning both peers and communities."""
    lucas_id = setup_recommendation_network["lucas_id"]

    res = client.get(f"/api/v1/recommendations/feed/{lucas_id}?peer_limit=3&community_limit=3")
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == lucas_id
    assert "recommended_peers" in data
    assert "recommended_communities" in data
    assert len(data["recommended_peers"]) <= 3
    assert len(data["recommended_communities"]) <= 3


def test_recommendations_invalid_student_id():
    """Verify that querying recommendations for an invalid student ID returns 404."""
    res_peer = client.get("/api/v1/recommendations/peers/999999")
    assert res_peer.status_code == 404

    res_comm = client.get("/api/v1/recommendations/communities/999999")
    assert res_comm.status_code == 404

    res_feed = client.get("/api/v1/recommendations/feed/999999")
    assert res_feed.status_code == 404

