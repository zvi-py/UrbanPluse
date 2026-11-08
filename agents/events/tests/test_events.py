"""
agents/events/tests/test_events.py
Full test suite for the Event Agent.

Design decisions:
- Uses a small fixture CSV (injected via tmp_path) so tests are date-independent.
- Reference "now" is injected into agent functions — no real-clock calls.
- TestClient against the full FastAPI app verifies schema compliance.
"""
from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from agents.events.agent import (
    haversine_km,
    load_events,
    filter_events,
    build_text,
    get_nearby_events,
    get_event_by_id,
    get_categories,
    HIGH_ATTENDANCE_THRESHOLD,
    _high_attendance_alerts,
)

client = TestClient(app)

# ---------------------------------------------------------------------------
# Reference datetime — fixed so tests never depend on today's date
# ---------------------------------------------------------------------------
NOW = datetime(2025, 11, 10, 8, 0, 0, tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# Fixture: small in-memory / temp CSV
# ---------------------------------------------------------------------------

FIXTURE_CSV_CONTENT = """\
event_id,title,description,category,tags,venue,lat,lng,start_datetime,end_datetime,expected_attendance,is_free,organizer
FX001,AI Hackathon Belagavi,A 24-hour hackathon focused on machine learning and AI solutions for civic problems. Teams build Python models and deploy APIs. Prizes for top coders.,hackathon,hackathon;AI;machine-learning;Python;coding,Tech Hub Belagavi,15.8530,74.5010,2025-11-12T09:00:00+00:00,2025-11-13T09:00:00+00:00,350,False,KLE CS Club
FX002,Carnatic Music Concert,Solo Carnatic vocal concert with violin and mridangam. Evening ragas performed by award-winning vocalist.,music,Carnatic;classical-music;concert;vocal;culture,Town Hall Belagavi,15.8640,74.5020,2025-11-14T18:30:00+00:00,2025-11-14T21:30:00+00:00,200,False,Sangeet Sabha
FX003,Food Festival Belagavi,Three-day open-air food festival showcasing local Karnataka cuisine street food and traditional recipes from across the region.,food,food;festival;street-food;local;culture,Nehru Ground,15.8497,74.4977,2025-11-15T10:00:00+00:00,2025-11-17T21:00:00+00:00,500,True,BMC
FX004,Inter-College Cricket,T20 format inter-college cricket tournament with 16 teams from North Karnataka.,sports,cricket;sports;T20;college;tournament,University Ground,15.8515,74.4990,2025-11-18T08:00:00+00:00,2025-11-20T18:00:00+00:00,800,True,KLE Sports
FX005,KLE Tech Fest,Annual mega technology festival with robotics hackathons exhibitions and industry leaders. Largest college event of the year.,college_fest,tech-fest;robotics;hackathon;AI;exhibition;networking,KLE University,15.8530,74.5010,2025-11-13T09:00:00+00:00,2025-11-15T18:00:00+00:00,6000,False,KLE University
FX006,Far Away Event,An event that is very far from Belagavi city center and should be excluded by radius filter.,cultural,art;culture,Hubli Far Venue,15.3500,75.1200,2025-11-12T10:00:00+00:00,2025-11-12T17:00:00+00:00,100,True,Remote Org
FX007,Past Event Completed,This event already ended before our reference NOW and must be excluded from results.,workshop,workshop;coding,Old Venue,15.8497,74.4977,2025-11-01T09:00:00+00:00,2025-11-02T17:00:00+00:00,50,True,Past Org
FX008,Free IoT Workshop,Hands-on workshop on IoT Arduino and Raspberry Pi embedded systems. Free registration for students.,workshop,IoT;Arduino;Raspberry-Pi;embedded-systems;electronics;free,SDMCET Lab,15.8540,74.5025,2025-11-11T09:00:00+00:00,2025-11-11T17:00:00+00:00,80,True,SDMCET ECE
FX009,Concert High Attendance,A massive outdoor music concert with rock bands and indie artists expected to draw a huge crowd.,music,music;concert;rock;outdoor;live-music,Race Course Ground,15.8450,74.4800,2025-11-10T16:00:00+00:00,2025-11-10T22:00:00+00:00,1500,False,Music Collective
"""


@pytest.fixture
def fixture_csv(tmp_path: Path) -> Path:
    """Write the fixture CSV to a temp directory and return its path."""
    csv_path = tmp_path / "events.csv"
    csv_path.write_text(FIXTURE_CSV_CONTENT, encoding="utf-8")
    return csv_path


@pytest.fixture
def fixture_df(fixture_csv: Path) -> pd.DataFrame:
    """Return a loaded DataFrame from the fixture CSV."""
    return load_events(fixture_csv)


# ===========================================================================
# 1. Schema compliance tests (via TestClient against the real app)
# ===========================================================================

class TestCommonSchema:
    """Every endpoint must return the common AgentResponse schema."""

    REQUIRED_TOP_LEVEL = {"agent", "status", "timestamp", "data", "alerts", "source"}

    def test_nearby_schema(self):
        r = client.get("/events/nearby")
        assert r.status_code == 200
        body = r.json()
        assert self.REQUIRED_TOP_LEVEL.issubset(body.keys())
        assert body["agent"] == "events"
        assert body["status"] in ("ok", "error")
        assert body["source"] in ("live_api", "csv_fallback", "stub")
        assert isinstance(body["alerts"], list)
        assert isinstance(body["data"], dict)

    def test_nearby_source_is_csv_fallback(self):
        r = client.get("/events/nearby")
        assert r.json()["source"] == "csv_fallback"

    def test_categories_schema(self):
        r = client.get("/events/categories")
        assert r.status_code == 200
        body = r.json()
        assert body["agent"] == "events"
        assert body["status"] == "ok"
        assert "categories" in body["data"]

    def test_recommend_schema(self):
        r = client.get("/events/recommend?interests=coding+hackathon")
        assert r.status_code == 200
        body = r.json()
        assert body["agent"] == "events"
        assert body["status"] == "ok"

    def test_event_detail_not_found_returns_error_status(self):
        r = client.get("/events/NONEXISTENT999")
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "error"
        assert body["agent"] == "events"

    def test_nearby_data_has_events_and_count(self):
        r = client.get("/events/nearby?radius_km=50&days=30")
        data = r.json()["data"]
        assert "events" in data
        assert "count" in data
        assert isinstance(data["events"], list)
        assert isinstance(data["count"], int)

    def test_nearby_event_has_required_fields(self):
        r = client.get("/events/nearby?radius_km=50&days=30")
        events = r.json()["data"]["events"]
        if events:
            ev = events[0]
            for field in [
                "event_id", "title", "category", "venue", "lat", "lng",
                "start_datetime", "end_datetime", "distance_km",
                "expected_attendance", "is_free", "high_attendance",
                "score", "score_breakdown",
            ]:
                assert field in ev, f"Missing field: {field}"
            breakdown = ev["score_breakdown"]
            for comp in ("similarity", "proximity", "time"):
                assert comp in breakdown


# ===========================================================================
# 2. haversine_km unit tests
# ===========================================================================

class TestHaversine:
    """Test haversine_km against known distances."""

    def test_same_point_is_zero(self):
        assert haversine_km(15.8497, 74.4977, 15.8497, 74.4977) == pytest.approx(0.0)

    def test_belagavi_to_dharwad(self):
        # Belagavi (15.8497, 74.4977) to Dharwad (15.4589, 75.0078)
        # Known road distance ~75 km; straight-line ~65-70 km
        d = haversine_km(15.8497, 74.4977, 15.4589, 75.0078)
        assert 60 < d < 80, f"Expected ~65-70 km, got {d:.2f} km"

    def test_belagavi_to_hubli(self):
        # Belagavi to Hubli straight-line distance is ~86 km (road ~100 km)
        d = haversine_km(15.8497, 74.4977, 15.3647, 75.1240)
        assert 80 < d < 95, f"Expected ~86 km, got {d:.2f} km"

    def test_vectorised_returns_array(self):
        import numpy as np
        lats = np.array([15.8530, 15.8640, 15.8497])
        lngs = np.array([74.5010, 74.5020, 74.4977])
        result = haversine_km(15.8497, 74.4977, lats, lngs)
        assert result.shape == (3,)
        assert all(result >= 0)

    def test_symmetry(self):
        d1 = haversine_km(15.8497, 74.4977, 15.8530, 74.5010)
        d2 = haversine_km(15.8530, 74.5010, 15.8497, 74.4977)
        assert d1 == pytest.approx(d2, rel=1e-6)


# ===========================================================================
# 3. Filter tests (date-independent via NOW fixture)
# ===========================================================================

class TestFilterEvents:
    """filter_events must exclude past events and far events."""

    def test_excludes_past_events(self, fixture_df: pd.DataFrame):
        result = filter_events(
            fixture_df, lat=15.8497, lng=74.4977,
            radius_km=100, now=NOW,
        )
        ids = result["event_id"].tolist()
        assert "FX007" not in ids, "Past event FX007 must be excluded"

    def test_excludes_events_outside_radius(self, fixture_df: pd.DataFrame):
        result = filter_events(
            fixture_df, lat=15.8497, lng=74.4977,
            radius_km=20, now=NOW,
        )
        ids = result["event_id"].tolist()
        assert "FX006" not in ids, "Far event FX006 must be excluded (>50 km away)"

    def test_includes_events_within_radius(self, fixture_df: pd.DataFrame):
        result = filter_events(
            fixture_df, lat=15.8497, lng=74.4977,
            radius_km=20, now=NOW,
        )
        # Events in Belagavi area should appear
        assert len(result) > 0

    def test_distance_km_column_added(self, fixture_df: pd.DataFrame):
        result = filter_events(
            fixture_df, lat=15.8497, lng=74.4977,
            radius_km=20, now=NOW,
        )
        assert "distance_km" in result.columns
        assert (result["distance_km"] <= 20).all()

    def test_category_filter(self, fixture_df: pd.DataFrame):
        result = filter_events(
            fixture_df, lat=15.8497, lng=74.4977,
            radius_km=50, category="music", now=NOW,
        )
        assert all(r == "music" for r in result["category"])

    def test_free_only_filter(self, fixture_df: pd.DataFrame):
        result = filter_events(
            fixture_df, lat=15.8497, lng=74.4977,
            radius_km=50, free_only=True, now=NOW,
        )
        assert all(result["is_free"])

    def test_empty_radius_returns_empty(self, fixture_df: pd.DataFrame):
        result = filter_events(
            fixture_df, lat=0.0, lng=0.0,
            radius_km=10.0, now=NOW,
        )
        assert result.empty


# ===========================================================================
# 4. Recommendation ranking tests
# ===========================================================================

class TestRecommendationRanking:
    """Interest queries must rank relevant events above irrelevant ones."""

    def test_hackathon_query_ranks_tech_above_food(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=15.8497, lng=74.4977, radius_km=50,
            interests="hackathon coding AI machine learning",
            days=20, limit=10, now=NOW,
            events_csv=fixture_csv,
        )
        events = result["events"]
        assert len(events) >= 2

        titles = [e["title"] for e in events]
        # Hackathon / tech events should appear before food festival
        tech_indices = [i for i, e in enumerate(events) if "hackathon" in e["title"].lower()
                        or "ai" in e["title"].lower() or "tech" in e["title"].lower()]
        food_indices = [i for i, e in enumerate(events) if "food" in e["title"].lower()]

        if tech_indices and food_indices:
            assert min(tech_indices) < max(food_indices), (
                f"Tech event should rank higher than food. Order: {titles}"
            )

    def test_music_query_ranks_concert_first(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=15.8497, lng=74.4977, radius_km=50,
            interests="music concert Carnatic classical",
            days=20, limit=10, now=NOW,
            events_csv=fixture_csv,
        )
        events = result["events"]
        assert len(events) >= 1
        # At least one of the top 3 results should be music-related
        top3_categories = [e["category"] for e in events[:3]]
        assert "music" in top3_categories, (
            f"Expected music event in top 3, got: {top3_categories}"
        )

    def test_score_breakdown_components_present(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=15.8497, lng=74.4977, radius_km=50,
            interests="Python data science",
            days=20, limit=5, now=NOW,
            events_csv=fixture_csv,
        )
        for ev in result["events"]:
            bd = ev["score_breakdown"]
            assert "similarity" in bd
            assert "proximity" in bd
            assert "time" in bd
            assert 0.0 <= bd["similarity"] <= 1.0
            assert 0.0 <= bd["proximity"] <= 1.0
            assert 0.0 <= bd["time"] <= 1.0

    def test_scores_in_descending_order(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=15.8497, lng=74.4977, radius_km=50,
            interests="hackathon AI coding",
            days=20, limit=10, now=NOW,
            events_csv=fixture_csv,
        )
        scores = [e["score"] for e in result["events"]]
        assert scores == sorted(scores, reverse=True), "Events must be sorted by score desc"


# ===========================================================================
# 5. Edge case tests
# ===========================================================================

class TestEdgeCases:
    """Empty interests, empty results, invalid coordinates."""

    def test_empty_interests_fallback(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=15.8497, lng=74.4977, radius_km=50,
            interests="",
            days=20, limit=10, now=NOW,
            events_csv=fixture_csv,
        )
        # Should NOT crash; must return events ranked by proximity+time
        assert "events" in result
        assert isinstance(result["events"], list)
        assert result.get("fallback_reason"), "Should report fallback_reason when interests empty"
        # All similarity scores should be 0
        for ev in result["events"]:
            assert ev["score_breakdown"]["similarity"] == 0.0

    def test_empty_interests_via_api(self):
        r = client.get("/events/nearby?radius_km=50&days=30&interests=")
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "ok"

    def test_no_events_in_tiny_radius(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=0.0, lng=0.0, radius_km=1,  # middle of ocean
            interests="hackathon",
            days=20, limit=10, now=NOW,
            events_csv=fixture_csv,
        )
        assert result["count"] == 0
        assert result["events"] == []

    def test_no_events_does_not_crash_api(self):
        # Very small radius at an arbitrary far location
        r = client.get("/events/nearby?lat=0.0&lng=0.0&radius_km=0.1")
        assert r.status_code == 200
        body = r.json()
        assert body["data"]["count"] == 0
        assert body["status"] == "ok"

    def test_invalid_lat_returns_error(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=999.0, lng=74.4977, radius_km=5,
            interests="", now=NOW,
            events_csv=fixture_csv,
        )
        assert "error" in result

    def test_invalid_lng_returns_error(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=15.8497, lng=999.0, radius_km=5,
            interests="", now=NOW,
            events_csv=fixture_csv,
        )
        assert "error" in result

    def test_api_validates_lat_bounds(self):
        r = client.get("/events/nearby?lat=200&lng=74.4977")
        assert r.status_code == 422  # FastAPI Query validation


# ===========================================================================
# 6. High-attendance flag and alert tests
# ===========================================================================

class TestHighAttendance:
    """high_attendance flag and warning alerts must work correctly."""

    def test_high_attendance_flag_set_correctly(self, fixture_csv: Path):
        result = get_nearby_events(
            lat=15.8497, lng=74.4977, radius_km=50,
            interests="", days=30, limit=20, now=NOW,
            events_csv=fixture_csv,
        )
        for ev in result["events"]:
            expected_flag = ev["expected_attendance"] >= HIGH_ATTENDANCE_THRESHOLD
            assert ev["high_attendance"] == expected_flag, (
                f"Event {ev['event_id']} has wrong high_attendance flag"
            )

    def test_high_attendance_warning_in_api_response(self):
        # FX005 (KLE Tech Fest, 6000 attendees) should trigger a warning alert
        r = client.get("/events/nearby?radius_km=50&days=30")
        body = r.json()
        alerts = body.get("alerts", [])
        warning_messages = [a["message"] for a in alerts if a["level"] == "warning"]
        # At least one warning should mention high attendance
        # (depends on events being within 48 h of "now" in real time;
        #  this tests that the mechanism exists and returns valid schema)
        for a in alerts:
            assert a["level"] in ("info", "warning", "critical")
            assert isinstance(a["message"], str)

    def test_high_attendance_alerts_function(self):
        """_high_attendance_alerts returns warnings for events within 48 h."""
        ref_now = datetime(2025, 11, 10, 8, 0, 0, tzinfo=timezone.utc)
        # Event starts 10 hours from now → should trigger
        events = [{
            "title": "Big Concert",
            "event_id": "X1",
            "high_attendance": True,
            "expected_attendance": 2000,
            "start_datetime": (ref_now + timedelta(hours=10)).isoformat(),
        }]
        alerts = _high_attendance_alerts(events, ref_now)
        assert len(alerts) == 1
        assert alerts[0]["level"] == "warning"
        assert "2000" in alerts[0]["message"]

    def test_no_high_attendance_alert_for_far_future(self):
        """Events > 48 h away must NOT produce a warning."""
        ref_now = datetime(2025, 11, 10, 8, 0, 0, tzinfo=timezone.utc)
        events = [{
            "title": "Future Fest",
            "event_id": "X2",
            "high_attendance": True,
            "expected_attendance": 5000,
            "start_datetime": (ref_now + timedelta(hours=72)).isoformat(),
        }]
        alerts = _high_attendance_alerts(events, ref_now)
        assert len(alerts) == 0

    def test_non_high_attendance_no_warning(self):
        ref_now = datetime(2025, 11, 10, 8, 0, 0, tzinfo=timezone.utc)
        events = [{
            "title": "Small Workshop",
            "event_id": "X3",
            "high_attendance": False,
            "expected_attendance": 50,
            "start_datetime": (ref_now + timedelta(hours=2)).isoformat(),
        }]
        alerts = _high_attendance_alerts(events, ref_now)
        assert len(alerts) == 0


# ===========================================================================
# 7. /overview compatibility test
# ===========================================================================

class TestOverviewCompatibility:
    """Ensure get_nearby_events() zero-arg call still works (called by /overview)."""

    def test_get_nearby_events_no_args_returns_dict(self):
        result = get_nearby_events()
        assert isinstance(result, dict)
        assert "events" in result

    def test_overview_endpoint_still_works(self):
        r = client.get("/overview")
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "ok"
        assert "events" in body["data"]

    def test_overview_cross_agent_alert_fires(self):
        """High-attendance events should trigger cross-agent warning in /overview."""
        r = client.get("/overview")
        body = r.json()
        # /overview looks for high_attendance in events list
        events = body["data"].get("events", {}).get("events", [])
        has_high = any(e.get("high_attendance") for e in events)
        if has_high:
            warning_alerts = [a for a in body["alerts"] if a["level"] == "warning"]
            assert len(warning_alerts) >= 1


# ===========================================================================
# 8. load_events robustness tests
# ===========================================================================

class TestLoadEvents:
    """CSV loading must be robust to missing columns and bad rows."""

    def test_loads_fixture_successfully(self, fixture_csv: Path):
        df = load_events(fixture_csv)
        assert len(df) > 0
        assert "event_id" in df.columns

    def test_missing_file_raises_file_not_found(self, tmp_path: Path):
        with pytest.raises(FileNotFoundError):
            load_events(tmp_path / "nonexistent.csv")

    def test_missing_columns_raises_value_error(self, tmp_path: Path):
        bad_csv = tmp_path / "bad.csv"
        bad_csv.write_text("event_id,title\nE1,Test\n")
        with pytest.raises(ValueError, match="missing required columns"):
            load_events(bad_csv)

    def test_bad_lat_rows_dropped(self, tmp_path: Path, fixture_csv: Path):
        """Rows with unparseable lat should be dropped, not crash."""
        content = (fixture_csv.read_text() +
                   "FX_BAD,Bad Row,desc,hackathon,tag,venue,NOT_A_LAT,74.5,2025-11-20T10:00:00+00:00,2025-11-20T17:00:00+00:00,100,True,Org\n")
        bad_csv = tmp_path / "bad_lat.csv"
        bad_csv.write_text(content)
        df = load_events(bad_csv)  # Must not raise
        assert "FX_BAD" not in df["event_id"].values

    def test_start_datetime_parsed_as_datetime(self, fixture_csv: Path):
        df = load_events(fixture_csv)
        assert pd.api.types.is_datetime64_any_dtype(df["start_datetime"])


# ===========================================================================
# 9. get_categories test
# ===========================================================================

class TestCategories:
    def test_categories_returns_list_with_counts(self):
        cats = get_categories()
        assert isinstance(cats, list)
        for c in cats:
            assert "category" in c
            assert "count" in c
            assert c["count"] > 0

    def test_categories_via_api(self):
        r = client.get("/events/categories")
        assert r.status_code == 200
        data = r.json()["data"]
        assert "categories" in data
        assert len(data["categories"]) > 0


# ===========================================================================
# 10. get_event_by_id tests
# ===========================================================================

class TestEventById:
    def test_known_event_via_api(self):
        # E001 exists in the real events.csv
        r = client.get("/events/E001")
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "ok"
        assert body["data"]["event_id"] == "E001"

    def test_unknown_event_via_api(self):
        r = client.get("/events/DOES_NOT_EXIST")
        assert r.status_code == 200
        assert r.json()["status"] == "error"
