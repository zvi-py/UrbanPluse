"""
agents/events/model/train.py
Training, serialization, and artifact management for the Belagavi Event Recommender.

Serializes:
- vectorizer.joblib
- tfidf_matrix.joblib
- event_ids.joblib
- metadata.json (with data/config MD5 hashes for automatic cache invalidation)
"""
from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

from agents.events.model.preprocessor import SYNONYMS_FILE, TextPreprocessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train")

MODEL_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = MODEL_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

CONFIG_FILE = MODEL_DIR / "config.json"
DATA_DIR = MODEL_DIR.parent / "data"
EVENTS_CSV = DATA_DIR / "events.csv"

VEC_PATH = ARTIFACTS_DIR / "vectorizer.joblib"
MAT_PATH = ARTIFACTS_DIR / "tfidf_matrix.joblib"
IDS_PATH = ARTIFACTS_DIR / "event_ids.joblib"
META_PATH = ARTIFACTS_DIR / "metadata.json"


def compute_file_md5(path: Path) -> str:
    if not path.exists():
        return ""
    return hashlib.md5(path.read_bytes()).hexdigest()


def load_config() -> Dict[str, Any]:
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "ngram_range": [1, 2],
        "sublinear_tf": True,
        "min_df": 1,
        "max_df": 0.95,
        "w_sim": 0.60,
        "w_prox": 0.25,
        "w_time": 0.15,
    }


def is_artifact_stale(
    events_csv: Path = EVENTS_CSV,
    config_file: Path = CONFIG_FILE,
    synonyms_file: Path = SYNONYMS_FILE,
) -> bool:
    """Check whether serialized model artifacts are missing or stale relative to sources."""
    if not (VEC_PATH.exists() and MAT_PATH.exists() and IDS_PATH.exists() and META_PATH.exists()):
        return True

    try:
        with open(META_PATH, "r", encoding="utf-8") as f:
            meta = json.load(f)

        if meta.get("events_hash") != compute_file_md5(events_csv):
            return True
        if meta.get("config_hash") != compute_file_md5(config_file):
            return True
        if meta.get("synonyms_hash") != compute_file_md5(synonyms_file):
            return True
        return False
    except Exception as e:
        logger.warning("Error reading artifact metadata: %s. Marking as stale.", e)
        return True


def train_model(
    events_csv: Path = EVENTS_CSV,
    save_artifacts: bool = True,
) -> Tuple[TfidfVectorizer, Any, List[str], Dict[str, Any]]:
    """Fit TF-IDF model on events corpus and optionally serialize artifacts."""
    logger.info("Fitting TF-IDF model on %s...", events_csv)
    df = pd.read_csv(events_csv)
    cfg = load_config()
    preprocessor = TextPreprocessor()

    corpus = preprocessor.build_event_text(df).tolist()
    event_ids = df["event_id"].astype(str).tolist()

    ngram = tuple(cfg.get("ngram_range", [1, 2]))
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=ngram,
        sublinear_tf=cfg.get("sublinear_tf", True),
        min_df=cfg.get("min_df", 1),
        max_df=cfg.get("max_df", 0.95),
    )
    matrix = vectorizer.fit_transform(corpus)

    if save_artifacts:
        joblib.dump(vectorizer, VEC_PATH)
        joblib.dump(matrix, MAT_PATH)
        joblib.dump(event_ids, IDS_PATH)

        metadata = {
            "events_hash": compute_file_md5(events_csv),
            "config_hash": compute_file_md5(CONFIG_FILE),
            "synonyms_hash": compute_file_md5(SYNONYMS_FILE),
            "num_events": len(event_ids),
            "vocabulary_size": len(vectorizer.vocabulary_),
            "trained_at": datetime.now(timezone.utc).isoformat(),
        }
        with open(META_PATH, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        logger.info("Serialized model artifacts to %s (vocab size: %d)", ARTIFACTS_DIR, len(vectorizer.vocabulary_))

    return vectorizer, matrix, event_ids, cfg


def load_or_train_model(
    events_csv: Path = EVENTS_CSV,
    force_retrain: bool = False,
) -> Tuple[TfidfVectorizer, Any, List[str], Dict[str, Any]]:
    """Load cached model artifacts if valid; otherwise retrain automatically."""
    cfg = load_config()
    if not force_retrain and not is_artifact_stale(events_csv):
        try:
            vectorizer = joblib.load(VEC_PATH)
            matrix = joblib.load(MAT_PATH)
            event_ids = joblib.load(IDS_PATH)
            return vectorizer, matrix, event_ids, cfg
        except Exception as e:
            logger.warning("Failed loading cached joblib artifacts: %s. Retraining.", e)

    return train_model(events_csv=events_csv, save_artifacts=True)


def main() -> None:
    print("\n--- Training Belagavi Event Recommender ---")
    vec, mat, ids, cfg = train_model(save_artifacts=True)
    print(f"Successfully trained TF-IDF model on {len(ids)} events.")
    print(f"Vocabulary size: {len(vec.vocabulary_)}")
    print(f"Artifacts stored in: {ARTIFACTS_DIR}")


if __name__ == "__main__":
    main()
