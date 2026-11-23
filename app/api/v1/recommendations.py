from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.recommendation import (
    PeerRecommendation,
    CommunitySmartRecommendation,
    StudentRecommendationFeed,
)
from app.services import recommendation_service

router = APIRouter()


@router.get(
    "/feed/{student_id}",
    response_model=StudentRecommendationFeed,
    status_code=status.HTTP_200_OK,
    summary="Get unified recommendation feed",
    description="Returns a personalized dashboard feed with both top peer recommendations and top community recommendations."
)
def get_recommendation_feed(
    student_id: int,
    peer_limit: int = Query(5, ge=1, le=20, description="Max peers to return"),
    community_limit: int = Query(5, ge=1, le=20, description="Max communities to return"),
    db: Session = Depends(get_db)
):
    """
    Unified smart recommendation feed for student dashboard views.
    """
    return recommendation_service.get_unified_recommendation_feed(
        db=db,
        student_id=student_id,
        peer_limit=peer_limit,
        community_limit=community_limit
    )


@router.get(
    "/peers/{student_id}",
    response_model=List[PeerRecommendation],
    status_code=status.HTTP_200_OK,
    summary="Multi-factor peer recommendations",
    description="Recommends peers by combining interest overlap, skill complementarity, shared community memberships, and academic affiliation."
)
def get_peer_recommendations(
    student_id: int,
    limit: int = Query(10, ge=1, le=50, description="Max recommendations to return"),
    min_score: float = Query(0.02, ge=0.0, le=1.0, description="Minimum score threshold"),
    db: Session = Depends(get_db)
):
    """
    Detailed peer recommendations with explainable reasons.
    """
    return recommendation_service.get_advanced_peer_recommendations(
        db=db,
        student_id=student_id,
        limit=limit,
        min_score=min_score
    )


@router.get(
    "/communities/{student_id}",
    response_model=List[CommunitySmartRecommendation],
    status_code=status.HTTP_200_OK,
    summary="Smart community recommendations",
    description="Recommends unjoined study groups and communities based on topic overlap and peer network presence."
)
def get_community_recommendations(
    student_id: int,
    limit: int = Query(10, ge=1, le=50, description="Max communities to return"),
    db: Session = Depends(get_db)
):
    """
    Smart community recommendations with social proof signals.
    """
    return recommendation_service.get_advanced_community_recommendations(
        db=db,
        student_id=student_id,
        limit=limit
    )

