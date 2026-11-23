# 🎓 UrbanPulse: College Project Viva & Architecture Guide

This document is your preparation handbook for project presentations, viva examinations, and technical discussions with professors or evaluators.

---

## 🏛️ 1. High-Level System Architecture

UrbanPulse is built using a **layered, decoupled backend architecture**:

```
+---------------------------------------------------------------------------------+
|                               Presentation Layer                                |
|          FastAPI Swagger UI (/docs)  •  ReDoc (/redoc)  •  Frontend Web / Mobile |
+---------------------------------------------------------------------------------+
                                      | HTTP REST (JSON)
                                      v
+---------------------------------------------------------------------------------+
|                           API Controllers (app/api/v1/)                         |
|   • /students         • /communities        • /recommendations   • /opportunities|
+---------------------------------------------------------------------------------+
          |                                                   |
          | Uses Pydantic Schemas                             | Calls
          v (app/schemas/)                                    v
+-----------------------+                    +------------------------------------+
| Data Validation Layer |                    |       Business Logic & Services    |
| • Request parsing     |                    |       (app/services/)              |
| • Type validation     |                    | • Jaccard matching engine          |
| • Response formatting |                    | • Multi-factor peer scoring        |
+-----------------------+                    | • Social-proof community discovery |
                                             +------------------------------------+
                                                              |
                                                              v Uses SQLAlchemy ORM
+---------------------------------------------------------------------------------+
|                             Data Persistence Layer                              |
|                          (app/models/ & app/core/database.py)                   |
|       • Student          • Community         • CommunityMember  • Opportunity   |
+---------------------------------------------------------------------------------+
                                      | SQL
                                      v
+---------------------------------------------------------------------------------+
|                          Database: SQLite (urbanpulse.db)                       |
+---------------------------------------------------------------------------------+
```

---

## 🗄️ 2. Database Schema (Entity-Relationship)

```
   +-------------------+              +----------------------+
   |     students      | 1          * |  community_members   |
   +-------------------+--------------+----------------------+
   | id (PK)           |              | id (PK)              |
   | full_name         |              | community_id (FK)    |
   | email (Unique)    |              | student_id (FK)      |
   | college_name      |              | role (admin/member)  |
   | department        |              | joined_at            |
   | year_of_study     |              +----------------------+
   | skills (JSON)     |                         *
   | interests (JSON)  |                         |
   | bio               |                         | 1
   +-------------------+              +----------------------+
            | 1                       |     communities      |
            |                         +----------------------+
            |                         | id (PK)              |
            |                         | name (Unique)        |
            |                         | description          |
            |                         | category             |
            |                         | topic_tags (JSON)    |
            |                         | created_by (FK)      |
            |                         +----------------------+
            |
            | 1                       +----------------------+
            |                         |    opportunities     |
            |                         +----------------------+
            |                         | id (PK)              |
            |                         | title                |
            |                         | opportunity_type     |
            |                         | organization         |
            |                         | tags (JSON)          |
            |                         | is_online            |
            |                         | event_date           |
            |                         +----------------------+
            |                                    1
            |                                    |
            | *                                  | *
   +---------------------------+                 |
   |   opportunity_bookmarks   |-----------------+
   +---------------------------+
   | id (PK)                   |
   | opportunity_id (FK)       |
   | student_id (FK)           |
   | bookmarked_at             |
   +---------------------------+
```

---

## 🧠 3. Algorithms & Mathematical Formulation

### A. Jaccard Similarity (Core Set Similarity)
Used to compare two students' interest and skill sets:

$$\text{Jaccard}(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

- **Intersection ($|A \cap B|$)**: Number of common tags shared by both students.
- **Union ($|A \cup B|$)**: Total unique tags across both students.
- **Example**:
  - Student A: `{"python", "ai", "fastapi"}`
  - Student B: `{"python", "ai", "react"}`
  - Intersection = `{"python", "ai"}` (size 2)
  - Union = `{"python", "ai", "fastapi", "react"}` (size 4)
  - $\text{Jaccard} = \frac{2}{4} = 0.50$ ($50\%$ match).

### B. Multi-Factor Peer Scoring Formulation
In Phase 5, peer recommendation uses a composite weighted formula:

$$\text{Score} = (0.45 \times J_{\text{interests}}) + (0.25 \times J_{\text{skills}}) + (0.20 \times C_{\text{overlap}}) + (0.10 \times A_{\text{affiliation}})$$

1. **$J_{\text{interests}}$ (45%)**: Core academic & project alignment.
2. **$J_{\text{skills}}$ (25%)**: Complementary skill overlap.
3. **$C_{\text{overlap}}$ (20%)**: Ratio of shared communities both students belong to.
4. **$A_{\text{affiliation}}$ (10%)**: Department or college affinity bonus.

### C. Community Recommendation with Peer-Network Signal
$$\text{Relevance} = (0.65 \times \text{TagOverlap}) + (0.35 \times \text{PeerPresence})$$
- Excludes groups already joined.
- Boosts communities where a student's high-match peers are already active members.

---

## 💡 4. Top Viva Questions & Model Answers

### Q1: Why did you choose FastAPI over Flask or Django?
> **Answer**:  
> "FastAPI is asynchronous (ASGI), which provides significantly higher throughput and lower latency than traditional synchronous frameworks like Flask. It natively integrates with Pydantic for automatic data validation, error handling, and type safety, and automatically generates interactive OpenAPI/Swagger documentation without requiring third-party plugins."

### Q2: What is an ORM and why did you use SQLAlchemy?
> **Answer**:  
> "An Object-Relational Mapper (ORM) bridges Python object-oriented code and relational SQL tables. With SQLAlchemy, we define models as Python classes and interact with them using standard Python methods (`db.query()`, `db.add()`). This avoids SQL injection vulnerabilities, ensures type consistency, and makes it easy to migrate from SQLite to PostgreSQL in the future by simply updating one configuration string."

### Q3: Why did you use SQLite for development, and how will it scale?
> **Answer**:  
> "SQLite requires zero server configuration and runs self-contained as a local file (`urbanpulse.db`), making it ideal for rapid development, testing, and college demonstrations. Because we decoupled the database connection using SQLAlchemy in `app/core/database.py`, upgrading to PostgreSQL or MySQL for production deployment requires only changing the `DATABASE_URL` in `.env` without rewriting any business logic or queries."

### Q4: How does your matching algorithm avoid uppercase/lowercase mismatches?
> **Answer**:  
> "Before running the Jaccard similarity calculation, our matching service normalizes all tags by stripping leading/trailing whitespace and converting strings to lowercase (`tag.strip().lower()`). We preserve the original casing in a dictionary mapping so the user-facing response displays properly formatted names like *'FastAPI'* and *'PyTorch'*."

### Q5: How do you prevent duplicate registrations and duplicate group joins?
> **Answer**:  
> "We employ a two-layer defense:  
> 1. **Application Layer**: In `student_service.py` and `community_service.py`, we query the database before inserting. If the email or membership already exists, we raise an `HTTP 400 Bad Request`.  
> 2. **Database Layer**: We defined `unique=True` on `students.email` and `UniqueConstraint('community_id', 'student_id')` on `community_members`. This ensures database-level integrity even under concurrent requests."

### Q6: What does the `get_db()` dependency do in FastAPI?
> **Answer**:  
> "It implements Python's generator pattern using `yield`. When an API endpoint handles a request, `get_db()` yields an isolated SQLAlchemy database session (`SessionLocal()`). Once the endpoint finishes executing and sends the response, the `finally` block executes automatically, ensuring `db.close()` is called to prevent database connection leaks."

