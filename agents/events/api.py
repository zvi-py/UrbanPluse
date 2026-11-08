"""
agents/events/api.py
FastAPI router for the Event Agent.
Prefix /events is set by the orchestrator in backend/main.py.
"""
from __future__ import annotations

from fastapi import APIRouter

from backend.schemas import Alert, Location, make_response, AgentResponse
from agents.events.agent import get_nearby_events

router = APIRouter()

BELAGAVI = Location(lat=15.8497, lng=74.4977)


@router.get("/nearby", response_model=AgentResponse)
def events_nearby() -> AgentResponse:
    """GET /events/nearby — stub nearby events data."""
    data = get_nearby_events()
    alerts = [
        Alert(
            level="info",
            message="KLE Tech Fest 2024 is nearby — high attendance expected.",
        )
    ]
    return make_response(
        agent="events",
        data=data,
        alerts=alerts,
        location=BELAGAVI,
        source="stub",
    )
