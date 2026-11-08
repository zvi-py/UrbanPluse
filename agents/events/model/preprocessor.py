"""
agents/events/model/preprocessor.py
Text preprocessing and regional synonym expansion for TF-IDF ranking.
"""
from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd
import yaml

logger = logging.getLogger(__name__)

SYNONYMS_FILE = Path(__file__).resolve().parent / "synonyms.yaml"


class TextPreprocessor:
    """Belagavi/India-aware text normalizer and synonym expander."""

    def __init__(self, synonyms_path: Optional[Path] = None) -> None:
        self.synonyms_path = synonyms_path or SYNONYMS_FILE
        self.synonyms: Dict[str, str] = {}
        self.custom_stopwords: List[str] = []
        self._load_config()

    def _load_config(self) -> None:
        if not self.synonyms_path.exists():
            logger.warning("Synonyms file %s not found. Proceeding with basic cleanup.", self.synonyms_path)
            return
        try:
            with open(self.synonyms_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
            self.synonyms = {
                k.lower(): v.lower() for k, v in data.get("synonyms", {}).items()
            }
            self.custom_stopwords = [
                w.lower() for w in data.get("custom_stopwords", [])
            ]
        except Exception as e:
            logger.error("Failed loading synonyms.yaml: %s", e)

    def clean_text(self, text: str) -> str:
        """Basic lowercase and punctuation normalization."""
        if not text:
            return ""
        s = text.lower()
        # Replace hyphens and slashes with space
        s = re.sub(r"[-_/]", " ", s)
        # Remove non-alphanumeric except spaces
        s = re.sub(r"[^\w\s]", " ", s)
        # Collapse multiple spaces
        return " ".join(s.split())

    def expand_synonyms(self, text: str) -> str:
        """Expand local synonyms into canonical tokens."""
        words = text.split()
        expanded_tokens: List[str] = []
        for w in words:
            expanded_tokens.append(w)
            if w in self.synonyms:
                expanded_tokens.append(self.synonyms[w])
        return " ".join(expanded_tokens)

    def preprocess(self, text: str, expand: bool = True) -> str:
        cleaned = self.clean_text(text)
        if expand and self.synonyms:
            return self.expand_synonyms(cleaned)
        return cleaned

    def build_event_text(self, df: pd.DataFrame) -> pd.Series:
        """Combine title, description, category, and tags into preprocessed event representation."""
        combined = (
            df["title"].fillna("")
            + " "
            + df["description"].fillna("")
            + " "
            + df["category"].fillna("")
            + " "
            + df["tags"].fillna("").str.replace(";", " ", regex=False)
            + " "
            + df["organizer"].fillna("")
        )
        return combined.apply(lambda t: self.preprocess(t, expand=True))
