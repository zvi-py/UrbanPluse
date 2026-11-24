"""CSV-backed Student Agent using TF-IDF and cosine similarity."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


CSV_PATH = Path(__file__).resolve().parent / "data" / "student_sample.csv"

REQUIRED_COLUMNS = {"id", "name", "department", "year", "interests"}


def _parse_interests(value: Any) -> list[str]:
    """Convert comma-separated interests into normalized tags."""
    if pd.isna(value):
        return []

    return [
        interest.strip().lower()
        for interest in str(value).split(",")
        if interest.strip()
    ]


def get_student_matches() -> Dict[str, Any]:
    """Match the first sample student with other students using TF-IDF."""
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Student dataset not found: {CSV_PATH}")

    students = pd.read_csv(CSV_PATH)

    missing_columns = REQUIRED_COLUMNS - set(students.columns)
    if missing_columns:
        raise ValueError(
            f"Student CSV is missing required columns: {sorted(missing_columns)}"
        )

    if students.empty:
        return {
            "query_student": None,
            "matches": [],
            "recommended_groups": [],
        }

    students["parsed_interests"] = students["interests"].apply(_parse_interests)

    # Use exact interest phrases as TF-IDF tokens.
    interest_documents = students["parsed_interests"].apply(
        lambda tags: "|".join(tags)
    ).tolist()

    if not any(interest_documents):
        return {
            "query_student": str(students.iloc[0]["name"]),
            "matches": [],
            "recommended_groups": [],
        }

    vectorizer = TfidfVectorizer(
        tokenizer=lambda value: value.split("|"),
        preprocessor=None,
        token_pattern=None,
        lowercase=False,
    )

    interest_matrix = vectorizer.fit_transform(interest_documents)
    similarity_scores = cosine_similarity(interest_matrix[0:1], interest_matrix)[0]

    query_student = students.iloc[0]
    query_interests = query_student["parsed_interests"]

    matches = []

    for index, student in students.iterrows():
        if index == 0:
            continue

        similarity = float(similarity_scores[index])

        if similarity <= 0:
            continue

        candidate_interests = student["parsed_interests"]
        shared_interests = [
            interest
            for interest in query_interests
            if interest in candidate_interests
        ]

        matches.append({
            "name": str(student["name"]),
            "shared_interests": shared_interests,
            "similarity": round(similarity, 4),
            "department": str(student["department"]),
            "year": int(student["year"]),
        })

    matches.sort(key=lambda student: student["similarity"], reverse=True)

    # Suggest interest groups where at least two sample students share a tag.
    recommended_groups = []

    for interest in query_interests:
        member_count = sum(
            interest in student_interests
            for student_interests in students["parsed_interests"]
        )

        if member_count >= 2:
            recommended_groups.append({
                "name": f"{interest.title()} Community",
                "members": int(member_count),
            })

    recommended_groups.sort(key=lambda group: group["members"], reverse=True)

    return {
        "query_student": str(query_student["name"]),
        "matches": matches,
        "recommended_groups": recommended_groups,
    }
