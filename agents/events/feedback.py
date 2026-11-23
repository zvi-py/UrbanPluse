"""
agents/events/feedback.py
Lightweight SQLite feedback storage and Rocchio vector update algorithm.
"""
from __future__ import annotations

import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).resolve().parent / "data" / "feedback.db"

# Rocchio hyperparameters for profile adaptation:
# q_learned = alpha * q_init + beta * sum(liked) + delta * sum(saved) - gamma * sum(dismissed)
ROCCHIO_ALPHA = 0.50   # Weight of initial query / stated profile
ROCCHIO_BETA = 0.35    # Weight of liked events
ROCCHIO_DELTA = 0.40   # Weight of saved/bookmarked events (high intent)
ROCCHIO_GAMMA = 0.25   # Weight of dismissed events (negative feedback)


def get_db_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_feedback_db(db_path: Path = DB_PATH) -> None:
    """Initialize the SQLite feedback table if it doesn't already exist."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with get_db_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS event_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                event_id TEXT NOT NULL,
                action TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_fb_user ON event_feedback(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_fb_event ON event_feedback(event_id)")
        conn.commit()


def record_feedback(
    user_id: str,
    event_id: str,
    action: str,
    db_path: Path = DB_PATH,
) -> Dict[str, Any]:
    """Record an interaction (like, save, dismiss) for a user."""
    action_clean = action.lower().strip()
    if action_clean not in {"like", "save", "dismiss", "not_interested"}:
        raise ValueError(f"Invalid feedback action: '{action}'. Must be like, save, or dismiss.")

    init_feedback_db(db_path)
    now_iso = datetime.now(timezone.utc).isoformat()

    with get_db_connection(db_path) as conn:
        conn.execute(
            "INSERT INTO event_feedback (user_id, event_id, action, timestamp) VALUES (?, ?, ?, ?)",
            (user_id, event_id, action_clean, now_iso),
        )
        conn.commit()

    return {
        "status": "recorded",
        "user_id": user_id,
        "event_id": event_id,
        "action": action_clean,
        "timestamp": now_iso,
    }


def get_user_feedback(user_id: str, db_path: Path = DB_PATH) -> List[Dict[str, Any]]:
    """Retrieve all recorded interactions for a user."""
    init_feedback_db(db_path)
    with get_db_connection(db_path) as conn:
        rows = conn.execute(
            "SELECT user_id, event_id, action, timestamp FROM event_feedback WHERE user_id = ? ORDER BY id DESC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_user_profile_summary(
    user_id: str,
    vectorizer: Optional[TfidfVectorizer] = None,
    events_matrix: Optional[Any] = None,
    event_id_to_idx: Optional[Dict[str, int]] = None,
    db_path: Path = DB_PATH,
) -> Dict[str, Any]:
    """Summarize user feedback history and top learned keywords."""
    feedback = get_user_feedback(user_id, db_path=db_path)
    action_counts = {"like": 0, "save": 0, "dismiss": 0}
    for f in feedback:
        act = f["action"]
        if act == "not_interested":
            act = "dismiss"
        if act in action_counts:
            action_counts[act] += 1

    top_interests: List[str] = []
    if vectorizer and events_matrix is not None and event_id_to_idx and feedback:
        try:
            learned_vec = compute_rocchio_vector(
                initial_vec=np.zeros(events_matrix.shape[1]),
                user_id=user_id,
                events_matrix=events_matrix,
                event_id_to_idx=event_id_to_idx,
                db_path=db_path,
            )
            # Find top non-zero terms
            feature_names = vectorizer.get_feature_names_out()
            top_indices = np.argsort(-learned_vec)[:8]
            top_interests = [
                feature_names[i]
                for i in top_indices
                if learned_vec[i] > 0.05
            ]
        except Exception as e:
            logger.debug("Could not compute top learned interests: %s", e)

    return {
        "user_id": user_id,
        "total_interactions": len(feedback),
        "breakdown": action_counts,
        "top_learned_interests": top_interests,
        "recent_feedback": feedback[:10],
    }


def compute_rocchio_vector(
    initial_vec: np.ndarray,
    user_id: str,
    events_matrix: Any,
    event_id_to_idx: Dict[str, int],
    db_path: Path = DB_PATH,
) -> np.ndarray:
    """Compute modified query vector using Rocchio Relevance Feedback.

    q_learned = alpha * q_init + beta * sum(liked) + delta * sum(saved) - gamma * sum(dismissed)
    Negative weights are clipped to 0.0.
    """
    feedback = get_user_feedback(user_id, db_path=db_path)
    if not feedback:
        return initial_vec

    num_features = events_matrix.shape[1]
    liked_vecs = []
    saved_vecs = []
    dismissed_vecs = []

    for item in feedback:
        eid = item["event_id"]
        if eid not in event_id_to_idx:
            continue
        idx = event_id_to_idx[eid]
        # Get dense 1D vector for event
        row_vec = events_matrix[idx].toarray().flatten()

        act = item["action"]
        if act == "like":
            liked_vecs.append(row_vec)
        elif act == "save":
            saved_vecs.append(row_vec)
        elif act in {"dismiss", "not_interested"}:
            dismissed_vecs.append(row_vec)

    # If user has no valid event matches in matrix, return initial
    if not liked_vecs and not saved_vecs and not dismissed_vecs:
        return initial_vec

    q_init = initial_vec.copy()
    sum_liked = np.sum(liked_vecs, axis=0) if liked_vecs else np.zeros(num_features)
    sum_saved = np.sum(saved_vecs, axis=0) if saved_vecs else np.zeros(num_features)
    sum_dismissed = np.sum(dismissed_vecs, axis=0) if dismissed_vecs else np.zeros(num_features)

    # Rocchio formula
    q_learned = (
        ROCCHIO_ALPHA * q_init
        + ROCCHIO_BETA * sum_liked
        + ROCCHIO_DELTA * sum_saved
        - ROCCHIO_GAMMA * sum_dismissed
    )

    # Clip negative values to zero (term frequency non-negativity constraint)
    q_learned = np.clip(q_learned, 0.0, None)

    # Re-normalize if non-zero
    norm = np.linalg.norm(q_learned)
    if norm > 0:
        q_learned = q_learned / norm

    return q_learned
