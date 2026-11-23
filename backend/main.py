"""
backend/main.py
Central FastAPI orchestrator for UrbanPulse.
Includes all four agent routers and provides /health and /overview endpoints.
DO NOT modify without team-lead approval.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import Alert, AgentResponse, make_response
from agents.traffic.api import router as traffic_router
from agents.events.api import router as events_router
from agents.student.api import router as student_router
from agents.environment.api import router as environment_router

from agents.traffic.agent import get_traffic_status
from agents.events.agent import get_nearby_events
from agents.student.agent import get_student_matches
from agents.environment.agent import get_environment_status

app = FastAPI(
    title="UrbanPulse API",
    description="Multi-agent AI platform for smart urban life — Belagavi, Karnataka",
    version="0.1.0",
)

# Allow React dev server (Vite default: 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount agent routers
app.include_router(traffic_router, prefix="/traffic", tags=["Traffic"])
app.include_router(events_router, prefix="/events", tags=["Events"])
app.include_router(student_router, prefix="/student", tags=["Student"])
app.include_router(environment_router, prefix="/environment", tags=["Environment"])


@app.get("/health", tags=["System"])
def health() -> dict:
    return {"status": "ok"}


@app.get("/overview", response_model=AgentResponse, tags=["System"])
def overview() -> AgentResponse:
    """
    Calls all four agent logic functions directly (no HTTP round-trips)
    and returns a combined payload wrapped in the common schema.
    Cross-agent insight: if any event is flagged high_attendance, add
    warning alerts about expected traffic and noise.
    """
    traffic_data = get_traffic_status()
    events_data = get_nearby_events()
    student_data = get_student_matches()
    env_data = get_environment_status()

    combined = {
        "traffic": traffic_data,
        "events": events_data,
        "student": student_data,
        "environment": env_data,
    }

    # Cross-agent insight: high-attendance event -> traffic + noise warning
    alerts: list[Alert] = []
    events_list = events_data.get("events", [])
    high_attendance = [e for e in events_list if e.get("high_attendance", False)]
    if high_attendance:
        event_names = ", ".join(e.get("title", "Unknown") for e in high_attendance)
        alerts.append(
            Alert(
                level="warning",
                message=(
                    f"High-attendance event(s) detected: {event_names}. "
                    "Expect increased traffic congestion and elevated noise levels nearby."
                ),
            )
        )

    return make_response(
        agent="traffic",  # overview uses "traffic" as the envelope agent name
        data=combined,
        alerts=alerts,
        source="stub",
    )
