"""
agents/environment/api.py
FastAPI router for the Environment Agent.
Prefix /environment is set by the orchestrator in backend/main.py.
"""
from __future__ import annotations

from fastapi import APIRouter

from backend.schemas import Alert, Location, make_response, AgentResponse
from agents.environment.agent import get_environment_status

router = APIRouter()

BELAGAVI = Location(lat=15.8497, lng=74.4977)


@router.get("/status", response_model=AgentResponse)
def environment_status() -> AgentResponse:
    """GET /environment/status — stub AQI, weather and noise data."""
    data = get_environment_status()
    alerts = [
        Alert(
            level="info",
            message="AQI is moderate (72). Sensitive groups should limit prolonged outdoor activity.",
        )
    ]
    return make_response(
        agent="environment",
        data=data,
        alerts=alerts,
        location=BELAGAVI,
        source="stub",
    )
