from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class Student(Base):
    """
    SQLAlchemy model representing a registered student profile in the SQLite database.
    """
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    college_name = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    year_of_study = Column(Integer, nullable=False)
    
    # SQLite supports JSON columns to cleanly store lists of strings
    skills = Column(JSON, nullable=False, default=list)
    interests = Column(JSON, nullable=False, default=list)
    
    bio = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Student(id={self.id}, name='{self.full_name}', college='{self.college_name}')>"
