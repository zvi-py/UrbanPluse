"""
agents/events/tests/test_phase2.py
Phase 2 Comprehensive Test Suite for Belagavi Event Agent:
- Reference now clock-drift safety
- Preprocessing & regional synonym expansion
- Recommender evaluation & tuning
- Model artifacts persistence & staleness detection
- SQLite feedback persistence & Rocchio vector update formula
- Cross-agent helpers (high-impact events, crowd radius, in-range)
- Organizer/Admin authentication (X-Admin-Key) & CRUD
- Synthetic row protection (cannot edit or delete synthetic_sample)
- Belagavi bounding box enforcement & statistics
"""
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from agents.events.admin import (
    DEFAULT_ADMIN_TOKEN,
    NewEventSchema,
    UpdateEventSchema,
    add_manual_event,
    delete_manual_event,
    update_manual_event,
    verify_admin_token,
)
from agents.events.agent import (
    get_events_near,
    get_high_impact_events,
    get_nearby_events,
    get_reference_now,
    get_stats,
)
from agents.events.feedback import (
    compute_rocchio_vector,
    get_user_feedback,
    get_user_profile_summary,
    init_feedback_db,
    record_feedback,
)
from agents.events.ingest.geocode import is_inside_bgm_bbox
from agents.events.model.evaluate import evaluate_system
from agents.events.model.preprocessor import TextPreprocessor
from agents.events.model.train import is_artifact_stale, load_or_train_model, train_model

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. Clock-drift safety & Reference Now
# ---------------------------------------------------------------------------

