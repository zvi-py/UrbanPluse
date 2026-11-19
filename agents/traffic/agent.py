
"""
Traffic Agent — Belagavi traffic intelligence.

Reads traffic observations from the project CSV dataset,
summarizes congestion and identifies reported incidents.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import pandas as pd


DATA_FILE = Path(__file__).parent / "data" / "traffic_sample.csv"

# Existing sample route retained from the starter implementation.
ALTERNATE_ROUTES = [
    {
        "route_id": "R1",
        "description": "Via NH48 bypass — sample alternative route",
        "distance_km": 5.2,
    }
]


def _classify_congestion(score: float) -> str:
    """Classify a congestion score between 0 and 1."""
    if score >= 0.7:
        return "high"
    if score >= 0.4:
        return "moderate"
    return "low"


def _fallback_status() -> Dict[str, Any]:
    """Return clearly identified sample data if CSV is unavailable."""
    return {
        "congestion_level": "moderate",
        "congestion_score": 0.62,
        "location_name": "Belagavi City Center",
        "incident": "none",
        "alternate_routes": ALTERNATE_ROUTES,
        "high_congestion": False,
        "observations_count": 0,
        "locations": [],
        "alerts": [],
        "source": "stub",
    }


def get_traffic_status() -> Dict[str, Any]:
    """Return the latest traffic status and a summary of CSV observations."""

    if not DATA_FILE.exists():
        return _fallback_status()

    try:
        df = pd.read_csv(DATA_FILE)

        required = {
            "timestamp",
            "location",
            "congestion_score",
            "level",
            "incident",
        }

        if df.empty or not required.issubset(df.columns):
            return _fallback_status()

        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df["congestion_score"] = pd.to_numeric(
            df["congestion_score"], errors="coerce"
        )

        df = df.dropna(
            subset=["timestamp", "location", "congestion_score", "level"]
        )

        if df.empty:
            return _fallback_status()

        df["level"] = df["level"].astype(str).str.strip().str.lower()
        df["incident"] = (
            df["incident"].fillna("none").astype(str).str.strip().str.lower()
        )

        latest = df.sort_values("timestamp").iloc[-1]
        score = float(latest["congestion_score"])
        level = str(latest["level"])

        if level not in {"low", "moderate", "high"}:
            level = _classify_congestion(score)

        locations = []
        for location, group in df.groupby("location"):
            observation = group.sort_values("timestamp").iloc[-1]
            location_score = float(observation["congestion_score"])
            location_level = str(observation["level"])

            if location_level not in {"low", "moderate", "high"}:
                location_level = _classify_congestion(location_score)

            locations.append({
                "location": str(location),
                "congestion_score": round(location_score, 2),
                "congestion_level": location_level,
                "incident": str(observation["incident"]),
                "timestamp": observation["timestamp"].isoformat(),
            })

        alerts = []

        for _, row in df.iterrows():
            incident = str(row["incident"]).lower()
            location = str(row["location"])

            if incident == "accident":
                alerts.append({
                    "level": "critical",
                    "message": f"Accident reported near {location}.",
                })
            elif incident not in {"none", "", "nan"}:
                alerts.append({
                    "level": "warning",
                    "message": f"{incident.capitalize()} reported near {location}.",
                })

        high_locations = [
            item for item in locations
            if item["congestion_level"] == "high"
        ]

        for item in high_locations:
            alerts.append({
                "level": "warning",
                "message": (
                    f"High congestion reported near {item['location']} "
                    f"(score: {item['congestion_score']})."
                ),
            })

        return {
            "congestion_level": level,
            "congestion_score": round(score, 2),
            "location_name": str(latest["location"]),
            "incident": str(latest["incident"]),
            "alternate_routes": ALTERNATE_ROUTES,
            "high_congestion": level == "high",
            "observations_count": len(df),
            "locations": locations,
            "alerts": alerts,
            "source": "csv_fallback",
            "timestamp": latest["timestamp"].isoformat(),
        }

    except (OSError, ValueError, KeyError, pd.errors.ParserError):
        return _fallback_status()
