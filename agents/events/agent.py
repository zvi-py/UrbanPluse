"""
agents/events/agent.py
Event Agent — Phase 2 Recommender, Cross-Agent Contract, and Feedback Integration.
Belagavi (BGM), Karnataka.

Public API (called by backend/main.py orchestrator and other agents):
    get_nearby_events(...) -> dict
    get_high_impact_events(...) -> list[dict]
    get_events_near(...) -> list[dict]
    get_stats(...) -> dict
"""
from __future__ import annotations

import hashlib
import logging
import math
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from agents.events.feedback import compute_rocchio_vector
from agents.events.model.preprocessor import TextPreprocessor
from agents.events.model.train import load_config, load_or_train_model

logger = logging.getLogger(__name__)

# Ranking weights fallback
W_SIM: float = 0.60
W_PROX: float = 0.25
W_TIME: float = 0.15

HIGH_ATTENDANCE_THRESHOLD: int = 1000
HIGH_ATTENDANCE_ALERT_HOURS: int = 48
HORIZON_HOURS: float = 30 * 24.0  # 30 days

_MODULE_DIR = Path(__file__).resolve().parent
DEFAULT_EVENTS_CSV = _MODULE_DIR / "data" / "events.csv"
DEFAULT_USERS_CSV = _MODULE_DIR / "data" / "sample_users.csv"

REQUIRED_COLUMNS = {
    "event_id", "title", "description", "category", "tags",
    "venue", "lat", "lng", "start_datetime", "end_datetime",
    "expected_attendance", "is_free", "organizer",
}


def get_reference_now(now: Optional[datetime] = None) -> datetime:
    """Return effective datetime, honoring EVENTS_REFERENCE_NOW env var for viva/demo stability."""
    if now is not None:
        if now.tzinfo is None:
            return now.replace(tzinfo=timezone.utc)
        return now

    env_val = os.getenv("EVENTS_REFERENCE_NOW")
    if env_val:
        try:
            dt = datetime.fromisoformat(env_val.strip())
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception as e:
            logger.warning("Could not parse EVENTS_REFERENCE_NOW='%s': %s", env_val, e)

    return datetime.now(timezone.utc)


def load_events(path: Optional[Path] = None) -> pd.DataFrame:
    """Load and validate the events CSV."""
    csv_path = Path(path) if path is not None else DEFAULT_EVENTS_CSV

    if not csv_path.exists():
        raise FileNotFoundError(f"Events CSV not found: {csv_path}")

    df = pd.read_csv(csv_path, dtype=str)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Events CSV is missing required columns: {sorted(missing)}")

    # Default optional Phase 2 fields if missing in test fixtures
    if "data_origin" not in df.columns:
        df["data_origin"] = "synthetic_sample"
    if "source_name" not in df.columns:
        df["source_name"] = "UrbanPulse Dataset"
    if "source_url" not in df.columns:
        df["source_url"] = "local://sample"
    if "verified_on" not in df.columns:
        df["verified_on"] = "2026-11-08"
    if "attendance_estimated" not in df.columns:
        df["attendance_estimated"] = "False"

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
    df["is_free"] = df["is_free"].str.strip().str.lower().isin({"true", "1", "yes"})
    df["attendance_estimated"] = df["attendance_estimated"].astype(str).str.strip().str.lower().isin({"true", "1", "yes"})

    before = len(df)
    df = df.dropna(subset=["lat", "lng", "start_datetime", "event_id"])
    dropped = before - len(df)
    if dropped:
        logger.warning("Dropped %d events with missing lat/lng or start_datetime.", dropped)

    df = df.reset_index(drop=True)
    return df


def load_users(path: Optional[Path] = None) -> pd.DataFrame:
    """Load sample_users.csv with columns user_id, name, interests."""
    csv_path = Path(path) if path is not None else DEFAULT_USERS_CSV
    if not csv_path.exists():
        raise FileNotFoundError(f"Users CSV not found: {csv_path}")
    return pd.read_csv(csv_path, dtype=str)


