from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class CommunityBase(BaseModel):
    """
    Shared attributes for study groups and communities.
    """
    name: str = Field(
        ...,
        min_length=3,
        max_length=120,
        description="Name of the study group or community",
        examples=["AI & Machine Learning Innovators"]
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Description of group goals, meeting times, or project focus",
        examples=["Weekly study group discussing deep learning papers and working on open source projects."]
    )
    category: str = Field(
        default="Study Group",
        max_length=50,
        description="Type of community (e.g. Study Group, Project Team, Club, Hackathon Squad)",
        examples=["Study Group"]
    )
    topic_tags: List[str] = Field(
        default_factory=list,
        description="Tags or subject areas the group is centered around",
        examples=[["Machine Learning", "Python", "Neural Networks"]]
    )


class CommunityCreate(CommunityBase):
    """
    Schema for creating a new community or study group.
    Requires the ID of the student who creates it.
    """
    created_by_student_id: int = Field(
        ...,
        description="ID of the student creating this community",
        examples=[1]
    )


class CommunityUpdate(BaseModel):
    """
    Schema for updating community details by the creator.
    """
    name: Optional[str] = Field(None, min_length=3, max_length=120, examples=["AI & ML Research Group"])
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, max_length=50)
    topic_tags: Optional[List[str]] = None


class CommunityMemberRead(BaseModel):
    """
    Schema representing a member in a community roster.
    """
    student_id: int
    full_name: str
    department: str
    college_name: str
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommunityRead(CommunityBase):
    """
    Summary view of a community with member count.
    """
    id: int
    created_by_student_id: int
    member_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CommunityDetailRead(CommunityRead):
    """
    Detailed view of a community including the full list of members.
    """
    members: List[CommunityMemberRead] = Field(default_factory=list)


class JoinCommunityRequest(BaseModel):
    """
    Payload for a student requesting to join or leave a community.
    """
    student_id: int = Field(..., description="ID of the student joining or leaving", examples=[2])


class CommunityRecommendation(BaseModel):
    """
    Recommended community for a student based on interest & skill overlap.
    """
    community_id: int
    name: str
    category: str
    description: Optional[str] = None
    topic_tags: List[str]
    member_count: int
    matched_tags: List[str] = Field(
        default_factory=list,
        description="Tags matching the student's skills or interests"
    )
    relevance_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Relevance score (0.0 to 1.0)"
    )
    match_percentage: int = Field(
        ...,
        ge=0,
        le=100,
        description="Match percentage (0% to 100%)"
    )


class CommunityRecommendationsResponse(BaseModel):
    """
    Response model for community recommendations.
    """
    student_id: int
    total_recommendations: int
    recommendations: List[CommunityRecommendation]
