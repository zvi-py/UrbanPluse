"""
agents/traffic/api.py
FastAPI router for the Traffic Agent.
Prefix /traffic is set by the orchestrator in backend/main.py.
"""
from __future__ import annotations

from fastapi import APIRouter

from backend.schemas import Alert, Location, make_response, AgentResponse
from agents.traffic.agent import get_traffic_status

router = APIRouter()

BELAGAVI = Location(lat=15.8497, lng=74.4977)


@router.get("/status", response_model=AgentResponse)
def traffic_status() -> AgentResponse:
    """GET /traffic/status — stub congestion data."""
    data = get_traffic_status()
    alerts = [
        Alert(
            level="info",
            message="Moderate congestion near Belagavi City Center. Consider the NH48 bypass.",
        )
    ]
    return make_response(
        agent="traffic",
        data=data,
        alerts=alerts,
        location=BELAGAVI,
        source="stub",
    )
