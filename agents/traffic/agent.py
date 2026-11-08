"""
agents/traffic/agent.py
Traffic Agent — stub implementation.

TODO (Traffic Developer):
  - Load agents/traffic/data/traffic_sample.csv with pandas.
  - Train / load a scikit-learn congestion classifier (e.g. RandomForestClassifier).
  - Integrate live traffic API (key from env TRAFFIC_API_KEY); fall back to CSV.
  - Implement get_alternate_routes(lat, lng) using OpenStreetMap/OSRM.
  - Set source="live_api" or "csv_fallback" accordingly.
"""
from __future__ import annotations

from typing import Any, Dict


def get_traffic_status() -> Dict[str, Any]:
    """Return stub traffic data. Replace with real logic."""
    return {
        "congestion_level": "moderate",
        "congestion_score": 0.62,
        "location_name": "Belagavi City Center",
        "alternate_routes": [
            {
                "route_id": "R1",
                "description": "Via NH48 bypass — estimated +8 min",
                "distance_km": 5.2,
            }
        ],
        "high_congestion": False,
    }
