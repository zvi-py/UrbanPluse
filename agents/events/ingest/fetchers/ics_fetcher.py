"""
agents/events/ingest/fetchers/ics_fetcher.py
Parser for standard iCalendar (.ics) event files.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from icalendar import Calendar

from agents.events.ingest.fetchers.base import BaseFetcher

logger = logging.getLogger(__name__)


class IcsFetcher(BaseFetcher):
    """Fetches and parses candidate events from iCalendar (.ics) files."""

    def parse_events(
        self,
        ics_content: str,
        base_url: str,
        source_meta: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Parse iCalendar text content."""
        if not ics_content:
            return []

        meta = source_meta or {}
        events: List[Dict[str, Any]] = []

        try:
            cal = Calendar.from_ical(ics_content)
        except Exception as exc:
            logger.error("Failed to parse icalendar stream: %s", exc)
            return []

        for component in cal.walk():
            if component.name == "VEVENT":
                try:
                    summary = str(component.get("SUMMARY", "")).strip()
                    if not summary:
                        continue

                    description = str(component.get("DESCRIPTION", "")).strip() or summary
                    location = str(component.get("LOCATION", "")).strip() or meta.get("venue_default", "")

                    dtstart = component.get("DTSTART")
                    dtend = component.get("DTEND")

                    start_iso = None
                    end_iso = None

                    if dtstart:
                        d_val = dtstart.dt
                        if hasattr(d_val, "isoformat"):
                            if isinstance(d_val, datetime) and d_val.tzinfo is None:
                                d_val = d_val.replace(tzinfo=timezone.utc)
                            start_iso = d_val.isoformat()
                        else:
                            # Date only
                            start_iso = f"{d_val.isoformat()}T09:00:00+00:00"

                    if dtend:
                        d_val = dtend.dt
                        if hasattr(d_val, "isoformat"):
                            if isinstance(d_val, datetime) and d_val.tzinfo is None:
                                d_val = d_val.replace(tzinfo=timezone.utc)
                            end_iso = d_val.isoformat()
                        else:
                            end_iso = f"{d_val.isoformat()}T18:00:00+00:00"

                    url = str(component.get("URL", "")).strip() or base_url
                    organizer_raw = str(component.get("ORGANIZER", "")).strip()
                    organizer = organizer_raw or meta.get("organizer_default", "")

                    events.append({
                        "raw_title": summary,
                        "raw_description": description,
                        "raw_date": start_iso,
                        "start_datetime": start_iso,
                        "end_datetime": end_iso,
                        "raw_venue": location,
                        "url": url,
                        "organizer": organizer,
                        "source_id": meta.get("id", "ics_source"),
                        "source_name": meta.get("name", "Public iCalendar Feed"),
                        "category_hint": meta.get("category_hint", ""),
                        "organizer_default": meta.get("organizer_default", ""),
                    })
                except Exception as e:
                    logger.debug("Skipping unparseable VEVENT: %s", e)

        return events

    def fetch_and_parse(
        self,
        url: str,
        source_meta: Optional[Dict[str, Any]] = None,
        force_refresh: bool = False,
    ) -> List[Dict[str, Any]]:
        """Fetch ICS URL and parse into candidate event records."""
        content = self.fetch_url(url, force_refresh=force_refresh)
        if not content:
            return []
        return self.parse_events(content, base_url=url, source_meta=source_meta)
