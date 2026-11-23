
"""
FastAPI router for the Traffic Agent.
Prefix /traffic is mounted by backend.main.
"""

from __future__ import annotations

from fastapi import APIRouter

from backend.schemas import Alert, Location, make_response, AgentResponse
from agents.traffic.agent import get_traffic_status

router = APIRouter()

BELAGAVI = Location(lat=15.8497, lng=74.4977)


@router.get("/status", response_model=AgentResponse)
def traffic_status() -> AgentResponse:
    """GET /traffic/status — Traffic congestion and incident status."""

    data = get_traffic_status()

    alerts = [
        Alert(level=item["level"], message=item["message"])
        for item in data.get("alerts", [])
    ]

    return make_response(
        agent="traffic",
        data=data,
        alerts=alerts,
        location=BELAGAVI,
        source=data.get("source", "stub"),
    )
