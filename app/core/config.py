import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env file if it exists
load_dotenv(BASE_DIR / ".env")


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "UrbanPulse - Student Community Agent")
    PROJECT_DESCRIPTION: str = (
        "Backend API for student community connectivity, interest matching, "
        "study groups, and opportunity discovery."
    )
    VERSION: str = os.getenv("VERSION", "0.2.0")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    
    # SQLite Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'urbanpulse.db'}")

    # Configurable Matching Weights
    MATCH_INTEREST_WEIGHT: float = float(os.getenv("MATCH_INTEREST_WEIGHT", "0.7"))
    MATCH_SKILL_WEIGHT: float = float(os.getenv("MATCH_SKILL_WEIGHT", "0.3"))
    MATCH_MIN_SIMILARITY: float = float(os.getenv("MATCH_MIN_SIMILARITY", "0.01"))


settings = Settings()
