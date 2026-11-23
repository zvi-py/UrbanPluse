# 🔌 UrbanPulse: Student Community & Connectivity Agent
## Integration & API Guide for Main Backend

This guide explains how the main **UrbanPulse** platform or other campus agents (e.g. Event Agent, Capstone Team Agent, Notification Agent) can communicate with and consume data from the **Student Community & Connectivity Agent**.

---

## 🚀 1. Server Startup & Base URL

### How to Run the Agent Server
Open a terminal in the project directory (`student community`):

```powershell
# 1. Activate the Python virtual environment
.\.venv\Scripts\Activate.ps1

# 2. Start the FastAPI ASGI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Base URLs:
- **Base Root**: `http://127.0.0.1:8000`
- **API Version 1 Root**: `http://127.0.0.1:8000/api/v1`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 📡 2. How the Main Backend Communicates with This Agent

The Student Community Agent communicates using standard **HTTP REST APIs** with JSON payloads (`Content-Type: application/json`).

### Python Example (`requests` or `httpx`):
```python
import requests

COMMUNITY_AGENT_URL = "http://127.0.0.1:8000/api/v1"

# 1. Fetch student's unified recommendation feed
response = requests.get(f"{COMMUNITY_AGENT_URL}/recommendations/feed/1")
feed_data = response.json()
print("Top peers:", feed_data["recommended_peers"])
print("Top communities:", feed_data["recommended_communities"])

# 2. Register a new student from the main signup flow
new_student = {
    "full_name": "Rohan Mehta",
    "email": "rohan.m@college.edu",
    "college_name": "College of Technology",
    "department": "Computer Science",
    "year_of_study": 2,
    "skills": ["Python", "FastAPI", "React"],
    "interests": ["Hackathons", "Artificial Intelligence"],
    "bio": "Sophomore looking for hackathon teammates."
}
reg_response = requests.post(f"{COMMUNITY_AGENT_URL}/students/", json=new_student)
created_student = reg_response.json()
print("Student ID:", created_student["id"])
```

### JavaScript / Node.js / Frontend Example (`fetch`):
```javascript
const BASE_URL = "http://127.0.0.1:8000/api/v1";

// Fetch recommendations for student dashboard
async function getStudentDashboard(studentId) {
  const res = await fetch(`${BASE_URL}/recommendations/feed/${studentId}`);
  const data = await res.json();
  return data;
}
```

---

## 🤝 3. What Data Other UrbanPulse Agents Can Request

| Other Agent | Purpose | Endpoints to Call | Data Returned |
|---|---|---|---|
| **Main Dashboard / Mobile App** | Render personalized student home feed | `GET /recommendations/feed/{student_id}` | Top matched peers and recommended study groups in a single payload |
| **Team Formation / Capstone Agent** | Match teammates with complementary skills | `GET /recommendations/peers/{student_id}`<br>`GET /students/{student_id}/matches` | Ranked peers with common interests, complementary skills, and match % |
| **Campus Event & Calendar Agent** | Show workshops/hackathons student saved | `GET /students/{student_id}/bookmarks`<br>`GET /opportunities/?upcoming_only=true` | Student's saved event schedule and all upcoming campus events |
| **Notification Agent** | Alert students about matching hackathons | `GET /opportunities/recommendations/{student_id}` | Opportunities matching the student's exact skills and interests |
| **Faculty / Mentorship Agent** | Review student academic engagement | `GET /students/{student_id}`<br>`GET /students/{student_id}/communities` | Verified skills, research interests, and active study group memberships |

---

## 📖 4. API Endpoints Catalog & Example Formats

### A. Student Profiles & Matching

#### 1. Register a Student Profile
- **Method**: `POST`
- **Endpoint**: `/api/v1/students/`
- **Request Body**:
```json
{
  "full_name": "Maya Lin",
  "email": "maya.lin@urbanpulse.edu",
  "college_name": "Urban College of Engineering",
  "department": "Computer Science",
  "year_of_study": 3,
  "skills": ["Python", "FastAPI", "PyTorch"],
  "interests": ["Artificial Intelligence", "Smart Cities"],
  "bio": "AI Enthusiast building campus multi-agent tools."
}
```
- **Response** (`201 Created`):
```json
{
  "id": 1,
  "full_name": "Maya Lin",
  "email": "maya.lin@urbanpulse.edu",
  "college_name": "Urban College of Engineering",
  "department": "Computer Science",
  "year_of_study": 3,
  "skills": ["Python", "FastAPI", "PyTorch"],
  "interests": ["Artificial Intelligence", "Smart Cities"],
  "bio": "AI Enthusiast building campus multi-agent tools.",
  "created_at": "2026-11-08T01:00:00",
  "updated_at": "2026-11-08T01:00:00"
}
```

#### 2. Get Student Profile by ID
- **Method**: `GET`
- **Endpoint**: `/api/v1/students/{student_id}`
- **Response** (`200 OK`): Full student profile JSON. Returns `404 Not Found` if ID does not exist.

#### 3. Update Skills or Interests
- **Method**: `PUT`
- **Endpoints**:
  - `/api/v1/students/{student_id}/skills` (Body: `{"skills": ["Python", "PyTorch", "Docker"]}`)
  - `/api/v1/students/{student_id}/interests` (Body: `{"interests": ["Robotics", "AI"]}`)
