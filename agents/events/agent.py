"""
agents/events/agent.py
Event Agent — CSV-based TF-IDF recommender implementation.

Public API (called by backend/main.py orchestrator):
    get_nearby_events(lat, lng, radius_km, interests, ...) -> dict

Ranking formula (documented here and in README.md):
    score = W_SIM * similarity + W_PROX * proximity_score + W_TIME * time_score

    - similarity    : cosine similarity between user interest TF-IDF vector
                      and event TF-IDF text (title + description + category + tags)
    - proximity_score: 1 - (distance_km / radius_km), clipped to [0, 1]
                       Closer events score higher. At the radius boundary → 0.
    - time_score    : 1 - (hours_until_start / HORIZON_HOURS), clipped to [0, 1]
                       Sooner events score higher. Events > HORIZON_HOURS away → 0.

If interests are empty, similarity is set to 0 for all events and the
remaining two components still provide a meaningful ranking by proximity
and time. The response includes a `fallback_reason` field in that case.
"""
from __future__ import annotations

import hashlib
import logging
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# Ranking weights (must sum to 1.0)
W_SIM: float = 0.60
W_PROX: float = 0.25
W_TIME: float = 0.15

# Events with expected_attendance >= this are flagged high_attendance
HIGH_ATTENDANCE_THRESHOLD: int = 1000

# Alert window: warn about high-attendance events starting within this many hours
HIGH_ATTENDANCE_ALERT_HOURS: int = 48

# Time horizon used for time_score normalisation (hours)
HORIZON_HOURS: float = 30 * 24.0  # 30 days

# Default data file location (relative to this module)
_MODULE_DIR = Path(__file__).parent
DEFAULT_EVENTS_CSV = _MODULE_DIR / "data" / "events.csv"
DEFAULT_USERS_CSV = _MODULE_DIR / "data" / "sample_users.csv"

# Required columns in events CSV
REQUIRED_COLUMNS = {
    "event_id", "title", "description", "category", "tags",
    "venue", "lat", "lng", "start_datetime", "end_datetime",
    "expected_attendance", "is_free", "organizer",
}

# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_events(path: Optional[Path] = None) -> pd.DataFrame:
    """Load and validate the events CSV.

    Args:
        path: Path to events CSV. Defaults to agents/events/data/events.csv.

    Returns:
        Cleaned DataFrame with parsed datetimes and correct dtypes.

    Raises:
        FileNotFoundError: If the CSV does not exist.
        ValueError: If required columns are missing.
    """
    csv_path = Path(path) if path is not None else DEFAULT_EVENTS_CSV

    if not csv_path.exists():
        raise FileNotFoundError(f"Events CSV not found: {csv_path}")

    df = pd.read_csv(csv_path, dtype=str)

    # Check required columns
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(
            f"Events CSV is missing required columns: {sorted(missing)}"
        )

    # Parse datetimes (timezone-aware UTC)
    for col in ("start_datetime", "end_datetime"):
        df[col] = pd.to_datetime(df[col], utc=True, errors="coerce")

    # Coerce numerics
    df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
    df["lng"] = pd.to_numeric(df["lng"], errors="coerce")
    df["expected_attendance"] = pd.to_numeric(
        df["expected_attendance"], errors="coerce"
    ).fillna(0).astype(int)

    # Parse booleans
    df["is_free"] = df["is_free"].str.strip().str.lower().isin(
        {"true", "1", "yes"}
    )

    # Drop rows where essential fields are null
    before = len(df)
    df = df.dropna(subset=["lat", "lng", "start_datetime", "event_id"])
    dropped = before - len(df)
    if dropped:
        logger.warning("Dropped %d events with missing lat/lng or start_datetime.", dropped)

    df = df.reset_index(drop=True)
    logger.info("Loaded %d events from %s.", len(df), csv_path)
    return df


def load_users(path: Optional[Path] = None) -> pd.DataFrame:
    """Load sample_users.csv with columns user_id, name, interests."""
    csv_path = Path(path) if path is not None else DEFAULT_USERS_CSV
    if not csv_path.exists():
        raise FileNotFoundError(f"Users CSV not found: {csv_path}")
    return pd.read_csv(csv_path, dtype=str)


# ---------------------------------------------------------------------------
# Geo utilities
# ---------------------------------------------------------------------------

