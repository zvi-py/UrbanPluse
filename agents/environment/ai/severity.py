"""
agents/environment/ai/severity.py
Defines Central Pollution Control Board (CPCB) National Ambient Air Quality Standards (NAAQS)
thresholds, noise standards, and classification logic distinguishing between:
1. Statistical Anomaly (outlier multivariate pattern detected by ML)
2. Environmental Threshold Exceedance (regulatory limit violation)
3. Verified Environmental Incident (confirmed sustained hazard)
"""
from typing import Dict, Any, Tuple

# CPCB National Ambient Air Quality Standards (NAAQS) for 24-hr averages
NAAQS_THRESHOLDS = {
    "pm25": {"good": 30, "satisfactory": 60, "moderate": 90, "poor": 120, "very_poor": 250},
    "pm10": {"good": 50, "satisfactory": 100, "moderate": 250, "poor": 350, "very_poor": 430},
    "noise_residential_day": 55.0,
    "noise_residential_night": 45.0,
    "noise_commercial_day": 65.0,
    "noise_commercial_night": 55.0,
    "noise_industrial_day": 75.0,
    "noise_industrial_night": 70.0,
}


def get_cpcb_aqi_category(aqi: float) -> Tuple[str, str, str]:
    """
    Returns (category_name, alert_level, health_advisory)
    Category scale according to CPCB India NAQI:
      0-50: Good
      51-100: Satisfactory
      101-200: Moderate
      201-300: Poor
      301-400: Very Poor
      401-500: Severe
    """
    if aqi <= 50:
        return "Good", "info", "Minimal impact. Air quality is considered satisfactory and poses little to no risk."
    elif aqi <= 100:
        return "Satisfactory", "info", "Minor breathing discomfort to sensitive people."
    elif aqi <= 200:
        return "Moderate", "warning", "Breathing discomfort to the people with lungs, asthma and heart diseases."
    elif aqi <= 300:
        return "Poor", "warning", "Breathing discomfort to most people on prolonged exposure."
    elif aqi <= 400:
        return "Very Poor", "critical", "Respiratory illness to the people on prolonged exposure."
    else:
        return "Severe", "critical", "Affects healthy people and seriously impacts those with existing diseases."


def classify_event_type(is_statistical_anomaly: bool, aqi: float, pm25: float, noise_db: float) -> str:
    """
    Distinguish between:
    - Statistical anomaly (unusual multivariate pattern, even if within regulatory limits)
    - Environmental threshold exceedance (NAAQS limit breached)
    - Verified environmental incident (both severe anomaly and high exceedance)
    - Nominal (baseline state)
    """
    exceeds_threshold = (aqi > 100) or (pm25 > 60.0) or (noise_db > 75.0)
    
    if is_statistical_anomaly and exceeds_threshold:
        return "Verified Environmental Incident"
    elif exceeds_threshold:
        return "Environmental Threshold Exceedance"
    elif is_statistical_anomaly:
        return "Statistical Anomaly"
    else:
        return "Nominal Conditions"
