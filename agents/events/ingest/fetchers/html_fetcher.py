"""
agents/events/ingest/fetchers/html_fetcher.py
Parser for public HTML event pages (universities, colleges, municipal bulletins).
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from agents.events.ingest.fetchers.base import BaseFetcher

logger = logging.getLogger(__name__)


class HtmlFetcher(BaseFetcher):
    """Fetches and parses candidate events from structured HTML pages."""

    def parse_events(
        self,
        html_content: str,
        base_url: str,
        source_meta: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Extract event candidates from HTML."""
        if not html_content:
            return []

        meta = source_meta or {}
        soup = BeautifulSoup(html_content, "html.parser")
        events: List[Dict[str, Any]] = []

        # Common HTML event container patterns
        selectors = [
            ".event-item",
            ".event_item",
            ".type-event",
            ".tribe-events-single",
            ".events-list-item",
            "article.event",
            "article",
            ".notice-item",
            ".news-item",
            "table.events-table tr",
        ]

        found_elements = []
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                found_elements = elements
                break

        # Fallback: look for headings inside main or section
        if not found_elements:
            container = soup.find("main") or soup.find("body") or soup
            found_elements = container.find_all(
                ["div", "li"],
                class_=lambda c: c and any(k in str(c).lower() for k in ["event", "notice", "news", "activity"])
            )

        for elem in found_elements:
            try:
                # Extract Title
                title_elem = elem.select_one("h1, h2, h3, h4, h5, a, strong")
                if not title_elem:
                    continue
                title = title_elem.get_text(strip=True)
                if not title or len(title) < 5:
                    continue

                # Extract Link
                link_elem = elem.select_one("a[href]")
                item_url = urljoin(base_url, link_elem["href"]) if link_elem else base_url

                # Extract Description / Body
                desc_elem = elem.select_one("p, .desc, .description, .content")
                description = desc_elem.get_text(strip=True) if desc_elem else title

                # Extract Date / Time text
                date_elem = elem.select_one("time, .date, .event-date, .published, .datetime")
                date_str = ""
                if date_elem:
                    if date_elem.get("datetime"):
                        date_str = date_elem["datetime"]
                    else:
                        date_str = date_elem.get_text(strip=True)

                # Extract Venue if explicitly tagged
                venue_elem = elem.select_one(".venue, .location, .place")
                venue_str = (
                    venue_elem.get_text(strip=True)
                    if venue_elem
                    else meta.get("venue_default", "")
                )

                events.append({
                    "raw_title": title,
                    "raw_description": description,
                    "raw_date": date_str,
                    "raw_venue": venue_str,
                    "url": item_url,
                    "source_id": meta.get("id", "html_source"),
                    "source_name": meta.get("name", "Public HTML Portal"),
                    "category_hint": meta.get("category_hint", ""),
                    "organizer_default": meta.get("organizer_default", ""),
                })
            except Exception as e:
                logger.debug("Skipping unparseable HTML element: %s", e)

        return events

    def fetch_and_parse(
        self,
        url: str,
        source_meta: Optional[Dict[str, Any]] = None,
        force_refresh: bool = False,
    ) -> List[Dict[str, Any]]:
        """Fetch URL and parse into candidate event records."""
        html = self.fetch_url(url, force_refresh=force_refresh)
        if not html:
            return []
        return self.parse_events(html, base_url=url, source_meta=source_meta)
