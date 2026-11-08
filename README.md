# UrbanPulse 🌆

> A multi-agent AI platform for smart urban life — Belagavi, Karnataka
> B.E. AI & Data Science — College Mini Project

UrbanPulse combines traffic, events, student connectivity and environmental data into a single interactive dashboard. It demonstrates how city-scale events (e.g. a college fest) ripple across multiple dimensions: traffic congestion, noise levels and air quality.

---

## Architecture

```
React Dashboard (Vite + Leaflet)
        │  HTTP
        ▼
FastAPI Orchestrator  (/overview, /health)
  ├── Traffic Agent    (/traffic/status)
  ├── Events Agent     (/events/nearby)
  ├── Student Agent    (/student/matches)
  └── Environment Agent (/environment/status)
```

Each agent is an independent FastAPI `APIRouter` mounted into the central orchestrator. Agents communicate through direct Python function calls within the same process — no internal HTTP overhead.

---

## Agent Summary

| Agent | Endpoint | Planned ML | Status |
|-------|----------|-----------|--------|
| Traffic | `/traffic/status` | Congestion classification (scikit-learn RandomForest) | **stub** |
| Events | `/events/nearby` | TF-IDF + cosine similarity recommendations | **stub** |
| Student | `/student/matches` | Interest cosine similarity matching | **stub** |
| Environment | `/environment/status` | AQI anomaly detection (Isolation Forest) | **stub** |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Pydantic v2 |
| ML / Data | scikit-learn, pandas |
| Frontend | React (Vite), Leaflet + OpenStreetMap |
| Data Sources | OpenWeatherMap, OpenAQ, Traffic APIs, CSVs |

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)
- Git

### Backend

```bash
# Clone the repo
git clone https://github.com/zvi-py/UrbanPluse.git
cd UrbanPluse

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the development server
uvicorn backend.main:app --reload
```

API will be available at: http://localhost:8000
Interactive docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Project Structure

```
urbanpulse/
├── AGENTS.md              ← Read this first!
├── README.md
├── requirements.txt
├── .env.example
├── backend/
│   ├── main.py            ← Orchestrator (DO NOT modify without lead approval)
│   └── schemas.py         ← Shared schema (DO NOT modify without lead approval)
├── agents/
│   ├── traffic/           ← Traffic Developer's folder
│   ├── events/            ← Events Developer's folder
│   ├── student/           ← Student Developer's folder
│   └── environment/       ← Environment Developer's folder
├── data/                  ← Shared datasets
├── frontend/              ← React dashboard
└── docs/                  ← Architecture and API docs
```

---

## Running Tests

```bash
# From the repo root (with venv activated)
pytest
```

---

## Contributing

See [AGENTS.md](AGENTS.md) for team collaboration rules. Use feature branches and pull requests — **never push directly to main**.
