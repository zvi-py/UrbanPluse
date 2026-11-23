"""
agents/events/ingest/geocode.py
Geocoding module for Belagavi venues:
1. Hand-checked local gazetteer (belagavi_venues.csv) matching with aliases.
2. Local JSON geocode cache (geocode_cache.json).
3. OpenStreetMap Nominatim fallback (1 req/sec, polite User-Agent, cached).
4. Hard Belagavi Bounding Box enforcement.
"""
from __future__ import annotations

import json
import logging
import re
import time
from pathlib import Path
from typing import Dict, Optional, Tuple
from urllib.parse import quote

import pandas as pd
import requests

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
GAZETTEER_CSV = DATA_DIR / "belagavi_venues.csv"
GEOCODE_CACHE_FILE = DATA_DIR / "geocode_cache.json"

# Strict Belagavi (BGM) Bounding Box
BGM_BBOX = {
    "min_lat": 15.70,
    "max_lat": 16.00,
    "min_lng": 74.35,
    "max_lng": 74.65,
}

NOMINATIM_USER_AGENT = "UrbanPulse-BelagaviGeocode/1.0 (B.E. AI & Data Science; student-project)"


def is_inside_bgm_bbox(lat: float, lng: float) -> bool:
    """Return True if coordinates fall strictly inside Belagavi bounding box."""
    return (
        BGM_BBOX["min_lat"] <= lat <= BGM_BBOX["max_lat"]
        and BGM_BBOX["min_lng"] <= lng <= BGM_BBOX["max_lng"]
    )


class BelagaviGeocoder:
    """Gazetteer-first geocoder with OSM Nominatim fallback and BBox verification."""

    def __init__(
        self,
        gazetteer_path: Optional[Path] = None,
        cache_path: Optional[Path] = None,
        allow_network: bool = True,
    ) -> None:
        self.gazetteer_path = gazetteer_path or GAZETTEER_CSV
        self.cache_path = cache_path or GEOCODE_CACHE_FILE
        self.allow_network = allow_network
        self._last_osm_request = 0.0
        self.gazetteer_entries = self._load_gazetteer()
        self.cache: Dict[str, list[float]] = self._load_cache()

    def _load_gazetteer(self) -> list[dict]:
        if not self.gazetteer_path.exists():
            logger.warning("Gazetteer CSV not found at %s", self.gazetteer_path)
            return []
        try:
            df = pd.read_csv(self.gazetteer_path)
            entries = []
            for _, row in df.iterrows():
                venue_name = str(row["venue_name"]).strip()
                aliases = [
                    a.strip()
                    for a in str(row.get("aliases", "")).split(";")
                    if a.strip()
                ]
                lat = float(row["lat"])
                lng = float(row["lng"])
                capacity = int(row.get("default_capacity", 500))
                entries.append({
                    "venue_name": venue_name,
                    "aliases": aliases,
                    "lat": lat,
                    "lng": lng,
                    "capacity": capacity,
                })
            return entries
        except Exception as e:
            logger.error("Failed loading gazetteer: %s", e)
            return []

    def _load_cache(self) -> Dict[str, list[float]]:
        if not self.cache_path.exists():
            return {}
        try:
            with open(self.cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning("Failed loading geocode cache: %s", e)
            return {}

    def _save_cache(self) -> None:
        try:
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            logger.warning("Failed saving geocode cache: %s", e)

    def _normalize_name(self, name: str) -> str:
        s = name.lower()
        s = re.sub(r"[^\w\s]", " ", s)
        return " ".join(s.split())

    def lookup_gazetteer(self, query: str) -> Optional[Tuple[float, float, int, str]]:
        """Match query string against gazetteer venues and aliases.

        Returns (lat, lng, default_capacity, canonical_name) or None.
        """
        norm_query = self._normalize_name(query)
        if not norm_query:
            return None

        # 1. Exact match on venue_name or alias
        for entry in self.gazetteer_entries:
            if self._normalize_name(entry["venue_name"]) == norm_query:
                return entry["lat"], entry["lng"], entry["capacity"], entry["venue_name"]
            for alias in entry["aliases"]:
                if self._normalize_name(alias) == norm_query:
                    return entry["lat"], entry["lng"], entry["capacity"], entry["venue_name"]

        # 2. Substring match
        for entry in self.gazetteer_entries:
            target_norm = self._normalize_name(entry["venue_name"])
            if norm_query in target_norm or target_norm in norm_query:
                return entry["lat"], entry["lng"], entry["capacity"], entry["venue_name"]
            for alias in entry["aliases"]:
                a_norm = self._normalize_name(alias)
                if norm_query in a_norm or a_norm in norm_query:
                    return entry["lat"], entry["lng"], entry["capacity"], entry["venue_name"]

        return None

    def query_nominatim(self, venue_name: str) -> Optional[Tuple[float, float]]:
        """Polite OSM Nominatim lookup with Belagavi viewbox constraint."""
        if not self.allow_network:
            return None

        # Rate limit: 1 request / second
        now = time.time()
        elapsed = now - self._last_osm_request
        if elapsed < 1.0:
            time.sleep(1.0 - elapsed)
        self._last_osm_request = time.time()

        url = (
            f"https://nominatim.openstreetmap.org/search?"
            f"q={quote(venue_name + ', Belagavi, Karnataka')}"
            f"&format=json&limit=1&bounded=1&viewbox=74.35,16.00,74.65,15.70"
        )
        headers = {"User-Agent": NOMINATIM_USER_AGENT}

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if data:
                    lat = float(data[0]["lat"])
                    lng = float(data[0]["lon"])
                    if is_inside_bgm_bbox(lat, lng):
                        return lat, lng
        except Exception as e:
            logger.warning("Nominatim lookup failed for '%s': %s", venue_name, e)

        return None

    def geocode(self, venue_name: str) -> Optional[Tuple[float, float, int]]:
        """Resolve venue to (lat, lng, default_capacity). None if unresolved or outside BBox."""
        if not venue_name or not venue_name.strip():
            return None

        norm_name = self._normalize_name(venue_name)

        # 1. Gazetteer lookup
        gaz = self.lookup_gazetteer(venue_name)
        if gaz:
            lat, lng, cap, canonical = gaz
            if is_inside_bgm_bbox(lat, lng):
                # cache normalized name
                self.cache[norm_name] = [round(lat, 5), round(lng, 5)]
                return lat, lng, cap

        # 2. Check local geocode cache
        if norm_name in self.cache:
            coords = self.cache[norm_name]
            lat, lng = coords[0], coords[1]
            if is_inside_bgm_bbox(lat, lng):
                return lat, lng, 500

        # 3. OSM Nominatim fallback
        osm_res = self.query_nominatim(venue_name)
        if osm_res:
            lat, lng = osm_res
            if is_inside_bgm_bbox(lat, lng):
                self.cache[norm_name] = [round(lat, 5), round(lng, 5)]
                self._save_cache()
                return lat, lng, 500

        logger.info("Unresolved or out-of-bounds venue: '%s'", venue_name)
        return None
