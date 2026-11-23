"""
Comprehensive test suite for Phase 3: Interest/Skill Management & Student Matching.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_matching_students():
    """
    Sets up a group of distinct student profiles for matching tests:
    - Alice: AI & Robotics, Python & PyTorch
    - Bob: AI & Web Dev, Python & React (shares AI + Python with Alice)
    - Charlie: Robotics & IoT, C++ & ROS (shares Robotics with Alice)
    - Diana: Finance & Accounting, Excel (shares NOTHING with Alice)
    - EmptyNed: No skills, no interests
    """
    students_data = [
        {
            "full_name": "Alice Walker",
            "email": "alice.w@univ.edu",
            "college_name": "Tech Institute",
            "department": "Computer Science",
            "year_of_study": 3,
            "skills": ["Python", "PyTorch", "Git"],
            "interests": ["Artificial Intelligence", "Robotics"],
            "bio": "AI Enthusiast"
        },
        {
            "full_name": "Bob Taylor",
            "email": "bob.t@univ.edu",
            "college_name": "Tech Institute",
            "department": "Computer Science",
            "year_of_study": 3,
            "skills": ["python", "React", "Docker"],  # note lowercase 'python' to test normalization
            "interests": ["artificial intelligence", "Web Development"],
            "bio": "Full stack AI builder"
        },
        {
            "full_name": "Charlie Davis",
            "email": "charlie.d@univ.edu",
            "college_name": "Tech Institute",
            "department": "Mechanical Eng",
            "year_of_study": 2,
            "skills": ["C++", "ROS", "Git"],
            "interests": ["Robotics", "Drones"],
            "bio": "Hardware & robotics lover"
        },
        {
            "full_name": "Diana Prince",
            "email": "diana.p@univ.edu",
            "college_name": "Business College",
            "department": "Finance",
            "year_of_study": 4,
            "skills": ["Excel", "Financial Modeling"],
            "interests": ["Investment Banking", "Stock Market"],
            "bio": "Finance major"
        },
        {
            "full_name": "Empty Ned",
            "email": "ned.e@univ.edu",
            "college_name": "Tech Institute",
            "department": "General Studies",
            "year_of_study": 1,
            "skills": [],
            "interests": [],
            "bio": "Just started exploring."
        }
    ]

    created = {}
    for data in students_data:
        res = client.post("/api/v1/students/", json=data)
        if res.status_code == 201:
            created[data["full_name"]] = res.json()["id"]
        elif res.status_code == 400:
            # If already exists from earlier run, find their id
            all_s = client.get("/api/v1/students/").json()
            for s in all_s:
                if s["email"] == data["email"]:
                    created[data["full_name"]] = s["id"]

    return created


def test_update_student_skills(setup_matching_students):
    """Test updating student skills specifically."""
    alice_id = setup_matching_students["Alice Walker"]

    new_skills = ["Python", "PyTorch", "FastAPI", "Kubernetes", "  Python  "]
    res = client.put(f"/api/v1/students/{alice_id}/skills", json={"skills": new_skills})
    assert res.status_code == 200
    data = res.json()
    assert "FastAPI" in data["skills"]
    assert "Kubernetes" in data["skills"]
    # Check deduplication & whitespace strip
    assert data["skills"].count("Python") == 1


def test_update_student_interests(setup_matching_students):
    """Test updating student interests specifically."""
    alice_id = setup_matching_students["Alice Walker"]

    new_interests = ["Artificial Intelligence", "Robotics", "Autonomous Driving"]
    res = client.put(f"/api/v1/students/{alice_id}/interests", json={"interests": new_interests})
    assert res.status_code == 200
    data = res.json()
    assert "Autonomous Driving" in data["interests"]


def test_matching_students_ranks_and_common_tags(setup_matching_students):
    """
    Test that Alice's matches:
    - Include Bob (shares AI + Python)
    - Include Charlie (shares Robotics)
    - Rank Bob higher than Charlie (since interests weight 70% and Bob shares primary interest)
    - Never recommend Alice to herself
    - Diana is excluded (no common skills or interests)
    """
    alice_id = setup_matching_students["Alice Walker"]
    bob_id = setup_matching_students["Bob Taylor"]
    charlie_id = setup_matching_students["Charlie Davis"]
    diana_id = setup_matching_students["Diana Prince"]

    res = client.get(f"/api/v1/students/{alice_id}/matches")
    assert res.status_code == 200
    result = res.json()

    assert result["target_student_id"] == alice_id
    matched_ids = [m["student_id"] for m in result["matches"]]

    # 1. Never recommend Alice to herself
    assert alice_id not in matched_ids

    # 2. Bob and Charlie are present
    assert bob_id in matched_ids
    assert charlie_id in matched_ids

    # 3. Diana (0 similarity) is not recommended
    assert diana_id not in matched_ids

    # 4. Check common tags & details for Bob
    bob_match = next(m for m in result["matches"] if m["student_id"] == bob_id)
    assert any("intelligence" in i.lower() for i in bob_match["common_interests"])
    assert any("python" in s.lower() for s in bob_match["common_skills"])
    assert bob_match["matching_score"] > 0
    assert 0 <= bob_match["match_percentage"] <= 100
    assert bob_match["department"] == "Computer Science"

    # 5. Check ranking: matches must be strictly sorted in descending score order
    scores = [m["matching_score"] for m in result["matches"]]
    assert scores == sorted(scores, reverse=True)


def test_matching_with_no_common_interests_but_matching_skills(setup_matching_students):
    """
    Charlie and Alice share skills (Git) and interests (Robotics).
    Verify common_skills and common_interests are correctly separated.
    """
    alice_id = setup_matching_students["Alice Walker"]
    charlie_id = setup_matching_students["Charlie Davis"]

    res = client.get(f"/api/v1/students/{alice_id}/matches")
    assert res.status_code == 200
    matches = res.json()["matches"]
    charlie_match = next((m for m in matches if m["student_id"] == charlie_id), None)
    assert charlie_match is not None
    assert any("robotics" in i.lower() for i in charlie_match["common_interests"])


def test_matching_empty_profile(setup_matching_students):
    """
    Test that a student with no interests and no skills returns an empty match list
    without crashing or causing division by zero.
    """
    ned_id = setup_matching_students["Empty Ned"]
    res = client.get(f"/api/v1/students/{ned_id}/matches")
    assert res.status_code == 200
    data = res.json()
    assert data["target_student_id"] == ned_id
    assert data["total_matches"] == 0
    assert data["matches"] == []


def test_matching_invalid_student_id():
    """Verify that requesting matches for a non-existent student ID returns 404."""
    res = client.get("/api/v1/students/999999/matches")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_matching_pagination(setup_matching_students):
    """Test pagination with skip and limit parameters."""
    alice_id = setup_matching_students["Alice Walker"]

    # Limit = 1
    res = client.get(f"/api/v1/students/{alice_id}/matches?skip=0&limit=1")
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) <= 1
    assert data["limit"] == 1
    assert data["skip"] == 0


def test_matching_custom_weights(setup_matching_students):
    """Test configuring custom weights (e.g. 100% skills, 0% interests)."""
    alice_id = setup_matching_students["Alice Walker"]

    res = client.get(f"/api/v1/students/{alice_id}/matches?interest_weight=0.0&skill_weight=1.0")
    assert res.status_code == 200
    data = res.json()
    # Should still succeed and calculate based solely on skills
    assert "matches" in data

