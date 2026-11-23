from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.community import (
    CommunityCreate,
    CommunityUpdate,
    CommunityRead,
    CommunityDetailRead,
    CommunityMemberRead,
    JoinCommunityRequest,
    CommunityRecommendationsResponse,
)
from app.services import community_service

router = APIRouter()


@router.post(
    "/",
    response_model=CommunityRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new study group or community",
    description="Creates a new community with name, description, category, topic tags, and automatically adds the creator as admin."
)
def create_community(
    community_in: CommunityCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new community:
    - Validates creator student exists.
    - Ensures community name is unique.
    - Assigns creator as admin member.
    """
    return community_service.create_community(db=db, community_in=community_in)


@router.get(
    "/",
    response_model=List[CommunityRead],
    status_code=status.HTTP_200_OK,
    summary="Browse and search communities",
    description="Fetches communities supporting keyword search, category filter, and topic tag filter."
)
def list_communities(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=100, description="Limit for pagination"),
    search: Optional[str] = Query(None, description="Search keyword in name or description"),
    category: Optional[str] = Query(None, description="Filter by category (e.g. 'Study Group', 'Project Team')"),
    tag: Optional[str] = Query(None, description="Filter by topic tag (e.g. 'Python', 'AI')"),
    db: Session = Depends(get_db)
):
    """
    Browse and search communities.
    """
    return community_service.list_communities(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        tag=tag,
        search=search
    )


@router.get(
    "/recommendations/{student_id}",
    response_model=CommunityRecommendationsResponse,
    status_code=status.HTTP_200_OK,
    summary="Recommend communities for a student",
    description="Recommends relevant communities and study groups based on overlap with the student's skills and interests."
)
def get_community_recommendations(
    student_id: int,
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recommendations to return"),
    db: Session = Depends(get_db)
):
    """
    Calculate community recommendations for a student:
    - Analyzes student's interests and skills.
    - Excludes communities the student has already joined.
    - Ranks communities by relevance score.
    """
    return community_service.recommend_communities_for_student(
        db=db,
        student_id=student_id,
        limit=limit
    )


@router.get(
    "/{community_id}",
    response_model=CommunityDetailRead,
    status_code=status.HTTP_200_OK,
    summary="Get community details & member roster",
    description="Retrieves full details of a community including the full list of enrolled members."
)
def get_community_detail(
    community_id: int,
    db: Session = Depends(get_db)
):
    """
    View community details and member list.
    """
    return community_service.get_community_detail(db=db, community_id=community_id)


@router.put(
    "/{community_id}",
    response_model=CommunityRead,
    status_code=status.HTTP_200_OK,
    summary="Update community details (Creator only)",
    description="Allows the creator student to update the community name, description, category, or tags."
)
def update_community(
    community_id: int,
    community_in: CommunityUpdate,
    requester_student_id: int = Query(..., description="ID of the student making the request (must be the creator)"),
    db: Session = Depends(get_db)
):
    """
    Manage/update a community.
    Returns 403 Forbidden if requester is not the community creator.
    """
    return community_service.update_community(
        db=db,
        community_id=community_id,
        requester_student_id=requester_student_id,
        community_in=community_in
    )


@router.delete(
    "/{community_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a community (Creator only)",
    description="Allows the creator student to delete the community."
)
def delete_community(
    community_id: int,
    requester_student_id: int = Query(..., description="ID of the student making the request (must be the creator)"),
    db: Session = Depends(get_db)
):
    """
    Delete a community.
    Returns 403 Forbidden if requester is not the community creator.
    """
    community_service.delete_community(
        db=db,
        community_id=community_id,
        requester_student_id=requester_student_id
    )
    return None


@router.post(
    "/{community_id}/join",
    response_model=CommunityMemberRead,
    status_code=status.HTTP_201_CREATED,
    summary="Join a community",
    description="Enrolls a student into a study group or community. Prevents duplicate joining."
)
def join_community(
    community_id: int,
    payload: JoinCommunityRequest,
    db: Session = Depends(get_db)
):
    """
    Enroll a student into a community:
    - Validates both community and student exist.
    - Prevents duplicate joining.
    """
    return community_service.join_community(
        db=db,
        community_id=community_id,
        student_id=payload.student_id
    )


@router.post(
    "/{community_id}/leave",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Leave a community",
    description="Removes a student from a study group or community."
)
def leave_community(
    community_id: int,
    payload: JoinCommunityRequest,
    db: Session = Depends(get_db)
):
    """
    Remove a student from a community.
    """
    community_service.leave_community(
        db=db,
        community_id=community_id,
        student_id=payload.student_id
    )
    return None
