"""
agents/student/agent.py
Student Agent — stub implementation.

TODO (Student Developer):
  - Load agents/student/data/student_sample.csv with pandas.
  - Build interest vectors (TF-IDF or one-hot encoding over interest tags).
  - Use cosine similarity to match students with similar interests.
  - Expose group/activity recommendation by interest cluster.
  - Set source="csv_fallback" once CSV logic is implemented.
"""
from __future__ import annotations

from typing import Any, Dict


def get_student_matches() -> Dict[str, Any]:
    """Return stub student match data. Replace with real logic."""
    return {
        "query_student": "current_user",
        "matches": [
            {
                "name": "Priya Kulkarni",
                "shared_interests": ["machine learning", "robotics", "hackathons"],
                "similarity": 0.91,
                "department": "AI & DS",
                "year": 3,
            },
            {
                "name": "Rahul Desai",
                "shared_interests": ["data science", "open source", "competitive coding"],
                "similarity": 0.84,
                "department": "CSE",
                "year": 3,
            },
            {
                "name": "Anjali Patil",
                "shared_interests": ["IoT", "embedded systems", "hackathons"],
                "similarity": 0.79,
                "department": "ECE",
                "year": 2,
            },
        ],
        "recommended_groups": [
            {"name": "ML & AI Club", "members": 42},
            {"name": "Open Source Cell", "members": 28},
        ],
    }
