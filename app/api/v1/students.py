from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.student import StudentCreate, StudentRead, StudentUpdate
from app.schemas.matching import SkillsUpdate, InterestsUpdate, StudentMatchResponse
from app.schemas.community import CommunityRead
from app.schemas.opportunity import OpportunityRead
from app.services import student_service, matching_service, community_service, opportunity_service

router = APIRouter()


@router.post(
    "/",
    response_model=StudentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student",
    description="Registers a new student profile in the UrbanPulse database with skills and interests."
)
def register_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db)
):
    """
    Register a student.
    - Validates name, email, college, department, year, skills, and interests.
    - Prevents duplicate registration if the email already exists.
    """
    return student_service.create_student(db=db, student_in=student_in)


@router.get(
    "/",
    response_model=List[StudentRead],
    status_code=status.HTTP_200_OK,
    summary="View all registered students",
    description="Fetches a list of all registered student profiles with optional pagination."
)
def list_students(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Max number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all students registered in the platform.
    """
    return student_service.get_all_students(db=db, skip=skip, limit=limit)


@router.get(
    "/{student_id}",
    response_model=StudentRead,
    status_code=status.HTTP_200_OK,
    summary="View an individual student by ID",
    description="Fetches the full profile of a student using their unique ID."
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve an individual student by their ID.
    Returns 404 if the student does not exist.
    """
    return student_service.get_student_by_id(db=db, student_id=student_id)


@router.put(
    "/{student_id}",
    response_model=StudentRead,
    status_code=status.HTTP_200_OK,
    summary="Update an existing student profile",
    description="Updates one or more profile fields for a student by their ID."
)
def update_student(
    student_id: int,
    student_in: StudentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a student's general profile information.
    """
    return student_service.update_student(db=db, student_id=student_id, student_in=student_in)


@router.put(
    "/{student_id}/skills",
    response_model=StudentRead,
    status_code=status.HTTP_200_OK,
    summary="Manage student skills",
    description="Updates and manages the technical and soft skills of a student."
)
def manage_skills(
    student_id: int,
    payload: SkillsUpdate,
    db: Session = Depends(get_db)
):
    """
    Update skills for a student.
    Cleans leading/trailing whitespace and removes duplicates automatically.
    """
    return student_service.update_student_skills(db=db, student_id=student_id, new_skills=payload.skills)


@router.put(
    "/{student_id}/interests",
    response_model=StudentRead,
    status_code=status.HTTP_200_OK,
    summary="Manage student interests",
    description="Updates and manages academic and project interests of a student."
)
def manage_interests(
    student_id: int,
    payload: InterestsUpdate,
    db: Session = Depends(get_db)
):
    """
    Update interests for a student.
    Cleans leading/trailing whitespace and removes duplicates automatically.
    """
    return student_service.update_student_interests(db=db, student_id=student_id, new_interests=payload.interests)


@router.get(
    "/{student_id}/matches",
    response_model=StudentMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Find matching students",
    description="Compares and ranks other students based on shared interests and skills using Jaccard similarity."
)
def get_matching_students(
    student_id: int,
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(10, ge=1, le=50, description="Max matches per page"),
    interest_weight: Optional[float] = Query(None, ge=0.0, le=1.0, description="Optional custom weight for interests (default: 0.7)"),
    skill_weight: Optional[float] = Query(None, ge=0.0, le=1.0, description="Optional custom weight for skills (default: 0.3)"),
    db: Session = Depends(get_db)
):
    """
    Calculate and return matches for a student.
    """
    return matching_service.find_matching_students(
        db=db,
        student_id=student_id,
        skip=skip,
        limit=limit,
        interest_weight=interest_weight,
        skill_weight=skill_weight
    )


@router.get(
    "/{student_id}/communities",
    response_model=List[CommunityRead],
    status_code=status.HTTP_200_OK,
    summary="View student's joined communities",
    description="Fetches all study groups and communities the student is enrolled in."
)
def get_student_communities(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    List all communities and study groups joined by the student.
    """
    return community_service.get_student_communities(db=db, student_id=student_id)


@router.get(
    "/{student_id}/bookmarks",
    response_model=List[OpportunityRead],
    status_code=status.HTTP_200_OK,
    summary="View student's bookmarked opportunities",
    description="Fetches all workshops, hackathons, and opportunities saved by the student."
)
def get_student_bookmarks(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    List opportunities bookmarked by the student.
    """
    return opportunity_service.get_student_bookmarks(db=db, student_id=student_id)


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a student profile",
    description="Removes a student profile from the database."
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a student by ID.
    """
    student_service.delete_student(db=db, student_id=student_id)
    return None
