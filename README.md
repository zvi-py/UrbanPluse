# UrbanPulse - Student Community & Connectivity Agent

The **Student Community & Connectivity Agent** is the complete backend service for the **UrbanPulse** college platform. It empowers campus connectivity by matching students based on shared skills and interests, organizing study groups, providing multi-factor peer recommendations, and surfacing relevant workshops, hackathons, and opportunities.

---

## 🛠️ Complete Project Structure

```text
student community/
│
├── app/
│   ├── __init__.py              # Python package marker
│   ├── main.py                  # Application entry point & FastAPI instance
│   │
│   ├── core/                    # Core configurations & database setup
│   │   ├── __init__.py
│   │   ├── config.py            # App settings, DB URL & matching weights
│   │   └── database.py          # SQLite database connection & session manager
│   │
│   ├── models/                  # Database tables (SQLAlchemy models)
│   │   ├── __init__.py
│   │   ├── student.py           # Student profiles (table: 'students')
│   │   ├── community.py         # Study groups & rosters ('communities', 'community_members')
│   │   └── opportunity.py       # Hackathons & bookmarks ('opportunities', 'opportunity_bookmarks')
│   │
│   ├── schemas/                 # Data validation & response models (Pydantic)
│   │   ├── __init__.py
│   │   ├── student.py           # Student profile schemas (Create, Read, Update)
│   │   ├── matching.py          # Skills/Interests update & matching schemas
│   │   ├── community.py         # Community & membership schemas
│   │   ├── recommendation.py    # Multi-factor peer & smart community feed schemas
│   │   └── opportunity.py       # Hackathon, workshop & bookmark schemas
│   │
│   ├── api/                     # API route controllers
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py        # Central router aggregating all v1 feature routes
│   │       ├── students.py      # Student profile CRUD, matching & bookmarks
│   │       ├── communities.py   # Community & study group endpoints
│   │       ├── recommendations.py# Advanced multi-factor recommendation engine
│   │       └── opportunities.py # Workshops, hackathons & discovery endpoints
│   │
│   └── services/                # Business logic & algorithms
│       ├── __init__.py
│       ├── student_service.py   # Student database queries and validations
│       ├── matching_service.py  # Jaccard similarity & peer matching algorithm
│       ├── community_service.py # Study group creation, membership & recommendations
│       ├── recommendation_service.py # Multi-factor peer & community recommendation engine
│       └── opportunity_service.py   # Event management, bookmarks & discovery engine
│
├── tests/                       # Automated test suite (41 tests)
│   ├── __init__.py
│   ├── conftest.py              # Test database isolation fixtures
│   ├── test_main.py             # Home & status tests
│   ├── test_students.py         # Student registration & profile tests
│   ├── test_matching.py         # Interest/skill management & peer matching tests
│   ├── test_communities.py      # Study groups, membership & community rec tests
│   ├── test_recommendations.py  # Multi-factor peer & smart feed tests
│   └── test_opportunities.py    # Hackathon discovery & bookmarking tests
│
├── .env.example                 # Template for configuration settings
├── .gitignore                   # Files and directories to ignore in Git
├── requirements.txt             # Minimal, essential Python dependencies
├── urbanpulse.db                # SQLite database file
└── README.md                    # Project documentation and guide
```

---

## 🚀 How to Run the Project

### 1. Activate Virtual Environment
On Windows (PowerShell):
```powershell
.\.venv\Scripts\Activate.ps1
```

### 2. Start the FastAPI Server
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Open Interactive Swagger UI
Open your browser and navigate to:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 📡 Complete REST API Catalog

### 🧑‍🎓 Student Profiles & Matching
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/students/` | Register a new student profile |
| `GET` | `/api/v1/students/` | View all registered students (supports pagination `skip` & `limit`) |
| `GET` | `/api/v1/students/{student_id}` | View individual student profile by ID |
| `PUT` | `/api/v1/students/{student_id}` | Update existing student profile |
| `PUT` | `/api/v1/students/{student_id}/skills` | Update student's technical & soft skills |
| `PUT` | `/api/v1/students/{student_id}/interests` | Update student's academic & project interests |
| `GET` | `/api/v1/students/{student_id}/matches` | Find matching peers based on shared interests & skills |
| `GET` | `/api/v1/students/{student_id}/communities` | View all communities the student has joined |
| `GET` | `/api/v1/students/{student_id}/bookmarks` | View all opportunities saved by the student |
| `DELETE`| `/api/v1/students/{student_id}` | Delete a student profile |

### 👥 Study Groups & Communities
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/communities/` | Create a new community/study group (creator becomes admin) |
| `GET` | `/api/v1/communities/` | Browse & search communities (supports `search`, `category`, `tag`) |
| `GET` | `/api/v1/communities/{community_id}` | View community details with full member roster |
| `PUT` | `/api/v1/communities/{community_id}` | Creator updates community details |
| `DELETE`| `/api/v1/communities/{community_id}` | Creator deletes community |
| `POST` | `/api/v1/communities/{community_id}/join` | Student joins a community |
| `POST` | `/api/v1/communities/{community_id}/leave` | Student leaves a community |

### 🧠 Recommendation Engine
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/recommendations/feed/{student_id}` | Unified smart recommendation feed for student dashboard |
| `GET` | `/api/v1/recommendations/peers/{student_id}` | Multi-factor peer recommendations with explainable reasons |
| `GET` | `/api/v1/recommendations/communities/{student_id}` | Context-aware community recommendations with peer network signals |

### 🏆 Workshops, Hackathons & Opportunities
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/opportunities/` | Publish a workshop, hackathon, tech talk, or internship |
| `GET` | `/api/v1/opportunities/` | Browse & search opportunities (`search`, `type`, `tag`, `is_online`, `upcoming`) |
| `GET` | `/api/v1/opportunities/recommendations/{student_id}` | Discover opportunities tailored to student's skills & interests |
| `GET` | `/api/v1/opportunities/{opportunity_id}` | View opportunity details with live bookmark count |
| `PUT` | `/api/v1/opportunities/{opportunity_id}` | Update opportunity details |
| `DELETE`| `/api/v1/opportunities/{opportunity_id}` | Delete an opportunity |
| `POST` | `/api/v1/opportunities/{opportunity_id}/bookmark` | Bookmark/save an opportunity for a student |
| `POST` | `/api/v1/opportunities/{opportunity_id}/unbookmark` | Remove a bookmarked opportunity |