def haversine_km(
    lat1: float | np.ndarray,
    lng1: float | np.ndarray,
    lat2: float | np.ndarray,
    lng2: float | np.ndarray,
) -> float | np.ndarray:
    """Haversine distance in km — vectorised with NumPy.

    Works with scalars or NumPy arrays (broadcast-compatible).

    Args:
        lat1, lng1: Origin latitude/longitude in decimal degrees.
        lat2, lng2: Destination latitude/longitude (or arrays thereof).

    Returns:
        Distance(s) in kilometres.
    """
    R = 6371.0  # Earth radius in km
    lat1_r = np.radians(np.asarray(lat1, dtype=float))
    lng1_r = np.radians(np.asarray(lng1, dtype=float))
    lat2_r = np.radians(np.asarray(lat2, dtype=float))
    lng2_r = np.radians(np.asarray(lng2, dtype=float))

    dlat = lat2_r - lat1_r
    dlng = lng2_r - lng1_r

    a = np.sin(dlat / 2) ** 2 + np.cos(lat1_r) * np.cos(lat2_r) * np.sin(dlng / 2) ** 2
    c = 2 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
    return R * c


# ---------------------------------------------------------------------------
# Filtering
# ---------------------------------------------------------------------------

def filter_events(
    df: pd.DataFrame,
    lat: float,
    lng: float,
    radius_km: float,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    category: Optional[str] = None,
    free_only: bool = False,
    now: Optional[datetime] = None,
) -> pd.DataFrame:
    """Return upcoming events within radius_km of (lat, lng).

    Adds a `distance_km` column to the returned DataFrame.
    Past events (end_datetime < now) are always excluded.

    Args:
        df: Full events DataFrame from load_events().
        lat: Observer latitude.
        lng: Observer longitude.
        radius_km: Search radius in kilometres.
        start: Optional window start (default: now).
        end: Optional window end (default: now + 30 days).
        category: If provided, filter to this category only.
        free_only: If True, return only free events.
        now: Reference datetime (default: UTC now). Inject in tests to avoid
             depending on the real clock.

    Returns:
        Filtered DataFrame with added `distance_km` column, sorted by distance.
    """
    if now is None:
        now = datetime.now(timezone.utc)

    window_start = start if start is not None else now
    window_end = end if end is not None else now + timedelta(days=30)

    # Exclude events that have already ended
    df = df[df["end_datetime"] >= now].copy()

    # Time window filter (start_datetime must be before window_end)
    df = df[df["start_datetime"] <= window_end]
    df = df[df["start_datetime"] >= window_start]

    if category:
        df = df[df["category"].str.lower() == category.lower()]

    if free_only:
        df = df[df["is_free"]]

    # Compute distances (vectorised)
    df["distance_km"] = haversine_km(lat, lng, df["lat"].values, df["lng"].values)
    df = df[df["distance_km"] <= radius_km]

    return df.sort_values("distance_km").reset_index(drop=True)


# ---------------------------------------------------------------------------
# TF-IDF text builder
# ---------------------------------------------------------------------------

def build_text(df: pd.DataFrame) -> pd.Series:
    """Combine title, description, category, and tags into one text per event.

    Tags are semicolon-separated in the CSV; replace semicolons with spaces
    so individual tags become separate TF-IDF tokens.

    Returns:
        Series of combined text strings aligned with df's index.
    """
    return (
        df["title"].fillna("").str.lower()
        + " "
        + df["description"].fillna("").str.lower()
        + " "
        + df["category"].fillna("").str.lower()
        + " "
        + df["tags"].fillna("").str.replace(";", " ", regex=False).str.lower()
    )


# ---------------------------------------------------------------------------
# TF-IDF Recommender (cached singleton)
# ---------------------------------------------------------------------------

class _RecommenderCache:
    """Module-level cache for the fitted TF-IDF vectorizer.

    Rebuilt automatically when the CSV checksum changes (e.g. after edits).
    """

    def __init__(self) -> None:
        self._vectorizer: Optional[TfidfVectorizer] = None
        self._matrix = None          # sparse CSR matrix
        self._event_ids: Optional[List[str]] = None
        self._csv_checksum: Optional[str] = None

    def _csv_md5(self, path: Path) -> str:
        return hashlib.md5(path.read_bytes()).hexdigest()

    def fit(self, df: pd.DataFrame, csv_path: Path) -> None:
        """Fit TF-IDF on the events corpus and cache results."""
        checksum = self._csv_md5(csv_path)
        if checksum == self._csv_checksum and self._vectorizer is not None:
            return  # already up to date

        logger.info("Rebuilding TF-IDF recommender (checksum changed or first run).")
        texts = build_text(df).tolist()
        self._vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1,
        )
        self._matrix = self._vectorizer.fit_transform(texts)
        self._event_ids = df["event_id"].tolist()
        self._csv_checksum = checksum

    def similarity_scores(self, interests: str) -> np.ndarray:
        """Return cosine similarity of interests against all event texts.

        Returns a 1-D array aligned with the fitted corpus order.
        """
        if not interests.strip() or self._vectorizer is None:
            return np.zeros(len(self._event_ids or []))

        user_vec = self._vectorizer.transform([interests.lower()])
        scores = cosine_similarity(user_vec, self._matrix).flatten()
        return scores


