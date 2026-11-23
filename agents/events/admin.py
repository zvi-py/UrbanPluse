"""
agents/events/admin.py
Organizer event submission, admin token authentication, and CRUD operations.
Protects synthetic rows from modification and enforces Belagavi bounding box constraints.
"""
from __future__ import annotations

import logging
import os
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd
from pydantic import BaseModel, Field

from agents.events.ingest.geocode import BelagaviGeocoder, is_inside_bgm_bbox
from agents.events.model.train import train_model

logger = logging.getLogger(__name__)

DEFAULT_ADMIN_TOKEN = "belagavi-events-dev-2025"
DATA_DIR = Path(__file__).resolve().parent / "data"
EVENTS_CSV = DATA_DIR / "events.csv"


class NewEventSchema(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=5, max_length=1000)
    category: str = Field(default="community")
    tags: str = Field(default="")
    venue: str = Field(..., min_length=3)
    lat: Optional[float] = None
    lng: Optional[float] = None
    start_datetime: str
    end_datetime: str
    expected_attendance: int = Field(default=200, ge=0)
    is_free: bool = Field(default=True)
    organizer: str = Field(..., min_length=2)


class UpdateEventSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    venue: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    start_datetime: Optional[str] = None
    end_datetime: Optional[str] = None
    expected_attendance: Optional[int] = None
    is_free: Optional[bool] = None
    organizer: Optional[str] = None


def verify_admin_token(token: Optional[str]) -> bool:
    """Verify provided admin token against env var EVENTS_ADMIN_TOKEN or default."""
    expected = os.getenv("EVENTS_ADMIN_TOKEN", DEFAULT_ADMIN_TOKEN)
    return token is not None and token.strip() == expected


def _atomic_write_dataframe(df: pd.DataFrame, target_path: Path) -> None:
    """Write DataFrame to temporary file and atomically rename to avoid partial writes."""
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", dir=target_path.parent, delete=False, suffix=".tmp", encoding="utf-8") as tf:
        tmp_name = tf.name
    try:
        df.to_csv(tmp_name, index=False)
        shutil.move(tmp_name, str(target_path))
    finally:
        if Path(tmp_name).exists():
            try:
                Path(tmp_name).unlink()
            except Exception:
                pass


