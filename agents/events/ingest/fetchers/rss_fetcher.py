"""
agents/events/ingest/fetchers/rss_fetcher.py
Parser for public RSS/Atom feeds for academic institutions and civic announcements.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

import feedparser

from agents.events.ingest.fetchers.base import BaseFetcher

logger = logging.getLogger(__name__)


class RssFetcher(BaseFetcher):
    """Fetches and parses candidate events from RSS/Atom feeds."""

    def parse_events(
        self,
        xml_content: str,
        base_url: str,
        source_meta: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Parse RSS/Atom string content using feedparser."""
        if not xml_content:
            return []

        meta = source_meta or {}
        parsed = feedparser.parse(xml_content)
        events: List[Dict[str, Any]] = []

        for entry in parsed.entries:
            try:
                title = entry.get("title", "").strip()
                if not title:
                    continue

                description = entry.get("summary", "") or entry.get("description", "")
                link = entry.get("link", base_url)
                date_str = entry.get("published", "") or entry.get("updated", "")

                tags = []
                if "tags" in entry:
                    tags = [t.get("term", "") for t in entry["tags"] if t.get("term")]

                events.append({
                    "raw_title": title,
                    "raw_description": description,
                    "raw_date": date_str,
                    "raw_venue": meta.get("venue_default", ""),
                    "url": link,
                    "tags_hint": tags,
                    "source_id": meta.get("id", "rss_source"),
                    "source_name": meta.get("name", "Public RSS Feed"),
                    "category_hint": meta.get("category_hint", ""),
                    "organizer_default": meta.get("organizer_default", ""),
                })
            except Exception as e:
                logger.debug("Skipping unparseable RSS entry: %s", e)

        return events

    def fetch_and_parse(
        self,
        url: str,
        source_meta: Optional[Dict[str, Any]] = None,
        force_refresh: bool = False,
    ) -> List[Dict[str, Any]]:
        """Fetch RSS feed and parse into candidate event records."""
        content = self.fetch_url(url, force_refresh=force_refresh)
        if not content:
            return []
        return self.parse_events(content, base_url=url, source_meta=source_meta)
