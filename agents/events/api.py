"""
agents/events/api.py
FastAPI router for the Event Agent.
Prefix /events is mounted by the orchestrator in backend/main.py.

Endpoints:
  GET    /events/nearby          — ranked nearby events (with sorting, pagination, search)
  GET    /events/recommend       — personalised recommendations (with Rocchio feedback)
  GET    /events/categories      — list of categories with counts
  GET    /events/stats           — viva telemetry, origin breakdown, upcoming counts
  GET    /events/high-impact     — cross-agent helper for Traffic (crowd radius & alerts)
  GET    /events/in-range        — cross-agent spatial-temporal query
  POST   /events/feedback        — user feedback recording (like, save, dismiss)
  GET    /events/profile/{user_id} — user interaction history & inferred preferences
  POST   /events                 — organizer event submission (Admin key protected)
  PUT    /events/{event_id}      — update manual event (Admin key protected)
  DELETE /events/{event_id}      — delete manual event (Admin key protected)
  GET    /events/{event_id}      — single event details (must be last)
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel, Field

from backend.schemas import AgentResponse, Alert, Location, make_response
from agents.events.admin import (
    NewEventSchema,
    UpdateEventSchema,
    add_manual_event,
    delete_manual_event,
    update_manual_event,
    verify_admin_token,
)
from agents.events.agent import (
    _high_attendance_alerts,
    get_categories,
    get_event_by_id,
    get_events_near,
    get_high_impact_events,
    get_nearby_events,
    get_reference_now,
    get_stats,
    load_users,
)
from agents.events.feedback import (
    get_user_profile_summary,
    record_feedback,
)

logger = logging.getLogger(__name__)

router = APIRouter()
BELAGAVI = Location(lat=15.8497, lng=74.4977)


class FeedbackRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    event_id: str = Field(..., min_length=1)
    action: str = Field(..., description="like, save, or dismiss")


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
    limit: int = Query(default=10, ge=1, le=100, description="Maximum events returned"),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
    sort: str = Query(default="recommended", description="recommended, distance, date, attendance"),
    q: Optional[str] = Query(default=None, description="Free-text search keyword"),
    date_from: Optional[datetime] = Query(default=None, description="Filter start date window"),
    date_to: Optional[datetime] = Query(default=None, description="Filter end date window"),
    user_id: Optional[str] = Query(default=None, description="Optional user ID for Rocchio personalized profile"),
) -> AgentResponse:
    """GET /events/nearby — ranked nearby events with multi-factor scoring and Rocchio personalization."""
    now = get_reference_now()

    result = get_nearby_events(
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        interests=interests,
        category=category,
        free_only=free_only,
        days=days,
        limit=limit,
        offset=offset,
        sort=sort,
        q=q,
        date_from=date_from,
        date_to=date_to,
        user_id=user_id,
        now=now,
    )

    if "error" in result:
        return make_response(
            agent="events",
            data=result,
            status="error",
            location=Location(lat=lat, lng=lng),
            source="csv_fallback",
        )

    alerts: List[Alert] = []
    for a in _high_attendance_alerts(result.get("events", []), now):
        alerts.append(Alert(level=a["level"], message=a["message"]))

    if result.get("count", 0) == 0:
        alerts.append(Alert(
            level="info",
            message=f"No events found matching your criteria within {radius_km} km.",
        ))

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
    user_id: Optional[str] = Query(default=None, description="User ID from sample_users.csv or feedback database"),
    interests: str = Query(default="", description="Free-text interests (overrides user_id lookup if provided)"),
    lat: float = Query(default=15.8497, ge=-90, le=90),
    lng: float = Query(default=74.4977, ge=-180, le=180),
    radius_km: float = Query(default=10.0, gt=0, le=100),
    days: int = Query(default=14, ge=1, le=30),
    limit: int = Query(default=10, ge=1, le=50),
) -> AgentResponse:
    """GET /events/recommend — personalised recommendations adapting to student feedback."""
    now = get_reference_now()
    resolved_interests = interests

    if not interests.strip() and user_id:
        try:
            users_df = load_users()
            user_row = users_df[users_df["user_id"] == user_id]
            if not user_row.empty:
                resolved_interests = str(user_row.iloc[0]["interests"])
        except Exception:
            pass

    result = get_nearby_events(
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        interests=resolved_interests,
        user_id=user_id,
        days=days,
        limit=limit,
        now=now,
    )

    alerts: List[Alert] = []
    for a in _high_attendance_alerts(result.get("events", []), now):
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
    cats = get_categories()
    return make_response(
        agent="events",
        data={"categories": cats, "total_categories": len(cats)},
        alerts=[],
        location=BELAGAVI,
        source="csv_fallback",
    )


# ---------------------------------------------------------------------------
# GET /events/stats
# ---------------------------------------------------------------------------

@router.get("/stats", response_model=AgentResponse)
def events_stats() -> AgentResponse:
    """GET /events/stats — comprehensive telemetry and dataset honesty breakdown."""
    stats = get_stats()
    return make_response(
        agent="events",
        data=stats,
        alerts=[],
        location=BELAGAVI,
        source="csv_fallback",
    )


# ---------------------------------------------------------------------------
# Cross-Agent Endpoints: /high-impact and /in-range
# ---------------------------------------------------------------------------

@router.get("/high-impact", response_model=AgentResponse)
def events_high_impact(
    hours_ahead: int = Query(default=48, ge=1, le=168, description="Look-ahead window in hours"),
) -> AgentResponse:
    """GET /events/high-impact — cross-agent endpoint for Traffic and Environment agents."""
    now = get_reference_now()
    events = get_high_impact_events(hours_ahead=hours_ahead, now=now)

    alerts: List[Alert] = []
    if events:
        titles = ", ".join(e["title"] for e in events[:3])
        alerts.append(Alert(
            level="warning",
            message=f"{len(events)} high-impact event(s) detected: {titles}. Expect increased traffic.",
        ))

    return make_response(
        agent="events",
        data={"high_impact_events": events, "count": len(events), "hours_ahead": hours_ahead},
        alerts=alerts,
        location=BELAGAVI,
        source="csv_fallback",
    )


@router.get("/in-range", response_model=AgentResponse)
def events_in_range(
    lat: float = Query(default=15.8497, ge=-90, le=90),
    lng: float = Query(default=74.4977, ge=-180, le=180),
    radius_km: float = Query(default=2.0, gt=0, le=50),
    start: Optional[datetime] = Query(default=None),
    end: Optional[datetime] = Query(default=None),
) -> AgentResponse:
    """GET /events/in-range — spatial-temporal event query used by other agents."""
    now = get_reference_now()
    events = get_events_near(lat=lat, lng=lng, radius_km=radius_km, start=start, end=end, now=now)
    return make_response(
        agent="events",
        data={"events": events, "count": len(events), "lat": lat, "lng": lng, "radius_km": radius_km},
        alerts=[],
        location=Location(lat=lat, lng=lng),
        source="csv_fallback",
    )


# ---------------------------------------------------------------------------
# Feedback & User Profiles (Task 3)
# ---------------------------------------------------------------------------

@router.post("/feedback", response_model=AgentResponse)
def submit_feedback(payload: FeedbackRequest) -> AgentResponse:
    """POST /events/feedback — student feedback loop (like, save, dismiss) for Rocchio updates."""
    try:
        res = record_feedback(user_id=payload.user_id, event_id=payload.event_id, action=payload.action)
        return make_response(
            agent="events",
            data=res,
            alerts=[Alert(level="info", message=f"Feedback recorded: {payload.action} for event {payload.event_id}")],
            location=BELAGAVI,
            source="csv_fallback",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile/{user_id}", response_model=AgentResponse)
def user_profile(user_id: str) -> AgentResponse:
    """GET /events/profile/{user_id} — returns user's feedback profile and inferred interest vector."""
    from agents.events.agent import _cache
    profile = get_user_profile_summary(
        user_id=user_id,
        vectorizer=_cache._vectorizer,
        events_matrix=_cache._matrix,
        event_id_to_idx={eid: idx for idx, eid in enumerate(_cache._event_ids or [])} if _cache._event_ids else None,
    )
    return make_response(
        agent="events",
        data=profile,
        alerts=[],
        location=BELAGAVI,
        source="csv_fallback",
    )