_cache = _RecommenderCache()


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def _proximity_score(distance_km: float | np.ndarray, radius_km: float) -> float | np.ndarray:
    """Normalise distance to [0, 1]: 0 at radius boundary, 1 at origin."""
    return np.clip(1.0 - np.asarray(distance_km) / radius_km, 0.0, 1.0)


def _time_score(
    start_dt: pd.Series | datetime,
    now: datetime,
    horizon_hours: float = HORIZON_HOURS,
) -> np.ndarray:
    """Normalise time-until-start to [0, 1]: sooner is higher."""
    if isinstance(start_dt, datetime):
        hours = max((start_dt - now).total_seconds() / 3600, 0)
        return float(np.clip(1.0 - hours / horizon_hours, 0.0, 1.0))

    hours = (start_dt - now).dt.total_seconds() / 3600
    hours = hours.clip(lower=0)
    return np.clip(1.0 - hours.values / horizon_hours, 0.0, 1.0)


# ---------------------------------------------------------------------------
# High-attendance alerts
# ---------------------------------------------------------------------------

def _high_attendance_alerts(
    events: List[Dict[str, Any]],
    now: datetime,
) -> List[Dict[str, str]]:
    """Return warning alerts for high-attendance events starting within 48 h."""
    alerts = []
    cutoff = now + timedelta(hours=HIGH_ATTENDANCE_ALERT_HOURS)
    for ev in events:
        if not ev.get("high_attendance"):
            continue
        try:
            start = datetime.fromisoformat(ev["start_datetime"])
            if start.tzinfo is None:
                start = start.replace(tzinfo=timezone.utc)
        except (KeyError, ValueError):
            continue
        if start <= cutoff:
            alerts.append({
                "level": "warning",
                "message": (
                    f"High-attendance event '{ev['title']}' starts "
                    f"{start.strftime('%Y-%m-%d %H:%M UTC')} "
                    f"(expected {ev.get('expected_attendance', '?')} attendees). "
                    "Expect increased traffic and elevated noise levels nearby."
                ),
            })
    return alerts


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def get_nearby_events(
    lat: float = 15.8497,
    lng: float = 74.4977,
    radius_km: float = 5.0,
    interests: str = "",
    category: Optional[str] = None,
    free_only: bool = False,
    days: int = 14,
    limit: int = 10,
    now: Optional[datetime] = None,
    events_csv: Optional[Path] = None,
) -> Dict[str, Any]:
    """Find, rank, and return nearby events.

    This is the primary public function called by:
      - agents/events/api.py (GET /events/nearby, GET /events/recommend)
      - backend/main.py /overview endpoint

    Args:
        lat: Observer latitude (default: Belagavi centre).
        lng: Observer longitude.
        radius_km: Search radius in km.
        interests: Free-text string of user interests (fed to TF-IDF).
        category: Optional category filter.
        free_only: If True, only free events.
        days: Look-ahead window in days (default 14).
        limit: Maximum events to return.
        now: Reference datetime (inject in tests). Defaults to UTC now.
        events_csv: Override default CSV path (used in tests).

    Returns:
        dict with keys:
          "events"         : list of ranked event dicts
          "count"          : number of events returned
          "total_found"    : total events passing filters (before limit)
          "fallback_reason": non-empty string if interests were empty
          "query"          : echoed query parameters
    """
    if now is None:
        now = datetime.now(timezone.utc)

    # Validate coords
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        return {
            "error": "Invalid lat/lng. lat must be in [-90, 90], lng in [-180, 180].",
            "events": [],
            "count": 0,
        }

    # Load data
    csv_path = events_csv or DEFAULT_EVENTS_CSV
    df_all = load_events(csv_path)

    # Fit / refresh TF-IDF cache
    _cache.fit(df_all, csv_path)

    # Filter
    window_end = now + timedelta(days=days)
    df = filter_events(
        df_all,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        end=window_end,
        category=category,
        free_only=free_only,
        now=now,
    )

    if df.empty:
        return {
            "events": [],
            "count": 0,
            "total_found": 0,
            "fallback_reason": "",
            "query": {
                "lat": lat, "lng": lng, "radius_km": radius_km,
                "interests": interests, "category": category,
                "free_only": free_only, "days": days, "limit": limit,
            },
        }

    # --- Similarity scores ---
    fallback_reason = ""
    if interests.strip():
        # Map fitted corpus indices (by event_id) to filtered df rows
        id_to_sim: Dict[str, float] = {}
        all_scores = _cache.similarity_scores(interests)
        for idx, eid in enumerate(_cache._event_ids or []):
            id_to_sim[eid] = float(all_scores[idx])
        sim_scores = df["event_id"].map(lambda eid: id_to_sim.get(eid, 0.0)).values
    else:
        sim_scores = np.zeros(len(df))
        fallback_reason = (
            "No interests provided — ranking by proximity and time only."
        )

    # --- Component scores ---
    prox_scores = _proximity_score(df["distance_km"].values, radius_km)
    time_scores = _time_score(df["start_datetime"], now)

    # --- Combined ranking score ---
    final_scores = W_SIM * sim_scores + W_PROX * prox_scores + W_TIME * time_scores

    df = df.copy()
    df["_sim"] = sim_scores
    df["_prox"] = prox_scores
    df["_time"] = time_scores
    df["_score"] = final_scores

    df = df.sort_values("_score", ascending=False).head(limit).reset_index(drop=True)

    # --- Serialise ---
    events_out: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        start_dt = row["start_datetime"]
        end_dt = row["end_datetime"]
        events_out.append({
            "event_id": str(row["event_id"]),
            "title": str(row["title"]),
            "category": str(row["category"]),
            "venue": str(row["venue"]),
            "organizer": str(row["organizer"]),
            "lat": float(row["lat"]),
            "lng": float(row["lng"]),
            "start_datetime": start_dt.isoformat() if pd.notna(start_dt) else None,
            "end_datetime": end_dt.isoformat() if pd.notna(end_dt) else None,
            "distance_km": round(float(row["distance_km"]), 3),
            "expected_attendance": int(row["expected_attendance"]),
            "is_free": bool(row["is_free"]),
            "high_attendance": int(row["expected_attendance"]) >= HIGH_ATTENDANCE_THRESHOLD,
            "score": round(float(row["_score"]), 4),
            "score_breakdown": {
                "similarity": round(float(row["_sim"]), 4),
                "proximity": round(float(row["_prox"]), 4),
                "time": round(float(row["_time"]), 4),
            },
        })

    return {
        "events": events_out,
        "count": len(events_out),
        "total_found": len(df),
        "fallback_reason": fallback_reason,
        "query": {
            "lat": lat, "lng": lng, "radius_km": radius_km,
            "interests": interests, "category": category,
            "free_only": free_only, "days": days, "limit": limit,
        },
    }


