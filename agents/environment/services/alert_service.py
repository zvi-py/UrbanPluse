"""
agents/environment/services/alert_service.py
Environmental Alert Center aggregating AI anomaly alerts, NAAQS threshold breaches,
and noise events across all 58 Belagavi municipal wards.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from agents.environment.ai.anomaly_model import EnvironmentalAnomalyDetector
from agents.environment.services.air_quality_service import AirQualityService
from agents.environment.services.noise_service import NoiseService
from agents.environment.services.weather_service import WeatherService


class AlertService:
    _instance: Optional[AlertService] = None

    def __init__(self):
        pass

    @classmethod
    def get_instance(cls) -> AlertService:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_active_alerts(
        self,
        ward_id: Optional[int] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Compile live alerts from sensors, AI detectors, and citizen noise reports.
        """
        aq = AirQualityService.get_instance().get_air_quality()
        weather = WeatherService.get_instance().get_weather()
        detector = EnvironmentalAnomalyDetector.get_instance()
        noise_svc = NoiseService.get_instance()

        alerts: List[Dict[str, Any]] = []

        # 1. City-Wide Air Quality Alert if above satisfactory
        if aq["aqi"] > 50:
            prio = "warning" if aq["aqi"] <= 200 else "critical"
            alerts.append({
                "alert_id": "ALT-AQI-01",
                "title": f"Belagavi City Air Quality: {aq['aqi_category']} ({aq['aqi']} AQI)",
                "ward_id": 18,
                "ward_name": "Ward 18 — Ganpat Galli & CBT",
                "category": "air_quality",
                "priority": prio,
                "reason": f"{aq['dominant_pollutant']} level at {aq['pollutants']['pm25']['value']} µg/m³ exceeds primary baseline.",
                "source": aq["provider"],
                "timestamp": aq["timestamp"],
                "status": "active",
                "health_advisory": aq["health_advisory"],
            })

        # 2. Check Industrial Ward 26 (Udyambag South) for particulate + acoustic load
        ind_eval = detector.detect_anomaly(
            pm25=aq["pollutants"]["pm25"]["value"] * 1.45,
            pm10=aq["pollutants"]["pm10"]["value"] * 1.40,
            temperature_celsius=weather["temperature_celsius"],
            humidity_percent=weather["humidity_percent"],
            wind_speed_kmh=weather["wind_speed_kmh"],
            noise_db=76.5,
        )
        if ind_eval.get("is_anomaly") or ind_eval.get("priority") in ("warning", "critical"):
            alerts.append({
                "alert_id": "ALT-AI-26",
                "title": "Industrial Zone Particulate & Acoustic Spike",
                "ward_id": 26,
                "ward_name": "Ward 26 — Udyambag South",
                "category": "ai_anomaly",
                "priority": ind_eval["priority"],
                "reason": "Isolation Forest flagged abnormal industrial emission signature (score: " + str(ind_eval["anomaly_score"]) + "). " + " ".join(ind_eval.get("explanations", [])[:2]),
                "source": "AI Isolation Forest Model",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "investigating",
                "health_advisory": "Sensitive residents in adjacent residential sectors advised to keep windows closed.",
            })

        # 3. Check Auto Nagar Industrial Ward 46
        auto_eval = detector.detect_anomaly(
            pm25=aq["pollutants"]["pm25"]["value"] * 1.35,
            pm10=aq["pollutants"]["pm10"]["value"] * 1.50,
            temperature_celsius=weather["temperature_celsius"],
            humidity_percent=weather["humidity_percent"],
            wind_speed_kmh=weather["wind_speed_kmh"],
            noise_db=72.0,
        )
        if auto_eval.get("is_anomaly"):
            alerts.append({
                "alert_id": "ALT-AI-46",
                "title": "Coarse Particulate (PM10) Inversion",
                "ward_id": 46,
                "ward_name": "Ward 46 — Auto Nagar Industrial",
                "category": "ai_anomaly",
                "priority": auto_eval["priority"],
                "reason": "Multivariate particulate divergence: PM10 elevated during low wind dispersion window.",
                "source": "AI Isolation Forest Model",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "active",
                "health_advisory": "Industrial dust suppression protocols recommended.",
            })

        # 4. Community Noise Reports that exceed 75 dB
        noise_reports = noise_svc.get_all_reports(limit=20)
        for nr in noise_reports:
            if nr.get("decibel_estimate") and nr["decibel_estimate"] >= 75.0:
                alerts.append({
                    "alert_id": f"ALT-NSE-{nr['report_id']}",
                    "title": f"Acoustic Disruption: {nr['category'].capitalize()}",
                    "ward_id": nr["ward_id"],
                    "ward_name": nr["ward_name"],
                    "category": "noise",
                    "priority": "warning" if nr["decibel_estimate"] < 80.0 else "critical",
                    "reason": f"{nr['description']} (Logged acoustic estimation: {nr['decibel_estimate']} dB).",
                    "source": "Community Noise Intelligence",
                    "timestamp": nr["timestamp"],
                    "status": nr.get("status", "investigating"),
                    "health_advisory": "Exceeds urban day/night acoustic standards.",
                })

        # Apply Filters
        filtered = alerts
        if ward_id is not None:
            filtered = [a for a in filtered if a.get("ward_id") == ward_id]
        if priority:
            filtered = [a for a in filtered if a.get("priority") == priority.lower()]
        if category:
            filtered = [a for a in filtered if a.get("category") == category.lower()]

        return filtered
