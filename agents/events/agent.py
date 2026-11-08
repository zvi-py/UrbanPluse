"""
agents/events/agent.py
Event Agent — stub implementation.

TODO (Events Developer):
  - Load agents/events/data/events_sample.csv with pandas.
  - Implement TF-IDF vectorisation on event descriptions.
  - Use cosine similarity to recommend events matching a user interest query.
  - Integrate a live events API or scrape local notices; CSV as fallback.
  - Set source="live_api" or "csv_fallback" accordingly.
"""
from __future__ import annotations

from typing import Any, Dict


def get_nearby_events() -> Dict[str, Any]:
    """Return stub events data. Replace with real logic."""
    return {
        "events": [
            {
                "title": "KLE Tech Fest 2024",
                "category": "college_fest",
                "date": "2024-02-10",
                "lat": 15.8530,
                "lng": 74.5010,
                "score": 0.95,
                "high_attendance": True,
                "expected_footfall": 5000,
            },
            {
                "title": "Belagavi Food & Culture Fair",
                "category": "cultural",
                "date": "2024-02-12",
                "lat": 15.8497,
                "lng": 74.4977,
                "score": 0.78,
                "high_attendance": False,
                "expected_footfall": 1200,
            },
            {
                "title": "Inter-College Hackathon",
                "category": "academic",
                "date": "2024-02-15",
                "lat": 15.8545,
                "lng": 74.5020,
                "score": 0.88,
                "high_attendance": False,
                "expected_footfall": 800,
            },
        ]
    }
