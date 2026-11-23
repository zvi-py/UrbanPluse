"""
Pydantic schemas for data validation and serialization.
"""
from app.schemas.student import (
    StudentBase,
    StudentCreate,
    StudentUpdate,
    StudentRead,
)
from app.schemas.matching import (
    SkillsUpdate,
    InterestsUpdate,
    StudentMatchItem,
    StudentMatchResponse,
)
from app.schemas.community import (
    CommunityBase,
    CommunityCreate,
    CommunityUpdate,
    CommunityRead,
    CommunityDetailRead,
    CommunityMemberRead,
    JoinCommunityRequest,
    CommunityRecommendation,
    CommunityRecommendationsResponse,
)
from app.schemas.recommendation import (
    PeerRecommendation,
    CommunitySmartRecommendation,
    StudentRecommendationFeed,
)
from app.schemas.opportunity import (
    OpportunityBase,
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityRead,
    BookmarkRequest,
    OpportunityRecommendation,
)

__all__ = [
    "StudentBase",
    "StudentCreate",
    "StudentUpdate",
    "StudentRead",
    "SkillsUpdate",
    "InterestsUpdate",
    "StudentMatchItem",
    "StudentMatchResponse",
    "CommunityBase",
    "CommunityCreate",
    "CommunityUpdate",
    "CommunityRead",
    "CommunityDetailRead",
    "CommunityMemberRead",
    "JoinCommunityRequest",
    "CommunityRecommendation",
    "CommunityRecommendationsResponse",
    "PeerRecommendation",
    "CommunitySmartRecommendation",
    "StudentRecommendationFeed",
    "OpportunityBase",
    "OpportunityCreate",
    "OpportunityUpdate",
    "OpportunityRead",
    "BookmarkRequest",
    "OpportunityRecommendation",
]