def haversine_km(
    lat1: float | np.ndarray,
    lng1: float | np.ndarray,
    lat2: float | np.ndarray,
    lng2: float | np.ndarray,
) -> float | np.ndarray:
    """Haversine distance in km — vectorised with NumPy."""
    R = 6371.0
    lat1_r = np.radians(np.asarray(lat1, dtype=float))
    lng1_r = np.radians(np.asarray(lng1, dtype=float))
    lat2_r = np.radians(np.asarray(lat2, dtype=float))
    lng2_r = np.radians(np.asarray(lng2, dtype=float))

    dlat = lat2_r - lat1_r
    dlng = lng2_r - lng1_r

    a = np.sin(dlat / 2) ** 2 + np.cos(lat1_r) * np.cos(lat2_r) * np.sin(dlng / 2) ** 2
    c = 2 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
    return R * c


def filter_events(
    df: pd.DataFrame,
    lat: float,
    lng: float,
    radius_km: float,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    category: Optional[str] = None,
    free_only: bool = False,
    q: Optional[str] = None,
    now: Optional[datetime] = None,
) -> pd.DataFrame:
    """Return upcoming events within radius_km of (lat, lng) matching filters."""
    now = get_reference_now(now)

    window_start = start if start is not None else now
    window_end = end if end is not None else now + timedelta(days=30)

    # Exclude events that have already ended
    df = df[df["end_datetime"] >= now].copy()

    # Time window filter
    df = df[df["start_datetime"] <= window_end]
    df = df[df["start_datetime"] >= window_start]

    if category:
        df = df[df["category"].str.lower() == category.lower()]

    if free_only:
        df = df[df["is_free"]]

    if q and q.strip():
        q_term = q.strip().lower()
        title_match = df["title"].str.lower().str.contains(q_term, regex=False, na=False)
        desc_match = df["description"].str.lower().str.contains(q_term, regex=False, na=False)
        tags_match = df["tags"].str.lower().str.contains(q_term, regex=False, na=False)
        df = df[title_match | desc_match | tags_match]

    # Compute distances
    df["distance_km"] = haversine_km(lat, lng, df["lat"].values, df["lng"].values)
    df = df[df["distance_km"] <= radius_km]

    return df.sort_values("distance_km").reset_index(drop=True)


def build_text(df: pd.DataFrame) -> pd.Series:
    """Combine title, description, category, and tags into preprocessed text."""
    preprocessor = TextPreprocessor()
    return preprocessor.build_event_text(df)


# ---------------------------------------------------------------------------
# Recommender Cache Singleton with Artifact Loading & Rocchio Support
# ---------------------------------------------------------------------------