- **Response** (`200 OK`): Updated student profile with duplicate tags removed automatically.

---

### B. Study Groups & Student Communities

#### 1. Create a Study Group
- **Method**: `POST`
- **Endpoint**: `/api/v1/communities/`
- **Request Body**:
```json
{
  "name": "UrbanPulse AI & Mobility Lab",
  "description": "Collaborative project team building smart transit solutions.",
  "category": "Project Team",
  "topic_tags": ["Artificial Intelligence", "Python", "Smart Cities"],
  "created_by_student_id": 1
}
```
- **Response** (`201 Created`): Community created; creator is automatically assigned as the `admin` member (`member_count: 1`).

#### 2. Join a Community
- **Method**: `POST`
- **Endpoint**: `/api/v1/communities/{community_id}/join`
- **Request Body**:
```json
{
  "student_id": 2
}
```
- **Response** (`201 Created`): Enrolls student. Returns `400 Bad Request` if already enrolled.

#### 3. View Community Details with Member Roster
- **Method**: `GET`
- **Endpoint**: `/api/v1/communities/{community_id}`
- **Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "UrbanPulse AI & Mobility Lab",
  "category": "Project Team",
  "member_count": 2,
  "members": [
    {
      "student_id": 1,
      "full_name": "Maya Lin",
      "department": "Computer Science",
      "role": "admin",
      "joined_at": "2026-11-08T01:10:00"
    },
    {
      "student_id": 2,
      "full_name": "Devon Miles",
      "department": "Internet of Things",
      "role": "member",
      "joined_at": "2026-11-08T01:15:00"
    }
  ]
}
```

---

### C. Recommendation Engine

#### 1. Unified Student Recommendation Feed
- **Method**: `GET`
- **Endpoint**: `/api/v1/recommendations/feed/{student_id}?peer_limit=3&community_limit=3`
- **Response** (`200 OK`):
```json
{
  "student_id": 1,
  "recommended_peers": [
    {
      "student_id": 4,
      "full_name": "Alex Johnson",
      "department": "Data Science",
      "college_name": "Urban College of Engineering",
      "year_of_study": 3,
      "common_interests": ["Artificial Intelligence", "Smart Cities"],
      "common_skills": ["Python", "FastAPI"],
      "shared_communities": ["UrbanPulse AI & Mobility Lab"],
      "match_reasons": [
        "Shared interests in Artificial Intelligence, Smart Cities",
        "Shared skills in Python, FastAPI",
        "Both members of: UrbanPulse AI & Mobility Lab"
      ],
      "similarity_score": 0.58,
      "match_percentage": 58
    }
  ],
  "recommended_communities": [
    {
      "community_id": 3,
      "name": "Full-Stack Civic Hackers",
      "category": "Hackathon Squad",
      "member_count": 3,
      "matched_tags": ["FastAPI", "Python"],
      "peers_in_community": ["Priya Sharma"],
      "recommendation_reasons": [
        "Matches your tags: FastAPI, Python",
        "Peers with similar interests are members (Priya Sharma)"
      ],
      "relevance_score": 0.42,
      "match_percentage": 42
    }
  ]
}
```

---

### D. Workshops, Hackathons & Opportunities

#### 1. Publish an Opportunity
- **Method**: `POST`
- **Endpoint**: `/api/v1/opportunities/`
- **Request Body**:
```json
{
  "title": "UrbanPulse Smart City Hackathon 2026",
  "description": "48-hour student hackathon solving campus sustainability challenges.",
  "opportunity_type": "Hackathon",
  "organization": "UrbanPulse Developer Chapter",
  "location": "Innovation Hub & Discord",
  "is_online": true,
  "tags": ["Hackathons", "Smart Cities", "Python", "FastAPI"],
  "registration_link": "https://urbanpulse.college.edu/hackathon-2026"
}
```
- **Response** (`201 Created`).

#### 2. Discover Opportunities for a Student
- **Method**: `GET`
- **Endpoint**: `/api/v1/opportunities/recommendations/{student_id}`
- **Response** (`200 OK`): Returns opportunities matching the student's skills and interests, sorted by relevance score.

#### 3. Bookmark an Opportunity
- **Method**: `POST`
- **Endpoint**: `/api/v1/opportunities/{opportunity_id}/bookmark`
- **Request Body**: `{"student_id": 1}`
- **Response** (`201 Created`): Increments the event's live bookmark count.

---

## ⚙️ 5. Integration Requirements & Environment

1. **Python Version**: Python 3.10+ (Python 3.12 recommended).
2. **Dependencies**: All specified in [`requirements.txt`](file:///c:/Users/sadiya/Desktop/student%20community/requirements.txt):
   - `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `email-validator`, `python-dotenv`.
3. **Database**: Initialized on SQLite (`urbanpulse.db`).
   - If migrating to PostgreSQL for the full UrbanPulse deployment:
     Change only `DATABASE_URL` in `.env`:
     `DATABASE_URL=postgresql://user:password@localhost:5432/urbanpulse`
4. **CORS Support**:
   - `CORSMiddleware` is enabled in `app/main.py` allowing requests from all origins (`allow_origins=["*"]`), ensuring browser-based frontends (React, Vue, Flutter web) can call the API without cross-origin blocking.
5. **Database Seeding**:
   - Run `python scripts/seed_data.py` at any time to populate 8 diverse students, 4 communities, and 3 campus opportunities for demonstration.

