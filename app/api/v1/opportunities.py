from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityRead,
    BookmarkRequest,
    OpportunityRecommendation,
)
from app.services import opportunity_service

router = APIRouter()


@router.post(
    "/",
    response_model=OpportunityRead,
    status_code=status.HTTP_201_CREATED,
    summary="Publish a new opportunity",
    description="Publishes a workshop, hackathon, tech talk, or internship opportunity."
)
def create_opportunity(
    opp_in: OpportunityCreate,
    db: Session = Depends(get_db)
):
    """
    Publish an event or opportunity.
    """
    return opportunity_service.create_opportunity(db=db, opp_in=opp_in)


@router.get(
    "/",
    response_model=List[OpportunityRead],
    status_code=status.HTTP_200_OK,
    summary="Browse and search opportunities",
    description="Fetches opportunities with support for search, type, online mode, topic tag, and upcoming-only filters."
)
def list_opportunities(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=100, description="Limit for pagination"),
    search: Optional[str] = Query(None, description="Search keyword in title, organization, or description"),
    opportunity_type: Optional[str] = Query(None, description="Filter by type (e.g. 'Hackathon', 'Workshop')"),
    is_online: Optional[bool] = Query(None, description="Filter by online/virtual events"),
    tag: Optional[str] = Query(None, description="Filter by tag (e.g. 'Python', 'AI')"),
    upcoming_only: bool = Query(False, description="Filter only events in the future"),
    db: Session = Depends(get_db)
):
    """
    Browse opportunities.
    """
    return opportunity_service.list_opportunities(
        db=db,
        skip=skip,
        limit=limit,
        opportunity_type=opportunity_type,
        is_online=is_online,
        tag=tag,
        search=search,
        upcoming_only=upcoming_only
    )


@router.get(
    "/recommendations/{student_id}",
    response_model=List[OpportunityRecommendation],
    status_code=status.HTTP_200_OK,
    summary="Discover opportunities for a student",
    description="Recommends relevant hackathons, workshops, and opportunities matching a student's skills and interests."
)
def get_opportunity_recommendations(
    student_id: int,
    limit: int = Query(10, ge=1, le=50, description="Maximum recommendations to return"),
    db: Session = Depends(get_db)
):
    """
    Recommend opportunities based on student's profile.
    """
    return opportunity_service.recommend_opportunities_for_student(
        db=db,
        student_id=student_id,
        limit=limit
    )


@router.get(
    "/{opportunity_id}",
    response_model=OpportunityRead,
    status_code=status.HTTP_200_OK,
    summary="Get opportunity details",
    description="Fetches full details of an opportunity including live bookmark count."
)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db)
):
    """
    Get opportunity by ID.
    """
    opp = opportunity_service.get_opportunity_by_id(db=db, opp_id=opportunity_id)
    return opportunity_service._to_opportunity_read(db=db, opp=opp)


@router.put(
    "/{opportunity_id}",
    response_model=OpportunityRead,
    status_code=status.HTTP_200_OK,
    summary="Update an opportunity",
    description="Updates one or more fields of an opportunity."
)
def update_opportunity(
    opportunity_id: int,
    opp_in: OpportunityUpdate,
    db: Session = Depends(get_db)
):
    """
    Update opportunity details.
    """
    return opportunity_service.update_opportunity(
        db=db,
        opp_id=opportunity_id,
        opp_in=opp_in
    )


@router.delete(
    "/{opportunity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an opportunity",
    description="Deletes an opportunity from the system."
)
def delete_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete opportunity.
    """
    opportunity_service.delete_opportunity(db=db, opp_id=opportunity_id)
    return None


@router.post(
    "/{opportunity_id}/bookmark",
    status_code=status.HTTP_201_CREATED,
    summary="Bookmark an opportunity",
    description="Saves an opportunity for a student."
)
def bookmark_opportunity(
    opportunity_id: int,
    payload: BookmarkRequest,
    db: Session = Depends(get_db)
):
    """
    Save / bookmark an opportunity.
    """
    opportunity_service.bookmark_opportunity(
        db=db,
        opp_id=opportunity_id,
        student_id=payload.student_id
    )
    return {"message": "Opportunity successfully bookmarked."}


@router.post(
    "/{opportunity_id}/unbookmark",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a bookmark",
    description="Removes an opportunity from a student's bookmarks."
)
def unbookmark_opportunity(
    opportunity_id: int,
    payload: BookmarkRequest,
    db: Session = Depends(get_db)
):
    """
    Remove opportunity bookmark.
    """
    opportunity_service.unbookmark_opportunity(
        db=db,
        opp_id=opportunity_id,
        student_id=payload.student_id
    )
    return None

