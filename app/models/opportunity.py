from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Opportunity(Base):
    """
    SQLAlchemy model representing workshops, hackathons, and opportunities in UrbanPulse.
    """
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(150), index=True, nullable=False)
    description = Column(Text, nullable=True)
    opportunity_type = Column(String(50), nullable=False)  # e.g., "Hackathon", "Workshop", "Tech Talk", "Internship"
    organization = Column(String(150), nullable=False)      # e.g., "UrbanPulse", "ACM Chapter", "Google DSC"
    location = Column(String(100), nullable=True)          # e.g., "Main Auditorium", "Virtual / Zoom"
    is_online = Column(Boolean, default=False, nullable=False)
    tags = Column(JSON, nullable=False, default=list)       # e.g., ["Python", "FastAPI", "AI", "Cloud"]
    event_date = Column(DateTime(timezone=True), nullable=True)
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    registration_link = Column(String(255), nullable=True)
    created_by_student_id = Column(Integer, ForeignKey("students.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    creator = relationship("Student", foreign_keys=[created_by_student_id])
    bookmarks = relationship("OpportunityBookmark", back_populates="opportunity", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Opportunity(id={self.id}, title='{self.title}', type='{self.opportunity_type}')>"


class OpportunityBookmark(Base):
    """
    Association model representing a student saving / bookmarking an opportunity.
    """
    __tablename__ = "opportunity_bookmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    bookmarked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("opportunity_id", "student_id", name="uq_opportunity_student_bookmark"),
    )

    opportunity = relationship("Opportunity", back_populates="bookmarks")
    student = relationship("Student")

    def __repr__(self):
        return f"<OpportunityBookmark(opp_id={self.opportunity_id}, student_id={self.student_id})>"