class _RecommenderCache:
    def __init__(self) -> None:
        self._vectorizer: Optional[TfidfVectorizer] = None
        self._matrix = None
        self._event_ids: Optional[List[str]] = None
        self._csv_checksum: Optional[str] = None
        self._weights = {"w_sim": W_SIM, "w_prox": W_PROX, "w_time": W_TIME}

    def _csv_md5(self, path: Path) -> str:
        return hashlib.md5(path.read_bytes()).hexdigest()

    def fit(self, df: pd.DataFrame, csv_path: Path) -> None:
        checksum = self._csv_md5(csv_path)
        if checksum == self._csv_checksum and self._vectorizer is not None:
            return

        # If standard events.csv, try loading serialized artifact first
        if csv_path == DEFAULT_EVENTS_CSV:
            try:
                vec, mat, ids, cfg = load_or_train_model(events_csv=csv_path)
                self._vectorizer = vec
                self._matrix = mat
                self._event_ids = ids
                self._weights = {
                    "w_sim": cfg.get("w_sim", W_SIM),
                    "w_prox": cfg.get("w_prox", W_PROX),
                    "w_time": cfg.get("w_time", W_TIME),
                }
                self._csv_checksum = checksum
                return
            except Exception as e:
                logger.warning("Failed loading trained artifacts: %s. Rebuilding in memory.", e)

        # On-the-fly fit for fixture CSVs in unit tests
        texts = build_text(df).tolist()
        cfg = load_config()
        ngram = tuple(cfg.get("ngram_range", [1, 2]))
        self._vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=ngram,
            sublinear_tf=cfg.get("sublinear_tf", True),
            min_df=1,
            max_df=cfg.get("max_df", 0.95),
        )
        self._matrix = self._vectorizer.fit_transform(texts)
        self._event_ids = df["event_id"].astype(str).tolist()
        self._weights = {
            "w_sim": cfg.get("w_sim", W_SIM),
            "w_prox": cfg.get("w_prox", W_PROX),
            "w_time": cfg.get("w_time", W_TIME),
        }
        self._csv_checksum = checksum

    def similarity_scores(self, interests: str, user_id: Optional[str] = None) -> np.ndarray:
        if self._vectorizer is None or self._matrix is None:
            return np.zeros(len(self._event_ids or []))

        preprocessor = TextPreprocessor()
        clean_interests = preprocessor.preprocess(interests) if interests else ""

        if clean_interests:
            init_vec = self._vectorizer.transform([clean_interests]).toarray().flatten()
        else:
            init_vec = np.zeros(self._matrix.shape[1])

        # Apply Rocchio feedback update if user_id is provided
        if user_id and self._event_ids:
            event_id_to_idx = {eid: idx for idx, eid in enumerate(self._event_ids)}
            query_vec = compute_rocchio_vector(
                initial_vec=init_vec,
                user_id=user_id,
                events_matrix=self._matrix,
                event_id_to_idx=event_id_to_idx,
            )
        else:
            query_vec = init_vec

        if np.all(query_vec == 0):
            return np.zeros(len(self._event_ids or []))

        scores = cosine_similarity(query_vec.reshape(1, -1), self._matrix).flatten()
        return scores


_cache = _RecommenderCache()


def _proximity_score(distance_km: float | np.ndarray, radius_km: float) -> float | np.ndarray:
    return np.clip(1.0 - np.asarray(distance_km) / radius_km, 0.0, 1.0)


def _time_score(
    start_dt: pd.Series | datetime,
    now: datetime,
    horizon_hours: float = HORIZON_HOURS,
) -> np.ndarray:
    if isinstance(start_dt, datetime):
        hours = max((start_dt - now).total_seconds() / 3600, 0)
        return float(np.clip(1.0 - hours / horizon_hours, 0.0, 1.0))

    hours = (start_dt - now).dt.total_seconds() / 3600
    hours = hours.clip(lower=0)
    return np.clip(1.0 - hours.values / horizon_hours, 0.0, 1.0)


def _high_attendance_alerts(
    events: List[Dict[str, Any]],
    now: datetime,
) -> List[Dict[str, str]]:
    alerts = []
    cutoff = now + timedelta(hours=HIGH_ATTENDANCE_ALERT_HOURS)
    for ev in events:
        if not ev.get("high_attendance"):
            continue
        try:
            start = datetime.fromisoformat(ev["start_datetime"])
            if start.tzinfo is None:
                start = start.replace(tzinfo=timezone.utc)
        except (KeyError, ValueError, TypeError):
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


