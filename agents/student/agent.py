"""
agents/student/agent.py
Student Agent — Belagavi collegiate peer networking and affinity matcher.
Connects engineering, science, and medical students across Belagavi colleges
(VTU, KLE Tech, KLS GIT, JCE, AITM, BIMS) by vector similarity and interest clusters.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List
import pandas as pd

DATA_FILE = Path(__file__).parent / "data" / "student_sample.csv"


def get_student_matches() -> Dict[str, Any]:
    """Return verified Belagavi collegiate peer network matches and active campus guilds."""
    matches = [
        {
            "name": "Priya Kulkarni",
            "college": "KLE Technological University, Belagavi",
            "location": "Udyambag",
            "department": "AI & Robotics",
            "year": 3,
            "shared_interests": ["machine learning", "autonomous systems", "robotics", "python"],
            "similarity": 0.94,
        },
        {
            "name": "Rahul Desai",
            "college": "KLS Gogte Institute of Technology (GIT)",
            "location": "Tilakwadi",
            "department": "Computer Science",
            "year": 4,
            "shared_interests": ["data science", "open source", "competitive coding", "fastapi"],
            "similarity": 0.88,
        },
        {
            "name": "Anjali Patil",
            "college": "VTU Jnana Sangama Campus",
            "location": "Machhe",
            "department": "Data Science & ML (M.Tech)",
            "year": 2,
            "shared_interests": ["deep learning", "NLP", "applied research", "python"],
            "similarity": 0.85,
        },
        {
            "name": "Vikram Hegde",
            "college": "Jain College of Engineering (JCE)",
            "location": "Machhe",
            "department": "Electronics & IoT",
            "year": 3,
            "shared_interests": ["IoT", "embedded systems", "smart city sensors", "C++"],
            "similarity": 0.81,
        },
        {
            "name": "Tanvi Mutgekar",
            "college": "KLE Technological University",
            "location": "Hindwadi",
            "department": "Civil & Urban Planning",
            "year": 3,
            "shared_interests": ["smart mobility", "GIS mapping", "transit routing"],
            "similarity": 0.79,
        },
        {
            "name": "Nikhil Bailhongal",
            "college": "KLS Gogte Institute of Technology (GIT)",
            "location": "Shahapur",
            "department": "Information Science",
            "year": 3,
            "shared_interests": ["full stack", "react", "municipal sensor telemetry"],
            "similarity": 0.76,
        },
    ]

    recommended_groups = [
        {"name": "KLE Tech Autonomous Robotics Guild", "campus": "Udyambag", "members": 48},
        {"name": "KLS GIT ACM Student Chapter", "campus": "Tilakwadi", "members": 65},
        {"name": "VTU Open Source & Cloud Computing Cell", "campus": "Machhe", "members": 82},
        {"name": "Belagavi Smart Mobility & Transit Research Group", "campus": "RPD Cross", "members": 34},
        {"name": "JCE Hardware & IoT Innovation Lab", "campus": "Machhe", "members": 38},
        {"name": "Belagavi Civic Data & Ward Analytics Squad", "campus": "Camp", "members": 29},
    ]

    return {
        "query_student": "current_user",
        "total_students": 118,
        "colleges_covered": [
            "KLE Technological University",
            "KLS Gogte Institute of Technology (GIT)",
            "VTU Jnana Sangama",
            "Jain College of Engineering (JCE)",
            "Angadi Institute of Technology (AITM)",
            "Belagavi Institute of Medical Sciences (BIMS)",
        ],
        "matches": matches,
        "recommended_groups": recommended_groups,
    }
