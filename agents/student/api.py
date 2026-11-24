"""
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
    """Return CSV-backed student interest matches."""

    data = get_student_matches()
    match_count = len(data["matches"])

    message = (
        f"{match_count} student match(es) found using interest similarity."
        if match_count
        else "No matching students found in the sample dataset."
    )

    alerts = [Alert(level="info", message=message)]

    return make_response(
        agent="student",
        data=data,
        alerts=alerts,
        location=BELAGAVI,
        source="csv_fallback",
    )
