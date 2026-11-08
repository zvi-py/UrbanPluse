"""
agents/events/tests/test_ingest.py
Unit tests for the Belagavi event data ingestion pipeline (offline fixtures).
"""
import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from agents.events.ingest.dedupe import deduplicate_events, is_duplicate, string_similarity
from agents.events.ingest.fetchers.html_fetcher import HtmlFetcher
from agents.events.ingest.fetchers.ics_fetcher import IcsFetcher
from agents.events.ingest.fetchers.rss_fetcher import RssFetcher
from agents.events.ingest.geocode import BelagaviGeocoder, is_inside_bgm_bbox
from agents.events.ingest.normalize import EventNormalizer, infer_category_and_tags
from agents.events.ingest.validate import validate_batch, validate_event

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def html_fixture():
    return (FIXTURES_DIR / "sample_vtu.html").read_text(encoding="utf-8")


@pytest.fixture
def ics_fixture():
    return (FIXTURES_DIR / "sample_calendar.ics").read_text(encoding="utf-8")


@pytest.fixture
def rss_fixture():
    return (FIXTURES_DIR / "sample_feed.rss").read_text(encoding="utf-8")


def test_html_fetcher_parse(html_fixture):
    fetcher = HtmlFetcher()
    events = fetcher.parse_events(html_fixture, base_url="https://vtu.ac.in")
    assert len(events) == 3
    assert "Artificial Intelligence" in events[0]["raw_title"]
    assert "VTU Jnana Sangama Campus" in events[0]["raw_venue"]


def test_ics_fetcher_parse(ics_fixture):
    fetcher = IcsFetcher()
    events = fetcher.parse_events(ics_fixture, base_url="https://belagavi.heritage.org")
    assert len(events) == 2
    assert "Heritage Walk" in events[0]["raw_title"]
    assert events[0]["start_datetime"] is not None
    assert events[0]["end_datetime"] is not None


def test_rss_fetcher_parse(rss_fixture):
    fetcher = RssFetcher(cache_ttl_sec=10)
    events = fetcher.parse_events(
        rss_fixture,
        base_url="https://belagavicity.mrc.gov.in",
        source_meta={"venue_default": "Municipal Botanical Garden Hindwadi"},
    )
    assert len(events) == 1
    assert "Flower Show" in events[0]["raw_title"]
    assert events[0]["raw_venue"] == "Municipal Botanical Garden Hindwadi"


def test_geocoder_gazetteer_and_bbox():
    geocoder = BelagaviGeocoder(allow_network=False)

    # 1. Direct gazetteer match
    res = geocoder.geocode("VTU Jnana Sangama Campus")
    assert res is not None
    lat, lng, cap = res
    assert is_inside_bgm_bbox(lat, lng)
    assert 15.70 <= lat <= 16.00
    assert 74.35 <= lng <= 74.65

    # 2. Alias match (e.g. "KLE Tech")
    res_alias = geocoder.geocode("KLE Tech")
    assert res_alias is not None
    assert is_inside_bgm_bbox(res_alias[0], res_alias[1])

    # 3. Out-of-area / unknown venue must return None (rejected)
    res_out = geocoder.geocode("Palace Grounds Bengaluru")
    assert res_out is None


def test_infer_category_and_tags():
    cat, tags = infer_category_and_tags("Inter-college 24-hour hackathon and coding sprint")
    assert cat == "hackathon"
    assert "coding" in tags or "hackathon" in tags

    cat_fest, _ = infer_category_and_tags("KLE Annual Cultural Utsav & Musical Evening")
    assert cat_fest in {"college_fest", "cultural"}


def test_normalizer_validates_and_rejects_out_of_area(html_fixture):
    geocoder = BelagaviGeocoder(allow_network=False)
    normalizer = EventNormalizer(geocoder=geocoder)
    fetcher = HtmlFetcher()
    raw_events = fetcher.parse_events(html_fixture, base_url="https://vtu.ac.in")

    # Item 0 is in VTU Jnana Sangama -> accepted
    norm0 = normalizer.normalize(raw_events[0], event_id="T001")
    assert norm0 is not None
    assert norm0["event_id"] == "T001"
    assert norm0["data_origin"] == "real"
    assert is_inside_bgm_bbox(norm0["lat"], norm0["lng"])

    # Item 2 is in Bangalore -> geocode fails -> normalized to None (rejected)
    norm2 = normalizer.normalize(raw_events[2], event_id="T002")
    assert norm2 is None


def test_deduplication():
    ev1 = {
        "event_id": "E100",
        "title": "KLE Tech Fest 2026",
        "venue": "KLE Technological University Campus",
        "start_datetime": "2026-11-15T09:00:00",
    }
    ev2 = {
        "event_id": "E101",
        "title": "kle tech fest 2026 annual",
        "venue": "KLE Technological University",
        "start_datetime": "2026-11-15T10:00:00",
    }
    ev_different = {
        "event_id": "E102",
        "title": "Belagavi Classical Music Evening",
        "venue": "Town Hall Auditorium",
        "start_datetime": "2026-11-20T18:00:00",
    }

    assert is_duplicate(ev1, ev2)
    assert not is_duplicate(ev1, ev_different)

    unique, dupes = deduplicate_events([ev2, ev_different], existing=[ev1])
    assert len(unique) == 1
    assert unique[0]["event_id"] == "E102"
    assert len(dupes) == 1
    assert dupes[0]["duplicate_of"] == "E100"


def test_validation_rules():
    now = datetime(2026, 11, 8, tzinfo=timezone.utc)

    # Valid event
    valid_ev = {
        "event_id": "V001",
        "title": "Belagavi Tech Expo",
        "venue": "Maratha Mandir",
        "lat": 15.863,
        "lng": 74.496,
        "start_datetime": "2026-11-10T10:00:00+00:00",
        "end_datetime": "2026-11-10T18:00:00+00:00",
        "data_origin": "real",
    }
    ok, _ = validate_event(valid_ev, now=now)
    assert ok is True

    # End before start
    invalid_time = dict(valid_ev, end_datetime="2026-11-09T18:00:00+00:00")
    ok, reason = validate_event(invalid_time, now=now)
    assert ok is False
    assert "strictly after" in reason

    # Out of bbox (Hubli coords)
    invalid_coords = dict(valid_ev, lat=15.3647, lng=75.1240)
    ok, reason = validate_event(invalid_coords, now=now)
    assert ok is False
    assert "outside Belagavi bounding box" in reason

    # Invalid data_origin
    invalid_origin = dict(valid_ev, data_origin="random_hallucination")
    ok, reason = validate_event(invalid_origin, now=now)
    assert ok is False
    assert "Invalid data_origin" in reason
