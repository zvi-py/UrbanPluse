from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class OpportunityBase(BaseModel):
    """
    Shared attributes for opportunities (hackathons, workshops, internships).
    """
    title: str = Field(
        ...,
        min_length=3,
        max_length=150,
        description="Title of the workshop, hackathon, or opportunity",
        examples=["UrbanPulse Smart Cities Hackathon 2026"]
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Detailed description, rules, prizes, or agenda",
        examples=["A 48-hour campus hackathon solving urban mobility and sustainability challenges."]
    )
    opportunity_type: str = Field(
        ...,
        max_length=50,
        description="Type of event (Hackathon, Workshop, Tech Talk, Internship, Seminar)",
        examples=["Hackathon"]
    )
    organization: str = Field(
        ...,
        max_length=150,
        description="Host college, student club, or sponsoring organization",
        examples=["UrbanPulse Developer Club"]
    )
    location: Optional[str] = Field(
        None,
        max_length=100,
        description="Physical venue or virtual platform link",
        examples=["Innovation Hub, Hall A"]
    )
    is_online: bool = Field(
        default=False,
        description="Whether the opportunity is held virtually"
    )
    tags: List[str] = Field(
        default_factory=list,
        description="Relevant skill or topic tags (e.g. Python, AI, IoT, Web3)",
        examples=[["Python", "Machine Learning", "Smart Campus", "IoT"]]
    )
    event_date: Optional[datetime] = Field(
        None,
        description="Date and time when the event takes place",
        examples=["2026-11-20T09:00:00Z"]
    )
    application_deadline: Optional[datetime] = Field(
        None,
        description="Last date to apply or register",
        examples=["2026-11-18T23:59:59Z"]
    )
    registration_link: Optional[str] = Field(
        None,
        max_length=255,
        description="URL for sign-up or official information",
        examples=["https://urbanpulse.college.edu/hackathon-2026"]
    )


class OpportunityCreate(OpportunityBase):
    """
    Schema for publishing a new opportunity.
    """
    created_by_student_id: Optional[int] = Field(
        None,
        description="Optional ID of the student organizer who posted it",
        examples=[1]
    )


class OpportunityUpdate(BaseModel):
    """
    Schema for updating an existing opportunity.
    """
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=2000)
    opportunity_type: Optional[str] = Field(None, max_length=50)
    organization: Optional[str] = Field(None, max_length=150)
    location: Optional[str] = Field(None, max_length=100)
    is_online: Optional[bool] = None
    tags: Optional[List[str]] = None
    event_date: Optional[datetime] = None
    application_deadline: Optional[datetime] = None
    registration_link: Optional[str] = None


class OpportunityRead(OpportunityBase):
    """
    Response schema for opportunities with bookmark count and timestamps.
    """
    id: int
    created_by_student_id: Optional[int] = None
    bookmark_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BookmarkRequest(BaseModel):
    """
    Payload for a student saving or bookmarking an opportunity.
    """
    student_id: int = Field(..., description="ID of the student", examples=[1])


class OpportunityRecommendation(BaseModel):
    """
    Personalized opportunity recommendation based on student skills and interests.
    """
    opportunity: OpportunityRead
    matched_tags: List[str]
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    match_percentage: int = Field(..., ge=0, le=100)
    recommendation_reason: str

