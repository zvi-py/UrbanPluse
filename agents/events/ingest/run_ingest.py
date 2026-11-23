"""
agents/events/ingest/run_ingest.py
Command-line interface to execute the Belagavi event data ingestion pipeline.

Usage:
    python -m agents.events.ingest.run_ingest --sources all --dry-run
    python -m agents.events.ingest.run_ingest --sources vtu_events
"""
from __future__ import annotations

import argparse
import logging
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
import yaml

from agents.events.ingest.dedupe import deduplicate_events
from agents.events.ingest.fetchers.html_fetcher import HtmlFetcher
from agents.events.ingest.fetchers.ics_fetcher import IcsFetcher
from agents.events.ingest.fetchers.rss_fetcher import RssFetcher
from agents.events.ingest.geocode import BelagaviGeocoder
from agents.events.ingest.normalize import EventNormalizer
from agents.events.ingest.validate import REPORT_FILE, validate_batch, write_ingest_report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("run_ingest")

MODULE_DIR = Path(__file__).resolve().parent
DATA_DIR = MODULE_DIR.parent / "data"
SOURCES_YAML = MODULE_DIR / "sources.yaml"
EVENTS_CSV = DATA_DIR / "events.csv"


def load_sources_config(path: Path = SOURCES_YAML) -> List[Dict[str, Any]]:
    if not path.exists():
        logger.error("Sources config file not found: %s", path)
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data.get("sources", [])


def get_next_event_id(existing_df: pd.DataFrame, prefix: str = "R") -> str:
    """Generate the next ID with given prefix (e.g. R006)."""
    max_num = 0
    if not existing_df.empty and "event_id" in existing_df.columns:
        for eid in existing_df["event_id"].dropna():
            if str(eid).startswith(prefix):
                try:
                    num = int(str(eid)[len(prefix):])
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass
    return f"{prefix}{max_num + 1:03d}"


def run_pipeline(
    sources_to_run: str = "all",
    dry_run: bool = False,
    allow_network: bool = True,
    allow_historical: bool = True,
    csv_path: Path = EVENTS_CSV,
    report_path: Path = REPORT_FILE,
) -> Dict[str, Any]:
    """Execute the full ingestion pipeline."""
    sources = load_sources_config()
    if sources_to_run != "all":
        sources = [s for s in sources if s.get("id") == sources_to_run]
        if not sources:
            logger.error("No source found matching id: %s", sources_to_run)
            return {"status": "error", "message": f"Source {sources_to_run} not found"}

    # Load existing events
    if csv_path.exists():
        existing_df = pd.read_csv(csv_path)
        existing_records = existing_df.to_dict(orient="records")
    else:
        existing_df = pd.DataFrame()
        existing_records = []

    geocoder = BelagaviGeocoder(allow_network=allow_network)
    normalizer = EventNormalizer(geocoder=geocoder)

    html_fetcher = HtmlFetcher()
    rss_fetcher = RssFetcher()
    ics_fetcher = IcsFetcher()

    total_raw = 0
    normalized_candidates: List[Dict[str, Any]] = []

    # Temporary DataFrame for ID generation
    current_df = existing_df.copy()

    logger.info("Starting ingestion across %d sources...", len(sources))

    for src in sources:
        src_id = src.get("id", "unknown")
        src_type = src.get("type", "html")
        url = src.get("url", "")
        logger.info("Processing source [%s] (%s): %s", src_id, src_type, url)

        raw_items: List[Dict[str, Any]] = []
        try:
            if src_type == "html":
                raw_items = html_fetcher.fetch_and_parse(url, source_meta=src)
            elif src_type == "rss":
                raw_items = rss_fetcher.fetch_and_parse(url, source_meta=src)
            elif src_type == "ics":
                raw_items = ics_fetcher.fetch_and_parse(url, source_meta=src)
            else:
                logger.warning("Unsupported source type: %s", src_type)
        except Exception as e:
            logger.error("Error fetching source %s: %s", src_id, e)

        total_raw += len(raw_items)
        logger.info("Collected %d raw items from %s", len(raw_items), src_id)

        for item in raw_items:
            next_id = get_next_event_id(current_df, prefix="R")
            norm = normalizer.normalize(item, event_id=next_id)
            if norm:
                normalized_candidates.append(norm)
                # Register id so next candidate gets incremented id
                current_df = pd.concat([current_df, pd.DataFrame([norm])], ignore_index=True)

    # 1. Deduplicate
    unique_candidates, duplicates = deduplicate_events(
        normalized_candidates, existing=existing_records
    )

    # 2. Validate
    accepted, rejected = validate_batch(
        unique_candidates, allow_historical=allow_historical
    )

    # 3. Write Report
    write_ingest_report(
        report_path=report_path,
        source_stats={"total_sources": len(sources), "total_raw": total_raw},
        accepted=accepted,
        duplicates=duplicates,
        rejected=rejected,
    )

    # 4. Merge to CSV if not dry-run
    if not dry_run and accepted:
        # Create backup
        backup_path = csv_path.with_suffix(".csv.bak")
        if csv_path.exists():
            shutil.copyfile(csv_path, backup_path)
            logger.info("Backup created at %s", backup_path)

        new_df = pd.DataFrame(accepted)
        merged_df = pd.concat([existing_df, new_df], ignore_index=True)
        merged_df.to_csv(csv_path, index=False)
        logger.info("Merged %d new events into %s (Total now: %d)", len(accepted), csv_path, len(merged_df))
    elif dry_run:
        logger.info("[DRY RUN] Would merge %d events into %s. No files modified.", len(accepted), csv_path)

    return {
        "status": "ok",
        "sources_polled": len(sources),
        "raw_collected": total_raw,
        "accepted": len(accepted),
        "duplicates": len(duplicates),
        "rejected": len(rejected),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Belagavi Event Data Ingestion CLI")
    parser.add_argument(
        "--sources",
        default="all",
        help="Source ID from sources.yaml or 'all' (default: all)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse, normalize and validate without modifying events.csv",
    )
    args = parser.parse_args()

    res = run_pipeline(sources_to_run=args.sources, dry_run=args.dry_run)
    print("\n--- Ingestion Pipeline Finished ---")
    for k, v in res.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
