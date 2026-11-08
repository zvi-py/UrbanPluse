"""
agents/events/ingest/normalize.py
Normalizes raw scraped/feed event records into the UrbanPulse event schema.
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from agents.events.ingest.geocode import BelagaviGeocoder

logger = logging.getLogger(__name__)

CATEGORY_KEYWORD_RULES = {
    "hackathon": ["hackathon", "coding", "ideathon", "makeathon", "codefest"],
    "college_fest": ["fest", "utsav", "symposium", "college fest", "youth festival", "annual day"],
    "workshop": ["workshop", "bootcamp", "hands-on", "masterclass", "training", "tutorial"],
    "academic": ["convocation", "lecture", "seminar", "conference", "colloquium", "research", "degree"],
    "cultural": ["music", "dance", "nrutya", "theatre", "drama", "natya", "concert", "heritage", "classical", "art"],
    "sports": ["cricket", "volleyball", "tournament", "marathon", "badminton", "football", "sports", "athletics"],
    "volunteering": ["nss", "blood donation", "plantation", "cleanliness", "swachh", "ngo", "seva", "outreach"],
    "professional": ["summit", "startup", "expo", "entrepreneurship", "business", "networking", "investor"],
    "community": ["fair", "carnival", "celebration", "food fest", "civic", "parade", "gathering"],
}

CATEGORY_DEFAULT_CAPACITIES = {
    "hackathon": 250,
    "college_fest": 3000,
    "workshop": 120,
    "academic": 500,
    "cultural": 600,
    "sports": 400,
    "volunteering": 150,
    "professional": 400,
    "community": 1000,
}


def infer_category_and_tags(text: str, hint_cat: str = "", hint_tags: Optional[List[str]] = None) -> tuple[str, list[str]]:
    """Infer category and relevant tags based on title/description text."""
    lower_text = text.lower()
    inferred_cat = hint_cat if hint_cat in CATEGORY_KEYWORD_RULES else ""
    found_tags = set(hint_tags or [])

    # Search keywords
    for cat, keywords in CATEGORY_KEYWORD_RULES.items():
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower_text):
                found_tags.add(kw)
                if not inferred_cat:
                    inferred_cat = cat

    if not inferred_cat:
        inferred_cat = "academic" if "student" in lower_text or "college" in lower_text else "community"

    return inferred_cat, sorted(list(found_tags))


def parse_datetime_flexible(dt_str: str) -> Optional[datetime]:
    """Parse various ISO and string date representations into UTC datetime."""
    if not dt_str:
        return None
    dt_str = dt_str.strip()
    try:
        dt = datetime.fromisoformat(dt_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        pass

    # Try common formats
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S GMT",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(dt_str, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


class EventNormalizer:
    """Normalizes raw event candidate records to standardized UrbanPulse event rows."""

    def __init__(self, geocoder: Optional[BelagaviGeocoder] = None) -> None:
        self.geocoder = geocoder or BelagaviGeocoder()

    def normalize(
        self,
        raw_event: Dict[str, Any],
        event_id: str,
        verified_date: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Map raw dictionary to schema format. Returns None if unrecoverable."""
        title = raw_event.get("raw_title", "").strip()
        if not title:
            return None

        description = raw_event.get("raw_description", "").strip() or title
        source_url = raw_event.get("url", "")
        source_name = raw_event.get("source_name", "Public Portal")
        venue_name = raw_event.get("raw_venue", "").strip() or raw_event.get("venue_default", "Belagavi City Center")

        # Geocode venue
        geo_result = self.geocoder.geocode(venue_name)
        if not geo_result:
            logger.info("Could not resolve valid Belagavi coordinates for venue '%s'", venue_name)
            return None

        lat, lng, default_cap = geo_result

        # Parse start & end times
        raw_start = raw_event.get("start_datetime") or raw_event.get("raw_date")
        start_dt = parse_datetime_flexible(raw_start)
        if not start_dt:
            logger.info("Could not parse start date for event '%s': %s", title, raw_start)
            return None

        raw_end = raw_event.get("end_datetime")
        end_dt = parse_datetime_flexible(raw_end) if raw_end else None
        if not end_dt:
            # default duration: 4 hours
            end_dt = start_dt + timedelta(hours=4)

        # Infer category and tags
        combo_text = f"{title} {description} {venue_name}"
        category, tags = infer_category_and_tags(
            combo_text,
            hint_cat=raw_event.get("category_hint", ""),
            hint_tags=raw_event.get("tags_hint", []),
        )

        # Expected attendance & estimate flag
        raw_attendance = raw_event.get("expected_attendance")
        attendance_estimated = False
        if raw_attendance and str(raw_attendance).isdigit():
            expected_attendance = int(raw_attendance)
        else:
            attendance_estimated = True
            expected_attendance = min(default_cap, CATEGORY_DEFAULT_CAPACITIES.get(category, 300))

        organizer = (
            raw_event.get("organizer")
            or raw_event.get("organizer_default")
            or raw_event.get("source_name")
            or "Local Organizer"
        )
        is_free = bool(raw_event.get("is_free", True))
        data_origin = raw_event.get("data_origin", "real")
        v_date = verified_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

        return {
            "event_id": event_id,
            "title": title,
            "description": description,
            "category": category,
            "tags": ";".join(tags) if tags else category,
            "venue": venue_name,
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "start_datetime": start_dt.isoformat(),
            "end_datetime": end_dt.isoformat(),
            "expected_attendance": expected_attendance,
            "is_free": is_free,
            "organizer": organizer,
            "data_origin": data_origin,
            "source_name": source_name,
            "source_url": source_url,
            "verified_on": v_date,
            "attendance_estimated": attendance_estimated,
        }
