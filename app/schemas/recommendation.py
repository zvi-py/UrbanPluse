from typing import List, Optional
from pydantic import BaseModel, Field


class PeerRecommendation(BaseModel):
    """
    Multi-factor peer recommendation with explainable reasons.
    """
    student_id: int
    full_name: str
    department: str
    college_name: str
    year_of_study: int
    bio: Optional[str] = None
    common_interests: List[str] = Field(default_factory=list)
    common_skills: List[str] = Field(default_factory=list)
    shared_communities: List[str] = Field(
        default_factory=list,
        description="Names of communities both students belong to"
    )
    match_reasons: List[str] = Field(
        default_factory=list,
        description="Human-readable reasons explaining why this peer is recommended"
    )
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    match_percentage: int = Field(..., ge=0, le=100)


class CommunitySmartRecommendation(BaseModel):
    """
    Context-aware community recommendation incorporating tag overlap and peer presence.
    """
    community_id: int
    name: str
    category: str
    description: Optional[str] = None
    topic_tags: List[str]
    member_count: int
    matched_tags: List[str] = Field(default_factory=list)
    peers_in_community: List[str] = Field(
        default_factory=list,
        description="Names of your matched peers who are members of this group"
    )
    recommendation_reasons: List[str] = Field(
        default_factory=list,
        description="Human-readable explanation for the recommendation"
    )
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    match_percentage: int = Field(..., ge=0, le=100)


class StudentRecommendationFeed(BaseModel):
    """
    Unified smart recommendation feed for student dashboards.
    """
    student_id: int
    recommended_peers: List[PeerRecommendation]
    recommended_communities: List[CommunitySmartRecommendation]