# ---------------------------------------------------------------------------
# Organizer Entry & Admin CRUD (Task 4)
# ---------------------------------------------------------------------------

@router.post("", response_model=AgentResponse)
def create_event(
    event: NewEventSchema,
    x_admin_key: Optional[str] = Header(default=None),
) -> AgentResponse:
    """POST /events — submit a verified manual organizer event (requires X-Admin-Key)."""
    if not verify_admin_token(x_admin_key):
        raise HTTPException(status_code=401, detail="Unauthorized: invalid or missing X-Admin-Key.")

    try:
        new_row = add_manual_event(event)
        return make_response(
            agent="events",
            data={"event": new_row, "message": "Manual event created successfully."},
            alerts=[Alert(level="info", message=f"Event '{new_row['title']}' registered with ID {new_row['event_id']}")],
            location=Location(lat=new_row["lat"], lng=new_row["lng"]),
            source="csv_fallback",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{event_id}", response_model=AgentResponse)
def update_event(
    event_id: str,
    updates: UpdateEventSchema,
    x_admin_key: Optional[str] = Header(default=None),
) -> AgentResponse:
    """PUT /events/{event_id} — update a manual event (requires X-Admin-Key)."""
    if not verify_admin_token(x_admin_key):
        raise HTTPException(status_code=401, detail="Unauthorized: invalid or missing X-Admin-Key.")

    try:
        updated = update_manual_event(event_id, updates)
        return make_response(
            agent="events",
            data={"event": updated, "message": "Event updated successfully."},
            alerts=[],
            location=Location(lat=float(updated["lat"]), lng=float(updated["lng"])),
            source="csv_fallback",
        )
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{event_id}", response_model=AgentResponse)
def delete_event(
    event_id: str,
    x_admin_key: Optional[str] = Header(default=None),
) -> AgentResponse:
    """DELETE /events/{event_id} — delete a manual event (requires X-Admin-Key)."""
    if not verify_admin_token(x_admin_key):
        raise HTTPException(status_code=401, detail="Unauthorized: invalid or missing X-Admin-Key.")

    try:
        res = delete_manual_event(event_id)
        return make_response(
            agent="events",
            data=res,
            alerts=[Alert(level="info", message=f"Event '{event_id}' deleted.")],
            location=BELAGAVI,
            source="csv_fallback",
        )
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


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