def get_event_by_id(
    event_id: str,
    events_csv: Optional[Path] = None,
) -> Optional[Dict[str, Any]]:
    """Return full details for a single event, or None if not found."""
    csv_path = events_csv or DEFAULT_EVENTS_CSV
    df = load_events(csv_path)
    row = df[df["event_id"] == event_id]
    if row.empty:
        return None
    r = row.iloc[0]
    return {
        "event_id": str(r["event_id"]),
        "title": str(r["title"]),
        "description": str(r["description"]),
        "category": str(r["category"]),
        "tags": [t.strip() for t in str(r["tags"]).split(";") if t.strip()],
        "venue": str(r["venue"]),
        "organizer": str(r["organizer"]),
        "lat": float(r["lat"]),
        "lng": float(r["lng"]),
        "start_datetime": r["start_datetime"].isoformat() if pd.notna(r["start_datetime"]) else None,
        "end_datetime": r["end_datetime"].isoformat() if pd.notna(r["end_datetime"]) else None,
        "expected_attendance": int(r["expected_attendance"]),
        "is_free": bool(r["is_free"]),
        "high_attendance": int(r["expected_attendance"]) >= HIGH_ATTENDANCE_THRESHOLD,
    }


def get_categories(events_csv: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Return list of categories with event counts."""
    csv_path = events_csv or DEFAULT_EVENTS_CSV
    df = load_events(csv_path)
    counts = df["category"].value_counts()
    return [
        {"category": str(cat), "count": int(cnt)}
        for cat, cnt in counts.items()
    ]