def add_manual_event(
    event_data: NewEventSchema,
    csv_path: Path = EVENTS_CSV,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Validate and atomically add a manual organizer event to events.csv."""
    if now is None:
        now = datetime.now(timezone.utc)

    # 1. Parse and validate datetimes
    try:
        start_dt = datetime.fromisoformat(event_data.start_datetime)
        if start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=timezone.utc)
    except Exception as e:
        raise ValueError(f"Invalid start_datetime format: {e}")

    try:
        end_dt = datetime.fromisoformat(event_data.end_datetime)
        if end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=timezone.utc)
    except Exception as e:
        raise ValueError(f"Invalid end_datetime format: {e}")

    if end_dt <= start_dt:
        raise ValueError(f"end_datetime ({end_dt}) must be strictly after start_datetime ({start_dt})")

    if end_dt < now:
        raise ValueError("Cannot schedule an event that has already ended in the past.")

    # 2. Resolve coordinates & verify bounding box
    lat = event_data.lat
    lng = event_data.lng
    attendance_estimated = False

    if lat is None or lng is None:
        geocoder = BelagaviGeocoder(allow_network=False)
        geo = geocoder.geocode(event_data.venue)
        if not geo:
            raise ValueError(
                f"Venue '{event_data.venue}' could not be geocoded within Belagavi bounding box. Please provide lat and lng."
            )
        lat, lng, default_cap = geo
        attendance_estimated = True
    else:
        if not is_inside_bgm_bbox(lat, lng):
            raise ValueError(
                f"Coordinates ({lat}, {lng}) are outside the Belagavi bounding box (15.70-16.00, 74.35-74.65)."
            )

    # 3. Load existing CSV and generate next ID
    if csv_path.exists():
        df = pd.read_csv(csv_path)
    else:
        df = pd.DataFrame()

    max_num = 0
    if not df.empty and "event_id" in df.columns:
        for eid in df["event_id"].dropna():
            if str(eid).startswith("M"):
                try:
                    num = int(str(eid)[1:])
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass
    new_id = f"M{max_num + 1:03d}"

    new_row = {
        "event_id": new_id,
        "title": event_data.title.strip(),
        "description": event_data.description.strip(),
        "category": event_data.category.strip(),
        "tags": event_data.tags.strip(),
        "venue": event_data.venue.strip(),
        "lat": round(float(lat), 5),
        "lng": round(float(lng), 5),
        "start_datetime": start_dt.isoformat(),
        "end_datetime": end_dt.isoformat(),
        "expected_attendance": int(event_data.expected_attendance),
        "is_free": bool(event_data.is_free),
        "organizer": event_data.organizer.strip(),
        "data_origin": "manual",
        "source_name": "Organizer Portal Submission",
        "source_url": "portal://manual",
        "verified_on": now.strftime("%Y-%m-%d"),
        "attendance_estimated": attendance_estimated,
    }

    # Backup & Atomic append
    if csv_path.exists():
        shutil.copyfile(csv_path, csv_path.with_suffix(".csv.bak"))

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    _atomic_write_dataframe(df, csv_path)

    # Invalidate and retrain model artifact
    try:
        train_model(events_csv=csv_path, save_artifacts=True)
    except Exception as e:
        logger.warning("Auto-retrain after manual event add failed: %s", e)

    return new_row


def update_manual_event(
    event_id: str,
    updates: UpdateEventSchema,
    csv_path: Path = EVENTS_CSV,
) -> Dict[str, Any]:
    """Update a manual event. Rejects updates to synthetic rows."""
    if not csv_path.exists():
        raise FileNotFoundError("Events CSV does not exist.")

    df = pd.read_csv(csv_path)
    idx_list = df.index[df["event_id"] == event_id].tolist()
    if not idx_list:
        raise KeyError(f"Event '{event_id}' not found.")

    row_idx = idx_list[0]
    origin = str(df.at[row_idx, "data_origin"])
    if origin == "synthetic_sample":
        raise PermissionError(
            f"Event '{event_id}' has data_origin='synthetic_sample'. Synthetic baseline rows cannot be modified."
        )

    # Apply updates
    if hasattr(updates, "model_dump"):
        data = updates.model_dump(exclude_unset=True)
    else:
        data = updates.dict(exclude_unset=True)
    for k, v in data.items():
        if v is not None:
            if k in {"lat", "lng"} and data.get("lat") and data.get("lng"):
                if not is_inside_bgm_bbox(data["lat"], data["lng"]):
                    raise ValueError("Updated coordinates fall outside Belagavi bounding box.")
            df.at[row_idx, k] = v

    _atomic_write_dataframe(df, csv_path)
    try:
        train_model(events_csv=csv_path, save_artifacts=True)
    except Exception as e:
        logger.warning("Auto-retrain after update failed: %s", e)

    return df.iloc[row_idx].to_dict()


def delete_manual_event(
    event_id: str,
    csv_path: Path = EVENTS_CSV,
) -> Dict[str, Any]:
    """Delete or cancel a manual event. Synthetic rows cannot be deleted."""
    if not csv_path.exists():
        raise FileNotFoundError("Events CSV does not exist.")

    df = pd.read_csv(csv_path)
    idx_list = df.index[df["event_id"] == event_id].tolist()
    if not idx_list:
        raise KeyError(f"Event '{event_id}' not found.")

    row_idx = idx_list[0]
    origin = str(df.at[row_idx, "data_origin"])
    if origin == "synthetic_sample":
        raise PermissionError(
            f"Event '{event_id}' has data_origin='synthetic_sample'. Synthetic baseline rows cannot be deleted."
        )

    # Remove the manual row
    deleted_row = df.iloc[row_idx].to_dict()
    df = df.drop(index=row_idx).reset_index(drop=True)
    _atomic_write_dataframe(df, csv_path)

    try:
        train_model(events_csv=csv_path, save_artifacts=True)
    except Exception as e:
        logger.warning("Auto-retrain after delete failed: %s", e)

    return {"status": "deleted", "event_id": event_id, "deleted_row": deleted_row}
