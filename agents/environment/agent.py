"""
agents/environment/agent.py
Environment Agent — stub implementation.

TODO (Environment Developer):
  - Load agents/environment/data/environment_sample.csv with pandas.
  - Implement Isolation Forest (sklearn.ensemble.IsolationForest) for AQI anomaly detection.
  - Integrate OpenWeatherMap API (key: OPENWEATHER_API_KEY from env) for weather.
  - Integrate OpenAQ API (key: OPENAQ_API_KEY from env) for real AQI data.
  - Set source="live_api" when live APIs succeed, "csv_fallback" otherwise.
"""
from __future__ import annotations

from typing import Any, Dict


def get_environment_status() -> Dict[str, Any]:
    """Return stub environment data. Replace with real logic."""
    return {
        "aqi": 72,
        "aqi_category": "moderate",
        "temperature_celsius": 28.5,
        "humidity_percent": 65,
        "noise_db": 58.3,
        "wind_speed_kmh": 12.0,
        "anomaly_detected": False,
        "anomaly_score": -0.12,
        "dominant_pollutant": "PM2.5",
        "weather_condition": "partly_cloudy",
    }
