"""
agents/events/ingest/validate.py
Validation and reporting for Belagavi event ingestion.
Rejects incomplete, inconsistent, out-of-bbox, or invalid rows.
Generates data/ingest_report.md.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from agents.events.ingest.geocode import is_inside_bgm_bbox

logger = logging.getLogger(__name__)

REPORT_FILE = Path(__file__).resolve().parent.parent / "data" / "ingest_report.md"


def validate_event(
    event: Dict[str, Any],
    now: Optional[datetime] = None,
    allow_historical: bool = False,
) -> Tuple[bool, Optional[str]]:
    """Validate a single event dictionary.

    Returns (is_valid, rejection_reason).
    """
    if now is None:
        now = datetime.now(timezone.utc)

    # 1. Required fields
    required = ["event_id", "title", "lat", "lng", "start_datetime", "end_datetime", "data_origin"]
    for f in required:
        if f not in event or event[f] is None or str(event[f]).strip() == "":
            return False, f"Missing required field '{f}'"

    # 2. Coordinates inside Belagavi bounding box
    try:
        lat = float(event["lat"])
        lng = float(event["lng"])
        if not is_inside_bgm_bbox(lat, lng):
            return False, f"Coordinates ({lat}, {lng}) outside Belagavi bounding box (15.70-16.00, 74.35-74.65)"
    except (ValueError, TypeError):
        return False, f"Invalid numerical coordinates: lat={event.get('lat')}, lng={event.get('lng')}"

    # 3. Datetime parsing and order
    try:
        start_dt = datetime.fromisoformat(str(event["start_datetime"]))
        if start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=timezone.utc)
    except Exception as e:
        return False, f"Invalid start_datetime format: {e}"

    try:
        end_dt = datetime.fromisoformat(str(event["end_datetime"]))
        if end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=timezone.utc)
    except Exception as e:
        return False, f"Invalid end_datetime format: {e}"

    if end_dt <= start_dt:
        return False, f"end_datetime ({end_dt}) must be strictly after start_datetime ({start_dt})"

    # 4. Check future date unless allow_historical
    if not allow_historical and end_dt < now:
        return False, f"Event has already ended in the past ({end_dt} < {now})"

    # 5. Check data_origin value
    origin = str(event.get("data_origin", ""))
    if origin not in {"real", "manual", "synthetic_sample"}:
        return False, f"Invalid data_origin '{origin}'. Must be real, manual, or synthetic_sample."

    return True, None


def validate_batch(
    candidates: List[Dict[str, Any]],
    now: Optional[datetime] = None,
    allow_historical: bool = False,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Validate a list of candidate events.

    Returns (accepted_events, rejected_records_with_reason).
    """
    accepted = []
    rejected = []
    for cand in candidates:
        ok, reason = validate_event(cand, now=now, allow_historical=allow_historical)
        if ok:
            accepted.append(cand)
        else:
            rejected.append({"event": cand, "reason": reason})
    return accepted, rejected


def write_ingest_report(
    report_path: Path,
    source_stats: Dict[str, Any],
    accepted: List[Dict[str, Any]],
    duplicates: List[Dict[str, Any]],
    rejected: List[Dict[str, Any]],
) -> None:
    """Generate Markdown ingestion report for auditability and viva demonstration."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    lines = [
        "# Belagavi Event Ingestion Report",
        f"**Generated:** {now_str}",
        "",
        "## Summary",
        f"- **Total Sources Polled:** {source_stats.get('total_sources', 0)}",
        f"- **Raw Items Collected:** {source_stats.get('total_raw', 0)}",
        f"- **Accepted & Normalized:** {len(accepted)}",
        f"- **Duplicates Dropped:** {len(duplicates)}",
        f"- **Validation Rejections:** {len(rejected)}",
        "",
        "## Accepted Events",
    ]

    if accepted:
        lines.append("| ID | Title | Venue | Start (UTC) | Origin | Source |")
        lines.append("|---|---|---|---|---|---|")
        for ev in accepted:
            lines.append(
                f"| {ev.get('event_id')} | {ev.get('title')} | {ev.get('venue')} | "
                f"{ev.get('start_datetime')[:16]} | {ev.get('data_origin')} | {ev.get('source_name')} |"
            )
    else:
        lines.append("_No new events accepted in this run._")

    lines.append("")
    lines.append("## Rejected Records & Out-of-Area Events")
    if rejected:
        lines.append("| Candidate Title | Venue | Stated Lat/Lng | Rejection Reason |")
        lines.append("|---|---|---|---|")
        for item in rejected:
            ev = item.get("event", {})
            title = ev.get("title") or ev.get("raw_title", "Untitled")
            venue = ev.get("venue") or ev.get("raw_venue", "Unknown")
            coords = f"{ev.get('lat', '-')}, {ev.get('lng', '-')}"
            reason = item.get("reason", "Validation failure")
            lines.append(f"| {title} | {venue} | {coords} | {reason} |")
    else:
        lines.append("_Zero rejected events._")

    lines.append("")
    lines.append("## Duplicates Dropped")
    if duplicates:
        lines.append("| Candidate Title | Duplicate of Event ID |")
        lines.append("|---|---|")
        for d in duplicates:
            c = d.get("candidate", {})
            lines.append(f"| {c.get('title', 'Unknown')} | {d.get('duplicate_of', 'Unknown')} |")
    else:
        lines.append("_Zero duplicates found._")

    lines.append("")
    report_path.write_text("\n".join(lines), encoding="utf-8")
    logger.info("Ingestion report written to %s", report_path)
