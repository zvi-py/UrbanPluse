"""
agents/student/api.py
FastAPI router for the Student Agent.
Prefix /student is set by the orchestrator in backend/main.py.
"""
from __future__ import annotations

from fastapi import APIRouter

from backend.schemas import Alert, Location, make_response, AgentResponse
from agents.student.agent import get_student_matches

router = APIRouter()

BELAGAVI = Location(lat=15.8497, lng=74.4977)


@router.get("/matches", response_model=AgentResponse)
def student_matches() -> AgentResponse:
    """GET /student/matches — stub student interest matching."""
    data = get_student_matches()
    alerts = [
        Alert(
            level="info",
            message="3 students with high interest similarity found on campus.",
        )
    ]
    return make_response(
        agent="student",
        data=data,
        alerts=alerts,
        location=BELAGAVI,
        source="stub",
    )
