from typing import List, Optional
from pydantic import BaseModel, Field


class SkillsUpdate(BaseModel):
    """
    Schema for updating a student's skills list.
    """
    skills: List[str] = Field(
        ...,
        description="List of skills",
        examples=[["Python", "FastAPI", "Machine Learning", "Docker"]]
    )


class InterestsUpdate(BaseModel):
    """
    Schema for updating a student's interests list.
    """
    interests: List[str] = Field(
        ...,
        description="List of academic and project interests",
        examples=[["Artificial Intelligence", "Autonomous Systems", "Hackathons"]]
    )


class StudentMatchItem(BaseModel):
    """
    Matched peer details returned to the student.
    Contains only non-sensitive academic and community-relevant profile data.
    """
    student_id: int
    full_name: str
    department: str
    college_name: str
    year_of_study: int
    bio: Optional[str] = None
    common_interests: List[str] = Field(
        default_factory=list,
        description="List of interests shared between both students"
    )
    common_skills: List[str] = Field(
        default_factory=list,
        description="List of skills shared between both students"
    )
    matching_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Normalized similarity score from 0.0 to 1.0"
    )
    match_percentage: int = Field(
        ...,
        ge=0,
        le=100,
        description="Similarity represented as an easily interpretable percentage (0% to 100%)"
    )


class StudentMatchResponse(BaseModel):
    """
    Paginated matching response.
    """
    target_student_id: int
    total_matches: int
    skip: int
    limit: int
    matches: List[StudentMatchItem]
