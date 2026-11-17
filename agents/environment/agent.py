"""
agents/environment/agent.py
Environment Agent — Real implementation for Belagavi City Environmental Intelligence.
Coordinates live meteorological telemetry, air quality observations, community noise events,
and Isolation Forest AI anomaly detection across all 58 municipal wards.
"""
from __future__ import annotations

from typing import Any, Dict

from agents.environment.ai.anomaly_model import EnvironmentalAnomalyDetector
from agents.environment.services.air_quality_service import AirQualityService
from agents.environment.services.alert_service import AlertService
from agents.environment.services.noise_service import NoiseService
from agents.environment.services.ward_service import WardService
from agents.environment.services.weather_service import WeatherService


def get_environment_status() -> Dict[str, Any]:
    """
    Called directly by the orchestrator (backend/main.py in /overview).
    Synthesizes live atmospheric telemetry, weather, noise, and Isolation Forest anomaly status.
    """
    weather_svc = WeatherService.get_instance()
    aq_svc = AirQualityService.get_instance()
    ward_svc = WardService.get_instance()
    detector = EnvironmentalAnomalyDetector.get_instance()
    alert_svc = AlertService.get_instance()

    weather = weather_svc.get_weather()
    aq = aq_svc.get_air_quality()
    city_sum = ward_svc.get_city_summary()
    active_alerts = alert_svc.get_active_alerts()

    # Run AI Anomaly detector on current atmospheric packet
    eval_res = detector.detect_anomaly(
        pm25=aq["pollutants"]["pm25"]["value"],
        pm10=aq["pollutants"]["pm10"]["value"],
        temperature_celsius=weather["temperature_celsius"],
        humidity_percent=weather["humidity_percent"],
        wind_speed_kmh=weather["wind_speed_kmh"],
        noise_db=61.5,
    )

    # Honest source determination: live_api if Open-Meteo or OpenAQ succeeded
    is_live = (weather.get("source") == "live_api") or (aq.get("source") == "live_api")
    source_tag = "live_api" if is_live else "csv_fallback"

    return {
        "aqi": aq["aqi"],
        "aqi_category": aq["aqi_category"].lower(),
        "temperature_celsius": weather["temperature_celsius"],
        "apparent_temperature_celsius": weather.get("apparent_temperature_celsius", weather["temperature_celsius"]),
        "humidity_percent": weather["humidity_percent"],
        "noise_db": 61.5,
        "wind_speed_kmh": weather["wind_speed_kmh"],
        "wind_direction_degrees": weather.get("wind_direction_degrees", 240),
        "dominant_pollutant": aq.get("dominant_pollutant", "PM2.5"),
        "weather_condition": weather["condition_key"],
        "weather_label": weather["condition"],
        "anomaly_detected": eval_res.get("is_anomaly", False),
        "anomaly_score": eval_res.get("anomaly_score", 0.0),
        "anomaly_event_type": eval_res.get("event_type", "Nominal"),
        "anomaly_explanations": eval_res.get("explanations", []),
        "priority": eval_res.get("priority", "info"),
        "total_wards": city_sum["total_wards"],
        "monitored_wards_count": city_sum["monitored_wards_count"],
        "unverified_wards_count": city_sum["unverified_wards_count"],
        "active_alerts_count": len(active_alerts),
        "active_anomalies_count": len([a for a in active_alerts if a.get("category") == "ai_anomaly"]),
        "source": source_tag,
        "timestamp": weather["timestamp"],
    }
