"""
agents/events/model/tune.py
Grid search hyperparameter tuning for TF-IDF vectorizer and multi-factor ranking weights.
Saves the winning configuration to agents/events/model/config.json.
"""
from __future__ import annotations

import itertools
import json
import logging
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from agents.events.model.evaluate import (
    EVAL_QUERIES_CSV,
    EVENTS_CSV,
    compute_ndcg,
)
from agents.events.model.preprocessor import TextPreprocessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("tune")

CONFIG_FILE = Path(__file__).resolve().parent / "config.json"


def grid_search_tuning(
    events_path: Path = EVENTS_CSV,
    eval_path: Path = EVAL_QUERIES_CSV,
    config_out: Path = CONFIG_FILE,
) -> Dict[str, Any]:
    df = pd.read_csv(events_path)
    eval_df = pd.read_csv(eval_path)

    preprocessor = TextPreprocessor()
    corpus = preprocessor.build_event_text(df).tolist()
    event_ids = df["event_id"].tolist()

    # Precomputed spatial/temporal features
    lat_center, lng_center = 15.8497, 74.4977
    R = 6371.0
    dlat = np.radians(df["lat"].values - lat_center)
    dlng = np.radians(df["lng"].values - lng_center)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat_center)) * np.cos(np.radians(df["lat"].values)) * np.sin(dlng / 2) ** 2
    distances = R * 2 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
    prox_scores = np.clip(1.0 - distances / 15.0, 0.0, 1.0)
    attendances = df["expected_attendance"].fillna(0).astype(float).values
    pop_scores = attendances / max(attendances.max(), 1.0)

    # Grid search space
    tfidf_space = [
        {"ngram_range": (1, 1), "sublinear_tf": True, "min_df": 1, "max_df": 0.95},
        {"ngram_range": (1, 2), "sublinear_tf": True, "min_df": 1, "max_df": 0.95},
        {"ngram_range": (1, 2), "sublinear_tf": False, "min_df": 1, "max_df": 1.0},
        {"ngram_range": (1, 3), "sublinear_tf": True, "min_df": 1, "max_df": 0.90},
    ]

    weight_candidates = [
        (0.70, 0.20, 0.10),
        (0.60, 0.25, 0.15),
        (0.55, 0.30, 0.15),
        (0.50, 0.30, 0.20),
        (0.40, 0.40, 0.20),
    ]

    best_score = -1.0
    best_config: Dict[str, Any] = {}

    logger.info("Evaluating %d TF-IDF variants x %d weight sets = %d combinations...",
                len(tfidf_space), len(weight_candidates), len(tfidf_space) * len(weight_candidates))

    for tfidf_param in tfidf_space:
        try:
            vec = TfidfVectorizer(
                stop_words="english",
                ngram_range=tfidf_param["ngram_range"],
                sublinear_tf=tfidf_param["sublinear_tf"],
                min_df=tfidf_param["min_df"],
                max_df=tfidf_param["max_df"],
            )
            matrix = vec.fit_transform(corpus)
        except Exception:
            continue

        # Precompute query similarities
        query_sims = []
        ground_truths = []
        for _, row in eval_df.iterrows():
            q_text = preprocessor.preprocess(str(row["query_text"]))
            gt = set(str(row["relevant_event_ids"]).split(";"))
            if not gt:
                continue
            q_vec = vec.transform([q_text])
            sim = cosine_similarity(q_vec, matrix).flatten()
            query_sims.append(sim)
            ground_truths.append(gt)

        for w_sim, w_prox, w_time in weight_candidates:
            ndcg_list = []
            for sim, gt in zip(query_sims, ground_truths):
                score = w_sim * sim + w_prox * prox_scores + w_time * pop_scores
                ranked = [event_ids[i] for i in np.argsort(-score)]
                ndcg_list.append(compute_ndcg(ranked, gt, k=10))

            mean_ndcg = float(np.mean(ndcg_list))
            if mean_ndcg > best_score:
                best_score = mean_ndcg
                best_config = {
                    "ngram_range": list(tfidf_param["ngram_range"]),
                    "sublinear_tf": tfidf_param["sublinear_tf"],
                    "min_df": tfidf_param["min_df"],
                    "max_df": tfidf_param["max_df"],
                    "w_sim": w_sim,
                    "w_prox": w_prox,
                    "w_time": w_time,
                    "best_ndcg_10": round(best_score, 4),
                }

    logger.info("Tuning complete. Best NDCG@10: %.4f", best_score)
    with open(config_out, "w", encoding="utf-8") as f:
        json.dump(best_config, f, indent=2)
    logger.info("Winning config saved to %s", config_out)
    return best_config


def main() -> None:
    print("\n--- Tuning Belagavi Event Recommender Hyperparameters ---")
    best = grid_search_tuning()
    print("\nWinning Configuration:")
    for k, v in best.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
