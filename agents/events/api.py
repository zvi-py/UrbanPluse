"""
agents/events/api.py
FastAPI router for the Event Agent.
Prefix /events is set by the orchestrator in backend/main.py.

Endpoints:
  GET /events/nearby         — nearby events ranked by interests + proximity + time
  GET /events/recommend      — recommendations by user_id or free-text interests
  GET /events/categories     — list of categories with counts
  GET /events/{event_id}     — single event details
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, Query, HTTPException

from backend.schemas import Alert, Location, make_response, AgentResponse
from agents.events.agent import (
    get_nearby_events,
    get_event_by_id,
    get_categories,
    load_users,
    _high_attendance_alerts,
)

logger = logging.getLogger(__name__)

router = APIRouter()

BELAGAVI = Location(lat=15.8497, lng=74.4977)


# ---------------------------------------------------------------------------
# GET /events/nearby
# ---------------------------------------------------------------------------

@router.get("/nearby", response_model=AgentResponse)
def events_nearby(
    lat: float = Query(default=15.8497, ge=-90, le=90, description="Observer latitude"),
    lng: float = Query(default=74.4977, ge=-180, le=180, description="Observer longitude"),
    radius_km: float = Query(default=5.0, gt=0, le=100, description="Search radius in km"),
    interests: str = Query(default="", description="Free-text interests for personalised ranking"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    free_only: bool = Query(default=False, description="Only free events"),
    days: int = Query(default=14, ge=1, le=30, description="Look-ahead days"),
    limit: int = Query(default=10, ge=1, le=50, description="Maximum events returned"),
) -> AgentResponse:
    """GET /events/nearby — ranked nearby events (CSV data, TF-IDF recommender)."""
    result = get_nearby_events(
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        interests=interests,
        category=category,
        free_only=free_only,
        days=days,
        limit=limit,
    )

    if "error" in result:
        return make_response(
            agent="events",
            data=result,
            status="error",
            location=Location(lat=lat, lng=lng),
            source="csv_fallback",
        )

    # Build alerts
    alerts: List[Alert] = []

    # High-attendance warnings
    for a in _high_attendance_alerts(result["events"], __import__("datetime").datetime.now(__import__("datetime").timezone.utc)):
        alerts.append(Alert(level=a["level"], message=a["message"]))

    # Info alert for empty results
    if result["count"] == 0:
        alerts.append(Alert(
            level="info",
            message=f"No events found within {radius_km} km in the next {days} days.",
        ))

    # Fallback info when no interests provided
    if result.get("fallback_reason"):
        alerts.append(Alert(level="info", message=result["fallback_reason"]))

    return make_response(
        agent="events",
        data=result,
        alerts=alerts,
        location=Location(lat=lat, lng=lng),
        source="csv_fallback",
    )


# ---------------------------------------------------------------------------
# GET /events/recommend
# ---------------------------------------------------------------------------

@router.get("/recommend", response_model=AgentResponse)
def events_recommend(
    user_id: Optional[str] = Query(default=None, description="User ID from sample_users.csv"),
    interests: str = Query(default="", description="Free-text interests (overrides user_id lookup)"),
    lat: float = Query(default=15.8497, ge=-90, le=90),
    lng: float = Query(default=74.4977, ge=-180, le=180),
    radius_km: float = Query(default=10.0, gt=0, le=100),
    days: int = Query(default=14, ge=1, le=30),
    limit: int = Query(default=10, ge=1, le=50),
) -> AgentResponse:
    """GET /events/recommend — personalised event recommendations.

    Provide either ?user_id=U001 (looks up interests from sample_users.csv)
    or ?interests=machine+learning+hackathon (free-text query).
    """
    resolved_interests = interests

    if not interests.strip() and user_id:
        try:
            users_df = load_users()
            user_row = users_df[users_df["user_id"] == user_id]
            if user_row.empty:
                raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")
            resolved_interests = str(user_row.iloc[0]["interests"])
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    result = get_nearby_events(
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        interests=resolved_interests,
        days=days,
        limit=limit,
    )

    alerts: List[Alert] = []
    for a in _high_attendance_alerts(
        result.get("events", []),
        __import__("datetime").datetime.now(__import__("datetime").timezone.utc),
    ):
        alerts.append(Alert(level=a["level"], message=a["message"]))

    if result.get("fallback_reason"):
        alerts.append(Alert(level="info", message=result["fallback_reason"]))

    return make_response(
        agent="events",
        data=result,
        alerts=alerts,
        location=Location(lat=lat, lng=lng),
        source="csv_fallback",
    )


# ---------------------------------------------------------------------------
# GET /events/categories
# ---------------------------------------------------------------------------

@router.get("/categories", response_model=AgentResponse)
def events_categories() -> AgentResponse:
    """GET /events/categories — list of event categories with counts."""
    cats = get_categories()
    return make_response(
        agent="events",
        data={"categories": cats, "total_categories": len(cats)},
        alerts=[],
        location=BELAGAVI,
        source="csv_fallback",
    )


# ---------------------------------------------------------------------------
# GET /events/{event_id}  — must be LAST to avoid shadowing other routes
# ---------------------------------------------------------------------------

@router.get("/{event_id}", response_model=AgentResponse)
def event_detail(event_id: str) -> AgentResponse:
    """GET /events/{event_id} — full details for a single event."""
    event = get_event_by_id(event_id)
    if event is None:
        return make_response(
            agent="events",
            data={"event_id": event_id, "detail": "Event not found."},
            status="error",
            source="csv_fallback",
        )
    alerts: List[Alert] = []
    if event.get("high_attendance"):
        alerts.append(Alert(
            level="warning",
            message=(
                f"This event has high expected attendance "
                f"({event['expected_attendance']} attendees). "
                "Plan for increased traffic and limited parking."
            ),
        ))
    return make_response(
        agent="events",
        data=event,
        alerts=alerts,
        location=Location(lat=event["lat"], lng=event["lng"]),
        source="csv_fallback",
    )
