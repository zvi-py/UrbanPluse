from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# SQLite connection args to allow FastAPI to handle requests across threads
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False  # Set to True to see generated SQL queries in the terminal
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for database models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session to API route handlers.
    Ensures the session is cleanly closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

