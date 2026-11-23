# UrbanPulse - Student Community & Connectivity Agent

The **Student Community & Connectivity Agent** is the complete backend service for the **UrbanPulse** college platform. It empowers campus connectivity by matching students based on shared skills and interests, organizing study groups, providing multi-factor peer recommendations, and surfacing relevant workshops, hackathons, and opportunities.

---

## =ƒ¢án+Å Complete Project Structure

```text
student community/
Göé
Gö£GöÇGöÇ app/
Göé   Gö£GöÇGöÇ __init__.py              # Python package marker
Göé   Gö£GöÇGöÇ main.py                  # Application entry point & FastAPI instance
Göé   Göé
Göé   Gö£GöÇGöÇ core/                    # Core configurations & database setup
Göé   Göé   Gö£GöÇGöÇ __init__.py
Göé   Göé   Gö£GöÇGöÇ config.py            # App settings, DB URL & matching weights
Göé   Göé   GööGöÇGöÇ database.py          # SQLite database connection & session manager
Göé   Göé
Göé   Gö£GöÇGöÇ models/                  # Database tables (SQLAlchemy models)
Göé   Göé   Gö£GöÇGöÇ __init__.py
Göé   Göé   Gö£GöÇGöÇ student.py           # Student profiles (table: 'students')
Göé   Göé   Gö£GöÇGöÇ community.py         # Study groups & rosters ('communities', 'community_members')
Göé   Göé   GööGöÇGöÇ opportunity.py       # Hackathons & bookmarks ('opportunities', 'opportunity_bookmarks')
Göé   Göé
Göé   Gö£GöÇGöÇ schemas/                 # Data validation & response models (Pydantic)
Göé   Göé   Gö£GöÇGöÇ __init__.py
Göé   Göé   Gö£GöÇGöÇ student.py           # Student profile schemas (Create, Read, Update)
Göé   Göé   Gö£GöÇGöÇ matching.py          # Skills/Interests update & matching schemas
Göé   Göé   Gö£GöÇGöÇ community.py         # Community & membership schemas
Göé   Göé   Gö£GöÇGöÇ recommendation.py    # Multi-factor peer & smart community feed schemas
Göé   Göé   GööGöÇGöÇ opportunity.py       # Hackathon, workshop & bookmark schemas
Göé   Göé
Göé   Gö£GöÇGöÇ api/                     # API route controllers
Göé   Göé   Gö£GöÇGöÇ __init__.py
Göé   Göé   GööGöÇGöÇ v1/
Göé   Göé       Gö£GöÇGöÇ __init__.py
Göé   Göé       Gö£GöÇGöÇ router.py        # Central router aggregating all v1 feature routes
Göé   Göé       Gö£GöÇGöÇ students.py      # Student profile CRUD, matching & bookmarks
Göé   Göé       Gö£GöÇGöÇ communities.py   # Community & study group endpoints
Göé   Göé       Gö£GöÇGöÇ recommendations.py# Advanced multi-factor recommendation engine
Göé   Göé       GööGöÇGöÇ opportunities.py # Workshops, hackathons & discovery endpoints
Göé   Göé
Göé   GööGöÇGöÇ services/                # Business logic & algorithms
Göé       Gö£GöÇGöÇ __init__.py
Göé       Gö£GöÇGöÇ student_service.py   # Student database queries and validations
Göé       Gö£GöÇGöÇ matching_service.py  # Jaccard similarity & peer matching algorithm
Göé       Gö£GöÇGöÇ community_service.py # Study group creation, membership & recommendations
Göé       Gö£GöÇGöÇ recommendation_service.py # Multi-factor peer & community recommendation engine
Göé       GööGöÇGöÇ opportunity_service.py   # Event management, bookmarks & discovery engine
Göé
Gö£GöÇGöÇ tests/                       # Automated test suite (41 tests)
Göé   Gö£GöÇGöÇ __init__.py
Göé   Gö£GöÇGöÇ conftest.py              # Test database isolation fixtures
Göé   Gö£GöÇGöÇ test_main.py             # Home & status tests
Göé   Gö£GöÇGöÇ test_students.py         # Student registration & profile tests
Göé   Gö£GöÇGöÇ test_matching.py         # Interest/skill management & peer matching tests
Göé   Gö£GöÇGöÇ test_communities.py      # Study groups, membership & community rec tests
Göé   Gö£GöÇGöÇ test_recommendations.py  # Multi-factor peer & smart feed tests
Göé   GööGöÇGöÇ test_opportunities.py    # Hackathon discovery & bookmarking tests
Göé
Gö£GöÇGöÇ .env.example                 # Template for configuration settings
Gö£GöÇGöÇ .gitignore                   # Files and directories to ignore in Git
Gö£GöÇGöÇ requirements.txt             # Minimal, essential Python dependencies
Gö£GöÇGöÇ urbanpulse.db                # SQLite database file
GööGöÇGöÇ README.md                    # Project documentation and guide
```

---

## =ƒÜÇ How to Run the Project

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
=ƒæë **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## =ƒôí Complete REST API Catalog

### =ƒºæGÇì=ƒÄô Student Profiles & Matching
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

### =ƒæÑ Study Groups & Communities
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/communities/` | Create a new community/study group (creator becomes admin) |
| `GET` | `/api/v1/communities/` | Browse & search communities (supports `search`, `category`, `tag`) |
| `GET` | `/api/v1/communities/{community_id}` | View community details with full member roster |
| `PUT` | `/api/v1/communities/{community_id}` | Creator updates community details |
| `DELETE`| `/api/v1/communities/{community_id}` | Creator deletes community |
| `POST` | `/api/v1/communities/{community_id}/join` | Student joins a community |
| `POST` | `/api/v1/communities/{community_id}/leave` | Student leaves a community |

### =ƒºá Recommendation Engine
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/recommendations/feed/{student_id}` | Unified smart recommendation feed for student dashboard |
| `GET` | `/api/v1/recommendations/peers/{student_id}` | Multi-factor peer recommendations with explainable reasons |
| `GET` | `/api/v1/recommendations/communities/{student_id}` | Context-aware community recommendations with peer network signals |

### =ƒÅå Workshops, Hackathons & Opportunities
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
