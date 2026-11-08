# UrbanPulse — Architecture Document

## System Overview

UrbanPulse is a FastAPI monorepo with four agent routers, a central orchestrator, and a React frontend. The system is designed for local development with planned live API integration.

## Component Diagram

```
[React SPA]  ──HTTP──▶  [FastAPI Orchestrator]
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        [Traffic]        [Events]        [Student]
         Agent             Agent           Agent
              │
        [Environment]
           Agent
```

## Agent Details

### Traffic Agent
- **Endpoint**: `GET /traffic/status`
- **Input**: Location (Belagavi default)
- **Output**: Congestion level, score, alternate routes, alerts
- **Planned ML**: `RandomForestClassifier` on historical congestion features (time, weather, events)
- **Data**: `agents/traffic/data/traffic_sample.csv`

### Events Agent
- **Endpoint**: `GET /events/nearby`
- **Input**: User location, interest query (optional)
- **Output**: Ranked list of nearby events with similarity scores
- **Planned ML**: TF-IDF vectorization of event descriptions + cosine similarity
- **Data**: `agents/events/data/events_sample.csv`

### Student Agent
- **Endpoint**: `GET /student/matches`
- **Input**: Student interest profile
- **Output**: Similar students, recommended clubs/groups
- **Planned ML**: One-hot / TF-IDF interest encoding + cosine similarity matrix
- **Data**: `agents/student/data/student_sample.csv`

### Environment Agent
- **Endpoint**: `GET /environment/status`
- **Input**: Location
- **Output**: AQI, weather, noise, anomaly flag
- **Planned ML**: `IsolationForest` on AQI/noise time series for anomaly detection
- **Data**: `agents/environment/data/environment_sample.csv`
- **APIs**: OpenWeatherMap (weather), OpenAQ (AQI)

## Data Flow for /overview

```
Client → GET /overview
  Orchestrator calls:
    get_traffic_status()     → dict
    get_nearby_events()      → dict
    get_student_matches()    → dict
    get_environment_status() → dict
  Cross-agent analysis:
    if any event.high_attendance → add warning alert
  Return: AgentResponse(agent="traffic", data={all four dicts}, alerts=[...])
```

## Deployment (Future)
- Containerise with Docker Compose
- Each agent can be split into its own service if needed
- Frontend deployed to Vercel/Netlify; backend to Railway/Render
