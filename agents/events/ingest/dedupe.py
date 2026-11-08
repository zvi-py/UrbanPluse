"""
agents/events/ingest/dedupe.py
Deduplication module using rapidfuzz (with difflib fallback) on normalized title, date, and venue.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Tuple

try:
    from rapidfuzz import fuzz
    HAS_RAPIDFUZZ = True
except ImportError:
    import difflib
    HAS_RAPIDFUZZ = False

logger = logging.getLogger(__name__)


def string_similarity(s1: str, s2: str) -> float:
    """Calculate string similarity in range [0, 1]."""
    s1_clean = " ".join(re.sub(r"[^\w\s]", " ", s1.lower()).split())
    s2_clean = " ".join(re.sub(r"[^\w\s]", " ", s2.lower()).split())
    if not s1_clean or not s2_clean:
        return 0.0
    if s1_clean == s2_clean:
        return 1.0

    if HAS_RAPIDFUZZ:
        return fuzz.token_sort_ratio(s1_clean, s2_clean) / 100.0
    else:
        return difflib.SequenceMatcher(None, s1_clean, s2_clean).ratio()


def get_event_fingerprint(event: Dict[str, Any]) -> Tuple[str, str, str]:
    """Extract (title, date_str, venue) normalized tuple."""
    title = str(event.get("title", "")).strip()
    dt = str(event.get("start_datetime", ""))[:10]  # compare YYYY-MM-DD
    venue = str(event.get("venue", "")).strip()
    return title, dt, venue


def is_duplicate(
    ev1: Dict[str, Any],
    ev2: Dict[str, Any],
    title_threshold: float = 0.82,
    venue_threshold: float = 0.70,
) -> bool:
    """Check if two events represent the same real-world occurrence."""
    t1, d1, v1 = get_event_fingerprint(ev1)
    t2, d2, v2 = get_event_fingerprint(ev2)

    # If dates are both specified and differ by more than a day, not duplicates
    if d1 and d2 and d1 != d2:
        return False

    title_sim = string_similarity(t1, t2)
    if title_sim < title_threshold:
        return False

    # Check venue similarity
    if v1 and v2:
        venue_sim = string_similarity(v1, v2)
        if venue_sim < venue_threshold:
            # Different venues unless title similarity is extraordinarily high
            return title_sim > 0.95

    return True


def deduplicate_events(
    candidates: List[Dict[str, Any]],
    existing: List[Dict[str, Any]],
    title_threshold: float = 0.82,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Deduplicate candidates against existing events and within candidates.

    Returns:
        (unique_candidates, duplicates_found)
    """
    unique: List[Dict[str, Any]] = []
    duplicates: List[Dict[str, Any]] = []

    for cand in candidates:
        matched = False
        # Check against existing
        for ex in existing:
            if is_duplicate(cand, ex, title_threshold=title_threshold):
                matched = True
                duplicates.append({"candidate": cand, "duplicate_of": ex.get("event_id")})
                break
        if matched:
            continue

        # Check against already accepted candidates
        for u in unique:
            if is_duplicate(cand, u, title_threshold=title_threshold):
                matched = True
                duplicates.append({"candidate": cand, "duplicate_of": u.get("event_id")})
                break
        if not matched:
            unique.append(cand)

    return unique, duplicates
