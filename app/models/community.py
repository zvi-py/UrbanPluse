from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Community(Base):
    """
    SQLAlchemy model representing a study group or student community in UrbanPulse.
    """
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="Study Group")  # e.g., Study Group, Project Team, Club
    topic_tags = Column(JSON, nullable=False, default=list)  # e.g., ["Python", "AI", "Algorithms"]
    created_by_student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    creator = relationship("Student", foreign_keys=[created_by_student_id])
    memberships = relationship("CommunityMember", back_populates="community", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Community(id={self.id}, name='{self.name}', category='{self.category}')>"


class CommunityMember(Base):
    """
    Association model representing a student's membership in a study group or community.
    """
    __tablename__ = "community_members"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False, default="member")  # e.g., "admin", "member"
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Ensure a student cannot join the same community twice
    __table_args__ = (
        UniqueConstraint("community_id", "student_id", name="uq_community_student"),
    )

    # Relationships
    community = relationship("Community", back_populates="memberships")
    student = relationship("Student")

    def __repr__(self):
        return f"<CommunityMember(community_id={self.community_id}, student_id={self.student_id}, role='{self.role}')>"
