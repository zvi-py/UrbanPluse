"""
backend/schemas.py
Shared Pydantic response schema — single source of truth.
Every agent endpoint MUST return AgentResponse using make_response().
DO NOT modify without team-lead approval.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field

AgentName = Literal["traffic", "events", "student", "environment"]
AlertLevel = Literal["info", "warning", "critical"]
SourceType = Literal["live_api", "csv_fallback", "stub"]
StatusType = Literal["ok", "error"]


class Location(BaseModel):
    lat: float
    lng: float


class Alert(BaseModel):
    level: AlertLevel
    message: str


class AgentResponse(BaseModel):
    agent: AgentName
    status: StatusType
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    location: Optional[Location] = None
    data: Any
    alerts: List[Alert] = Field(default_factory=list)
    source: SourceType = "stub"


def make_response(
    agent: AgentName,
    data: Any,
    alerts: Optional[List[Alert]] = None,
    location: Optional[Location] = None,
    source: SourceType = "stub",
    status: StatusType = "ok",
) -> AgentResponse:
    """Helper so agents never hand-build the response dict."""
    return AgentResponse(
        agent=agent,
        status=status,
        location=location,
        data=data,
        alerts=alerts or [],
        source=source,
    )
