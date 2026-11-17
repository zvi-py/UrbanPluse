"""
agents/environment/services/noise_service.py
Community Noise Intelligence service managing citizen acoustic incident reports,
category classification, validation, and ward-level acoustic statistics.
"""
from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

VALID_CATEGORIES = {"traffic", "construction", "industrial", "loudspeaker", "event", "other"}


class NoiseService:
    _instance: Optional[NoiseService] = None

    def __init__(self, storage_path: Optional[str] = None):
        if storage_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            storage_path = os.path.join(base_dir, "data", "noise_reports.json")
        self.storage_path = storage_path
        self._ensure_storage()

    @classmethod
    def get_instance(cls) -> NoiseService:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _ensure_storage(self) -> None:
        if not os.path.exists(self.storage_path):
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _read_reports(self) -> List[Dict[str, Any]]:
        try:
            with open(self.storage_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _save_reports(self, reports: List[Dict[str, Any]]) -> None:
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(reports, f, indent=2)

    def get_all_reports(self, limit: int = 50, ward_id: Optional[int] = None) -> List[Dict[str, Any]]:
        reports = self._read_reports()
        if ward_id is not None:
            reports = [r for r in reports if r.get("ward_id") == ward_id]
        # Sort descending by timestamp
        reports.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return reports[:limit]

    def add_report(
        self,
        ward_id: int,
        ward_name: str,
        category: str,
        description: str,
        decibel_estimate: Optional[float] = None,
        reporter_alias: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Submit a new citizen community noise report."""
        norm_cat = category.lower().strip()
        if norm_cat not in VALID_CATEGORIES:
            norm_cat = "other"

        new_report = {
            "report_id": f"NR-{uuid.uuid4().hex[:6].upper()}",
            "ward_id": ward_id,
            "ward_name": ward_name,
            "category": norm_cat,
            "description": description.strip(),
            "decibel_estimate": round(float(decibel_estimate), 1) if decibel_estimate is not None else None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "investigating",
            "source": "citizen_report",
            "reporter_alias": reporter_alias or "Citizen Reporter",
        }

        reports = self._read_reports()
        reports.insert(0, new_report)
        self._save_reports(reports)
        return new_report

    def get_noise_summary(self) -> Dict[str, Any]:
        """Aggregate stats across categories and wards."""
        reports = self._read_reports()
        by_category: Dict[str, int] = {}
        for r in reports:
            cat = r.get("category", "other")
            by_category[cat] = by_category.get(cat, 0) + 1

        return {
            "total_community_reports": len(reports),
            "breakdown_by_category": by_category,
            "active_investigations": len([r for r in reports if r.get("status") == "investigating"]),
            "latest_reports": reports[:5],
            "disclaimer": "Community noise reports represent citizen-logged acoustic events and are distinct from certified decibel calibration sensors.",
        }