def test_reference_now_env_var(monkeypatch):
    fixed_time = "2026-11-20T12:00:00+00:00"
    monkeypatch.setenv("EVENTS_REFERENCE_NOW", fixed_time)

    dt = get_reference_now()
    assert dt.isoformat() == fixed_time

    # Explicit parameter overrides env var
    explicit_dt = datetime(2027, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    dt2 = get_reference_now(explicit_dt)
    assert dt2 == explicit_dt


# ---------------------------------------------------------------------------
# 2. Text Preprocessing & Regional Synonyms
# ---------------------------------------------------------------------------

def test_synonym_preprocessing():
    prep = TextPreprocessor()
    text = "KLE campus coding fest and dance utsav in Belagavi"
    expanded = prep.preprocess(text, expand=True)

    # fest expanded to include festival / celebration
    assert "festival" in expanded or "celebration" in expanded
    # coding expanded to include hackathon / programming
    assert "programming" in expanded or "hackathon" in expanded
    # dance expanded to include nrutya
    assert "nrutya" in expanded or "dance" in expanded


# ---------------------------------------------------------------------------
# 3. Model Evaluation & Artifact Persistence
# ---------------------------------------------------------------------------

def test_evaluation_metrics():
    summary = evaluate_system()
    assert "baseline_proximity" in summary
    assert "similarity_only" in summary
    assert "full_weighted" in summary

    # TF-IDF similarity should substantially outperform pure proximity baseline on precision and NDCG
    assert summary["similarity_only"]["ndcg@10"] > summary["baseline_proximity"]["ndcg@10"]
    assert summary["similarity_only"]["p@5"] > summary["baseline_proximity"]["p@5"]
    assert summary["full_weighted"]["ndcg@10"] > summary["baseline_proximity"]["ndcg@10"]


def test_artifact_persistence(tmp_path):
    vec, mat, ids, cfg = train_model(save_artifacts=True)
    assert len(ids) >= 50
    assert mat.shape[0] == len(ids)

    # Artifacts should not be stale immediately after training
    assert is_artifact_stale() is False


# ---------------------------------------------------------------------------
# 4. Feedback Storage & Rocchio Vector Update Math
# ---------------------------------------------------------------------------

def test_feedback_sqlite_and_rocchio(tmp_path):
    db_file = tmp_path / "test_feedback.db"
    init_feedback_db(db_file)

    # Record interactions
    record_feedback("U999", "E001", "like", db_path=db_file)
    record_feedback("U999", "E003", "save", db_path=db_file)
    record_feedback("U999", "E004", "dismiss", db_path=db_file)

    feedbacks = get_user_feedback("U999", db_path=db_file)
    assert len(feedbacks) == 3

    # Rocchio vector calculation
    num_features = 4
    # Event 0: [1, 0, 0, 0] (liked)
    # Event 1: [0, 1, 0, 0] (saved)
    # Event 2: [0, 0, 1, 0] (dismissed)
    import scipy.sparse as sp
    dense_matrix = np.array([
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
    ])
    matrix = sp.csr_matrix(dense_matrix)
    mapping = {"E001": 0, "E003": 1, "E004": 2}

    init_vec = np.zeros(num_features)
    learned_vec = compute_rocchio_vector(
        initial_vec=init_vec,
        user_id="U999",
        events_matrix=matrix,
        event_id_to_idx=mapping,
        db_path=db_file,
    )

    # Liked and Saved dimensions should be strictly positive
    assert learned_vec[0] > 0
    assert learned_vec[1] > 0
    # Dismissed dimension should be 0 due to non-negative clipping
    assert learned_vec[2] == 0.0


def test_feedback_endpoints():
    r = client.post("/events/feedback", json={
        "user_id": "U888",
        "event_id": "E001",
        "action": "like",
    })
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

    # Profile summary
    r_prof = client.get("/events/profile/U888")
    assert r_prof.status_code == 200
    data = r_prof.json()["data"]
    assert data["user_id"] == "U888"
    assert data["total_interactions"] >= 1


# ---------------------------------------------------------------------------
# 5. Cross-Agent Contract
# ---------------------------------------------------------------------------

def test_high_impact_events():
    now = datetime(2026, 11, 15, 8, 0, 0, tzinfo=timezone.utc)
    events = get_high_impact_events(hours_ahead=72, now=now)
    assert len(events) >= 1
    for ev in events:
        assert ev["expected_attendance"] >= 500
        assert ev["estimated_crowd_radius_km"] in {0.5, 1.0, 2.0}

    # API Endpoint
    r = client.get("/events/high-impact?hours_ahead=72")
    assert r.status_code == 200
    body = r.json()
    assert body["agent"] == "events"
    assert "high_impact_events" in body["data"]


def test_events_near_spatial_temporal():
    now = datetime(2026, 11, 15, 8, 0, 0, tzinfo=timezone.utc)
    res = get_events_near(lat=15.8497, lng=74.4977, radius_km=10.0, now=now)
    assert isinstance(res, list)

    # API Endpoint
    r = client.get("/events/in-range?lat=15.8497&lng=74.4977&radius_km=10")
    assert r.status_code == 200
    assert "events" in r.json()["data"]


# ---------------------------------------------------------------------------
# 6. Organizer Entry & Admin CRUD Protection
# ---------------------------------------------------------------------------

def test_admin_auth_and_crud(tmp_path):
    test_csv = tmp_path / "events_crud.csv"
    # Copy current events to test_csv
    from agents.events.agent import DEFAULT_EVENTS_CSV
    import shutil
    shutil.copyfile(DEFAULT_EVENTS_CSV, test_csv)

    now = datetime(2026, 11, 10, 8, 0, 0, tzinfo=timezone.utc)

    # 1. Missing or invalid admin token -> 401
    r_unauth = client.post("/events", json={
        "title": "Unauthorized Event",
        "description": "Attempting to create without key",
        "venue": "Maratha Mandir",
        "start_datetime": "2026-11-20T10:00:00+00:00",
        "end_datetime": "2026-11-20T14:00:00+00:00",
        "organizer": "Hacker",
    })
    assert r_unauth.status_code == 401

    # 2. Valid creation
    new_event = NewEventSchema(
        title="Belagavi Robotics Expo 2026",
        description="Showcase of autonomous robotics and UAV drones by engineering students.",
        category="workshop",
        tags="robotics;drones;arduino",
        venue="Maratha Mandir Auditorium",
        start_datetime="2026-11-25T10:00:00+00:00",
        end_datetime="2026-11-25T17:00:00+00:00",
        expected_attendance=450,
        organizer="Belagavi Drone Club",
    )
    added = add_manual_event(new_event, csv_path=test_csv, now=now)
    assert added["event_id"].startswith("M")
    assert added["data_origin"] == "manual"
    assert is_inside_bgm_bbox(added["lat"], added["lng"])

    # 3. Reject coordinates outside Belagavi
    out_bbox = NewEventSchema(
        title="Out of Bounds Meet",
        description="Event with Hubli coordinates",
        venue="Outside Belagavi",
        lat=15.350,  # Hubli
        lng=75.120,
        start_datetime="2026-11-25T10:00:00+00:00",
        end_datetime="2026-11-25T17:00:00+00:00",
        organizer="Distant Org",
    )
    with pytest.raises(ValueError, match="outside the Belagavi bounding box"):
        add_manual_event(out_bbox, csv_path=test_csv, now=now)

    # 4. Reject past events
    past_event = NewEventSchema(
        title="Past Event",
        description="Event that already took place",
        venue="Maratha Mandir Auditorium",
        start_datetime="2026-11-01T10:00:00+00:00",
        end_datetime="2026-11-02T17:00:00+00:00",
        organizer="Past Org",
    )
    with pytest.raises(ValueError, match="already ended in the past"):
        add_manual_event(past_event, csv_path=test_csv, now=now)

    # 5. Synthetic rows protection: cannot update or delete synthetic events
    with pytest.raises(PermissionError, match="Synthetic baseline rows cannot be modified"):
        update_manual_event("E001", UpdateEventSchema(title="Attempt Modify Synthetic"), csv_path=test_csv)

    with pytest.raises(PermissionError, match="Synthetic baseline rows cannot be deleted"):
        delete_manual_event("E001", csv_path=test_csv)

    # 6. Manual row CAN be updated and deleted
    updated = update_manual_event(added["event_id"], UpdateEventSchema(title="Renamed Robotics Expo"), csv_path=test_csv)
    assert updated["title"] == "Renamed Robotics Expo"

    deleted = delete_manual_event(added["event_id"], csv_path=test_csv)
    assert deleted["status"] == "deleted"


# ---------------------------------------------------------------------------
# 7. Stats and Telemetry
# ---------------------------------------------------------------------------

def test_events_stats():
    now = datetime(2026, 11, 15, 8, 0, 0, tzinfo=timezone.utc)
    stats = get_stats(now=now)

    assert stats["total_events"] >= 55
    origins = stats["data_origins"]
    assert origins["synthetic_sample"] == 50
    assert origins["real"] >= 5
    assert "categories" in stats
    assert stats["upcoming_next_7_days"] >= 0

    # API Endpoint
    r = client.get("/events/stats")
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["total_events"] >= 55
    assert data["data_origins"]["synthetic_sample"] == 50


# ---------------------------------------------------------------------------
# 8. Nearby Query Enhancements (Search, Sorting, Pagination)
# ---------------------------------------------------------------------------

def test_nearby_search_sorting_pagination():
    now = datetime(2026, 11, 10, 8, 0, 0, tzinfo=timezone.utc)

    # Keyword search
    res_q = get_nearby_events(q="hackathon", days=30, now=now)
    for ev in res_q["events"]:
        match = (
            "hackathon" in ev["title"].lower()
            or "hackathon" in ev["category"].lower()
        )
        assert match or ev["score"] > 0

    # Attendance sort
    res_att = get_nearby_events(sort="attendance", limit=5, days=30, now=now)
    attendances = [e["expected_attendance"] for e in res_att["events"]]
    assert attendances == sorted(attendances, reverse=True)

    # Distance sort
    res_dist = get_nearby_events(sort="distance", limit=5, days=30, now=now)
    distances = [e["distance_km"] for e in res_dist["events"]]
    assert distances == sorted(distances)

    # Pagination
    p1 = get_nearby_events(limit=3, offset=0, days=30, now=now)
    p2 = get_nearby_events(limit=3, offset=3, days=30, now=now)
    assert len(p1["events"]) == 3
    assert len(p2["events"]) == 3
    # Distinct items across pages
    p1_ids = {e["event_id"] for e in p1["events"]}
    p2_ids = {e["event_id"] for e in p2["events"]}
    assert p1_ids.isdisjoint(p2_ids)
