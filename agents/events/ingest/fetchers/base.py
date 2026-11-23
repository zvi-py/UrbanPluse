"""
agents/events/ingest/fetchers/base.py
Polite, rate-limited, disk-cached base fetcher for UrbanPulse event ingestion.
"""
from __future__ import annotations

import hashlib
import logging
import time
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import requests

logger = logging.getLogger(__name__)

DEFAULT_USER_AGENT = (
    "UrbanPulse-EventsIngest/1.0 (B.E. AI & Data Science Project; Belagavi Smart City)"
)
DEFAULT_CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / ".cache" / "http"


class BaseFetcher:
    """Base class for HTTP/Feed/Calendar fetchers with rate-limiting and caching."""

    def __init__(
        self,
        rate_limit_sec: float = 1.0,
        user_agent: str = DEFAULT_USER_AGENT,
        cache_dir: Optional[Path] = None,
        cache_ttl_sec: int = 86400,  # 24 hours
        timeout: int = 15,
    ) -> None:
        self.rate_limit_sec = rate_limit_sec
        self.user_agent = user_agent
        self.cache_dir = cache_dir or DEFAULT_CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.cache_ttl_sec = cache_ttl_sec
        self.timeout = timeout
        self._last_request_time: Dict[str, float] = {}

    def _get_cache_path(self, url: str) -> Path:
        url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
        return self.cache_dir / f"{url_hash}.cache"

    def _read_cache(self, url: str) -> Optional[str]:
        cache_path = self._get_cache_path(url)
        if not cache_path.exists():
            return None
        mtime = cache_path.stat().st_mtime
        if time.time() - mtime > self.cache_ttl_sec:
            return None
        try:
            return cache_path.read_text(encoding="utf-8")
        except Exception as e:
            logger.warning("Cache read failed for %s: %s", url, e)
            return None

    def _write_cache(self, url: str, content: str) -> None:
        cache_path = self._get_cache_path(url)
        try:
            cache_path.write_text(content, encoding="utf-8")
        except Exception as e:
            logger.warning("Cache write failed for %s: %s", url, e)

    def _rate_limit(self, url: str) -> None:
        host = urlparse(url).netloc
        now = time.time()
        last_time = self._last_request_time.get(host, 0.0)
        elapsed = now - last_time
        if elapsed < self.rate_limit_sec:
            sleep_needed = self.rate_limit_sec - elapsed
            time.sleep(sleep_needed)
        self._last_request_time[host] = time.time()

    def fetch_url(self, url: str, force_refresh: bool = False) -> Optional[str]:
        """Fetch URL content with disk caching, rate limiting, and timeout safety."""
        # Check cache unless force refresh
        if not force_refresh:
            cached = self._read_cache(url)
            if cached is not None:
                logger.debug("Cache hit for %s", url)
                return cached

        self._rate_limit(url)
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml,text/calendar,*/*;q=0.9",
        }
        try:
            logger.info("Fetching: %s", url)
            resp = requests.get(url, headers=headers, timeout=self.timeout)
            resp.raise_for_status()
            content = resp.text
            self._write_cache(url, content)
            return content
        except Exception as exc:
            logger.error("Failed to fetch %s: %s", url, exc)
            return None