def get_nearby_events(
    lat: float = 15.8497,
    lng: float = 74.4977,
    radius_km: float = 5.0,
    interests: str = "",
    category: Optional[str] = None,
    free_only: bool = False,
    days: int = 14,
    limit: int = 10,
    offset: int = 0,
    sort: str = "recommended",
    q: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    user_id: Optional[str] = None,
    now: Optional[datetime] = None,
    events_csv: Optional[Path] = None,
) -> Dict[str, Any]:
    """Find, rank, and return nearby events with pagination, sorting, and feedback adaptation."""
    now = get_reference_now(now)

    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        return {
            "error": "Invalid lat/lng. lat must be in [-90, 90], lng in [-180, 180].",
            "events": [],
            "count": 0,
        }

    csv_path = events_csv or DEFAULT_EVENTS_CSV
    df_all = load_events(csv_path)

    _cache.fit(df_all, csv_path)

    # Time window
    window_start = date_from if date_from is not None else now
    window_end = date_to if date_to is not None else now + timedelta(days=days)

    df = filter_events(
        df_all,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        start=window_start,
        end=window_end,
        category=category,
        free_only=free_only,
        q=q,
        now=now,
    )

    if df.empty:
        return {
            "events": [],
            "count": 0,
            "total_found": 0,
            "offset": offset,
            "limit": limit,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "fallback_reason": "",
            "query": {
                "lat": lat, "lng": lng, "radius_km": radius_km,
                "interests": interests, "category": category,
                "free_only": free_only, "days": days, "limit": limit,
                "offset": offset, "sort": sort, "q": q,
            },
        }

    total_matching = len(df)

    # Similarity scoring (Rocchio adapted if user_id present)
    fallback_reason = ""
    sim_scores = np.zeros(len(df))
    if interests.strip() or user_id:
        all_scores = _cache.similarity_scores(interests, user_id=user_id)
        id_to_sim: Dict[str, float] = {}
        for idx, eid in enumerate(_cache._event_ids or []):
            id_to_sim[str(eid)] = float(all_scores[idx])
        sim_scores = df["event_id"].astype(str).map(lambda eid: id_to_sim.get(eid, 0.0)).values
        if np.all(sim_scores == 0.0) and not interests.strip():
            fallback_reason = "No interests or interaction history provided — ranking by proximity and time."
    else:
        fallback_reason = "No interests provided — ranking by proximity and time only."

    prox_scores = _proximity_score(df["distance_km"].values, radius_km)
    time_scores = _time_score(df["start_datetime"], now)

    w_sim = _cache._weights.get("w_sim", W_SIM)
    w_prox = _cache._weights.get("w_prox", W_PROX)
    w_time = _cache._weights.get("w_time", W_TIME)

    final_scores = w_sim * sim_scores + w_prox * prox_scores + w_time * time_scores

    df = df.copy()
    df["_sim"] = sim_scores
    df["_prox"] = prox_scores
    df["_time"] = time_scores
    df["_score"] = final_scores

    # Sorting
    if sort == "distance":
        df = df.sort_values("distance_km", ascending=True)
    elif sort == "date":
        df = df.sort_values("start_datetime", ascending=True)
    elif sort == "attendance":
        df = df.sort_values("expected_attendance", ascending=False)
    else:  # "recommended"
        df = df.sort_values("_score", ascending=False)

    # Pagination
    df_paged = df.iloc[offset : offset + limit].reset_index(drop=True)

    events_out: List[Dict[str, Any]] = []
    for _, row in df_paged.iterrows():
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
            "data_origin": str(row.get("data_origin", "synthetic_sample")),
            "source_name": str(row.get("source_name", "UrbanPulse")),
            "source_url": str(row.get("source_url", "")),
            "verified_on": str(row.get("verified_on", "")),
            "attendance_estimated": bool(row.get("attendance_estimated", False)),
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
        "total_found": total_matching,
        "offset": offset,
        "limit": limit,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "fallback_reason": fallback_reason,
        "query": {
            "lat": lat, "lng": lng, "radius_km": radius_km,
            "interests": interests, "category": category,
            "free_only": free_only, "days": days, "limit": limit,
            "offset": offset, "sort": sort, "q": q,
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
        "data_origin": str(r.get("data_origin", "synthetic_sample")),
        "source_name": str(r.get("source_name", "UrbanPulse")),
        "source_url": str(r.get("source_url", "")),
        "verified_on": str(r.get("verified_on", "")),
        "attendance_estimated": bool(r.get("attendance_estimated", False)),
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


def get_high_impact_events(
    hours_ahead: int = 48,
    now: Optional[datetime] = None,
    events_csv: Optional[Path] = None,
) -> List[Dict[str, Any]]:
    """Cross-agent helper for Traffic Agent: returns events expected to impact traffic/noise."""
    now = get_reference_now(now)
    cutoff = now + timedelta(hours=hours_ahead)

    csv_path = events_csv or DEFAULT_EVENTS_CSV
    df = load_events(csv_path)

    # Filter upcoming starting within window with attendance >= 500
    df = df[
        (df["start_datetime"] >= now)
        & (df["start_datetime"] <= cutoff)
        & (df["expected_attendance"] >= 500)
    ].sort_values("start_datetime").reset_index(drop=True)

    high_impact = []
    for _, row in df.iterrows():
        att = int(row["expected_attendance"])
        # Estimate crowd impact radius: 0.5km for 500-1500, 1.0km for 1500-5000, 2.0km for 5000+
        if att < 1500:
            crowd_radius = 0.5
        elif att < 5000:
            crowd_radius = 1.0
        else:
            crowd_radius = 2.0

        high_impact.append({
            "event_id": str(row["event_id"]),
            "title": str(row["title"]),
            "venue": str(row["venue"]),
            "category": str(row["category"]),
            "lat": float(row["lat"]),
            "lng": float(row["lng"]),
            "start_datetime": row["start_datetime"].isoformat(),
            "end_datetime": row["end_datetime"].isoformat(),
            "expected_attendance": att,
            "estimated_crowd_radius_km": crowd_radius,
            "impact_level": "high" if att >= HIGH_ATTENDANCE_THRESHOLD else "moderate",
        })

    return high_impact


def get_events_near(
    lat: float,
    lng: float,
    radius_km: float = 2.0,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    now: Optional[datetime] = None,
    events_csv: Optional[Path] = None,
) -> List[Dict[str, Any]]:
    """Cross-agent spatial-temporal query used by Traffic and Student agents."""
    now = get_reference_now(now)
    csv_path = events_csv or DEFAULT_EVENTS_CSV
    df = load_events(csv_path)

    df_filtered = filter_events(
        df,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        start=start,
        end=end,
        now=now,
    )

    results = []
    for _, row in df_filtered.iterrows():
        results.append({
            "event_id": str(row["event_id"]),
            "title": str(row["title"]),
            "category": str(row["category"]),
            "venue": str(row["venue"]),
            "lat": float(row["lat"]),
            "lng": float(row["lng"]),
            "distance_km": round(float(row["distance_km"]), 3),
            "start_datetime": row["start_datetime"].isoformat(),
            "end_datetime": row["end_datetime"].isoformat(),
            "expected_attendance": int(row["expected_attendance"]),
        })
    return results


def get_stats(
    now: Optional[datetime] = None,
    events_csv: Optional[Path] = None,
) -> Dict[str, Any]:
    """Summary statistics for admin and dashboard telemetry."""
    now = get_reference_now(now)
    csv_path = events_csv or DEFAULT_EVENTS_CSV
    df = load_events(csv_path)

    categories_breakdown = {str(k): int(v) for k, v in df["category"].value_counts().items()}
    origin_breakdown = {str(k): int(v) for k, v in df["data_origin"].value_counts().items()}

    # Upcoming next 7 days
    upcoming_7 = df[
        (df["start_datetime"] >= now)
        & (df["start_datetime"] <= now + timedelta(days=7))
    ]

    high_att = df[df["expected_attendance"] >= HIGH_ATTENDANCE_THRESHOLD]
    att_estimated = df[df["attendance_estimated"]]

    return {
        "total_events": len(df),
        "data_origins": {
            "real": origin_breakdown.get("real", 0),
            "manual": origin_breakdown.get("manual", 0),
            "synthetic_sample": origin_breakdown.get("synthetic_sample", 0),
        },
        "categories": categories_breakdown,
        "upcoming_next_7_days": len(upcoming_7),
        "high_attendance_events": len(high_att),
        "attendance_estimated_count": len(att_estimated),
        "reference_now": now.isoformat(),
    }
