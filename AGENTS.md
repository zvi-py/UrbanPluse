# AGENTS.md — UrbanPulse Multi-Agent Platform

> **⚠️ Read this file before writing a single line of code.**
> This is the authoritative guide for all four developers working on UrbanPulse.
> AI coding assistants: read and follow these instructions.

---

## Project Overview

UrbanPulse is a multi-agent AI platform demonstrating smart urban life for Belagavi, Karnataka. It shows how a single city-scale event (e.g. KLE Tech Fest) causes measurable changes across traffic, air quality, noise levels, and student activity — all visualised on a live Leaflet/OpenStreetMap dashboard.

The backend is a **single FastAPI process** that hosts four lightweight agent routers, coordinated by a central orchestrator. The frontend is a Vite + React SPA.

---

## 4-Agent Architecture

```
React Frontend (Vite + Leaflet)
        │
        │  HTTP (CORS-enabled)
        ▼
┌─────────────────────────────────────────┐
│   FastAPI Orchestrator  (backend/main.py) │
│   GET /health  GET /overview            │
│                                         │
│  ┌──────────┐  ┌──────────┐             │
│  │  Traffic  │  │  Events  │             │
│  │  Agent    │  │  Agent   │             │
│  │ /traffic/ │  │ /events/ │             │
│  │  status   │  │  nearby  │             │
│  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ Student  │  │   Environment Agent  │ │
│  │  Agent   │  │  /environment/status │ │
│  │/student/ │  └──────────────────────┘ │
│  │ matches  │                           │
│  └──────────┘                           │
└─────────────────────────────────────────┘
```

**Key design**: agents communicate via **direct Python function calls**, never internal HTTP. The orchestrator imports and calls `get_traffic_status()`, `get_nearby_events()`, etc. directly.

---

## Folder Layout & Ownership

| Developer | Owns | Endpoints |
|-----------|------|-----------|
| Developer 1 | `agents/traffic/` | `GET /traffic/status` |
| Developer 2 | `agents/events/` | `GET /events/nearby` |
| Developer 3 | `agents/student/` | `GET /student/matches` |
| Developer 4 | `agents/environment/` | `GET /environment/status` |
| Team Lead | `backend/`, `frontend/`, root files | `/health`, `/overview` |

```
urbanpulse/
├── AGENTS.md              ← everyone reads
├── README.md              ← team lead maintains
├── requirements.txt       ← team lead maintains
├── .env.example           ← team lead maintains
├── backend/
│   ├── main.py            ← TEAM LEAD ONLY
│   └── schemas.py         ← TEAM LEAD ONLY
├── agents/
│   ├── traffic/           ← Developer 1
│   │   ├── agent.py       ← implement get_traffic_status() here
│   │   ├── api.py         ← FastAPI router (do not change prefix)
│   │   ├── data/          ← CSV datasets for traffic
│   │   └── tests/         ← pytest tests
│   ├── events/            ← Developer 2
│   │   ├── agent.py       ← implement get_nearby_events() here
│   │   ├── api.py
│   │   ├── data/
│   │   └── tests/
│   ├── student/           ← Developer 3
│   │   ├── agent.py       ← implement get_student_matches() here
│   │   ├── api.py
│   │   ├── data/
│   │   └── tests/
│   └── environment/       ← Developer 4
│       ├── agent.py       ← implement get_environment_status() here
│       ├── api.py
│       ├── data/
│       └── tests/
├── data/                  ← shared datasets (team lead)
├── frontend/              ← team lead / all
└── docs/                  ← all developers contribute
```

---

## Common Response Schema

**Every agent endpoint MUST return this exact shape.** The schema is defined in [`backend/schemas.py`](backend/schemas.py) — that file is the single source of truth.

```json
{
  "agent": "traffic | events | student | environment",
  "status": "ok | error",
  "timestamp": "2024-01-15T08:00:00+00:00",
  "location": {"lat": 15.8497, "lng": 74.4977},
  "data": { },
  "alerts": [
    {"level": "info | warning | critical", "message": "string"}
  ],
  "source": "live_api | csv_fallback | stub"
}
```

**Use the helper — never build the dict manually:**
```python
from backend.schemas import make_response, Alert, Location

return make_response(
    agent="traffic",
    data={"congestion_level": "moderate"},
    alerts=[Alert(level="info", message="Light traffic ahead.")],
    location=Location(lat=15.8497, lng=74.4977),
    source="stub",   # change to "csv_fallback" or "live_api" when ready
)
```

---

## Development Rules

1. **Only edit files inside your own agent folder** unless explicitly told otherwise by the team lead.

2. **Never change `backend/schemas.py` or `backend/main.py`** without asking the team lead. These files are the shared contract — a breaking change affects everyone.

3. **Every agent endpoint returns the common schema**, using `make_response()`. Do not invent custom response shapes.

4. **Build the CSV/sample-data version first; add live APIs afterwards**, with CSV as fallback. Set the `source` field honestly: `"stub"` → `"csv_fallback"` → `"live_api"`.

5. **No API keys in code.** Use environment variables. Add new keys to `.env.example` (ask the team lead) and load them with `python-dotenv`:
   ```python
   import os
   from dotenv import load_dotenv
   load_dotenv()
   API_KEY = os.getenv("MY_API_KEY")
   ```

6. **Agents are ordinary Python modules with small scikit-learn models.** Do not try to "train an LLM". The TODO comments in each `agent.py` say "implement the X logic" — that means classical ML (RandomForest, TF-IDF, Isolation Forest, cosine similarity).

7. **Add tests in the agent's `tests/` folder.** Keep functions small and typed. Run `pytest` before every pull request.

8. **Use feature branches and pull requests; never push to main.** Branch naming: `feature/<agent>-<description>` e.g. `feature/traffic-congestion-classifier`.

---

## Running the Project

### Backend
```bash
# From the repo root (with venv activated)
uvicorn backend.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Tests
```bash
# From the repo root (with venv activated)
pytest
# Or for a specific agent:
pytest agents/traffic/tests/
```

---

## Cross-Agent Interactions (the fun part!)

The `/overview` endpoint demonstrates cross-agent reasoning. Example already implemented:

> **High-attendance event detected** → automatic warning alert added to overview response:
> *"High-attendance event(s) detected: KLE Tech Fest 2024. Expect increased traffic congestion and elevated noise levels nearby."*

As you implement real logic, consider adding more cross-agent signals:
- High AQI during outdoor event → environment warns events agent
- Traffic jam on College Road during fest → traffic warns student agent about commute delays
- High noise near residential area → environment critical alert

---

## Questions?

Raise a GitHub issue or ask in the team group chat. When in doubt, read this file first.
