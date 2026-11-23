from typing import List, Optional, Set
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.community import Community, CommunityMember
from app.models.student import Student
from app.schemas.community import (
    CommunityCreate,
    CommunityUpdate,
    CommunityRead,
    CommunityDetailRead,
    CommunityMemberRead,
    CommunityRecommendation,
    CommunityRecommendationsResponse,
)
from app.services.student_service import get_student_by_id


def get_community_by_id(db: Session, community_id: int) -> Community:
    """
    Fetch a community by ID.
    Raises 404 if the community is not found.
    """
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community with ID {community_id} was not found."
        )
    return community


def get_community_by_name(db: Session, name: str) -> Optional[Community]:
    """
    Fetch a community by name (case-insensitive).
    """
    return db.query(Community).filter(Community.name.ilike(name.strip())).first()


def create_community(db: Session, community_in: CommunityCreate) -> CommunityRead:
    """
    Creates a new community or study group.
    - Ensures creator student exists.
    - Ensures community name is unique.
    - Automatically adds creator as the 'admin' member.
    """
    # 1. Verify creator exists
    creator = get_student_by_id(db, student_id=community_in.created_by_student_id)

    # 2. Check for duplicate name
    existing = get_community_by_name(db, name=community_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A community with the name '{community_in.name}' already exists."
        )

    # 3. Clean topic tags
    cleaned_tags = list(dict.fromkeys(t.strip() for t in community_in.topic_tags if t.strip()))

    community = Community(
        name=community_in.name.strip(),
        description=community_in.description,
        category=community_in.category.strip(),
        topic_tags=cleaned_tags,
        created_by_student_id=creator.id
    )
    db.add(community)
    db.commit()
    db.refresh(community)

    # 4. Automatically add the creator as admin member
    admin_member = CommunityMember(
        community_id=community.id,
        student_id=creator.id,
        role="admin"
    )
    db.add(admin_member)
    db.commit()

    return CommunityRead(
        id=community.id,
        name=community.name,
        description=community.description,
        category=community.category,
        topic_tags=community.topic_tags,
        created_by_student_id=community.created_by_student_id,
        member_count=1,
        created_at=community.created_at,
        updated_at=community.updated_at
    )


def list_communities(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None
) -> List[CommunityRead]:
    """
    Lists communities with member counts, supporting category, tag, and keyword search filters.
    """
    query = db.query(Community)

    if category:
        query = query.filter(Community.category.ilike(f"%{category.strip()}%"))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Community.name.ilike(search_term)) | (Community.description.ilike(search_term))
        )

    communities = query.offset(skip).limit(limit).all()

    results: List[CommunityRead] = []
    target_tag = tag.strip().lower() if tag else None

    for comm in communities:
        # Filter by tag if requested
        if target_tag:
            group_tags = [t.lower() for t in (comm.topic_tags or [])]
            if not any(target_tag in t for t in group_tags):
                continue

        member_count = db.query(CommunityMember).filter(CommunityMember.community_id == comm.id).count()
        results.append(
            CommunityRead(
                id=comm.id,
                name=comm.name,
                description=comm.description,
                category=comm.category,
                topic_tags=comm.topic_tags,
                created_by_student_id=comm.created_by_student_id,
                member_count=member_count,
                created_at=comm.created_at,
                updated_at=comm.updated_at
            )
        )

    return results


def get_community_detail(db: Session, community_id: int) -> CommunityDetailRead:
    """
    Retrieves full details of a community including all members.
    """
    community = get_community_by_id(db, community_id=community_id)

    memberships = (
        db.query(CommunityMember, Student)
        .join(Student, CommunityMember.student_id == Student.id)
        .filter(CommunityMember.community_id == community.id)
        .all()
    )

    member_items = [
        CommunityMemberRead(
            student_id=student.id,
            full_name=student.full_name,
            department=student.department,
            college_name=student.college_name,
            role=member.role,
            joined_at=member.joined_at
        )
        for member, student in memberships
    ]

    return CommunityDetailRead(
        id=community.id,
        name=community.name,
        description=community.description,
        category=community.category,
        topic_tags=community.topic_tags,
        created_by_student_id=community.created_by_student_id,
        member_count=len(member_items),
        created_at=community.created_at,
        updated_at=community.updated_at,
        members=member_items
    )


def update_community(
    db: Session,
    community_id: int,
    requester_student_id: int,
    community_in: CommunityUpdate
) -> CommunityRead:
    """
    Allows the community creator to manage/update community details.
    Raises 403 Forbidden if requester is not the creator.
    """
    community = get_community_by_id(db, community_id=community_id)

    # Authorization check
    if community.created_by_student_id != requester_student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator of this community has permission to modify it."
        )

    update_data = community_in.model_dump(exclude_unset=True)

    # Check for name conflict if renaming
    if "name" in update_data and update_data["name"].strip() != community.name:
        existing = get_community_by_name(db, name=update_data["name"])
        if existing and existing.id != community.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A community with the name '{update_data['name']}' already exists."
            )
        update_data["name"] = update_data["name"].strip()

    if "topic_tags" in update_data and update_data["topic_tags"] is not None:
        update_data["topic_tags"] = list(dict.fromkeys(t.strip() for t in update_data["topic_tags"] if t.strip()))

    for field, value in update_data.items():
        setattr(community, field, value)

    db.commit()
    db.refresh(community)

    member_count = db.query(CommunityMember).filter(CommunityMember.community_id == community.id).count()

    return CommunityRead(
        id=community.id,
        name=community.name,
        description=community.description,
        category=community.category,
        topic_tags=community.topic_tags,
        created_by_student_id=community.created_by_student_id,
        member_count=member_count,
        created_at=community.created_at,
        updated_at=community.updated_at
    )


def delete_community(db: Session, community_id: int, requester_student_id: int) -> None:
    """
    Allows the creator to delete the community.
    Raises 403 Forbidden if requester is not the creator.
    """
    community = get_community_by_id(db, community_id=community_id)

    if community.created_by_student_id != requester_student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator of this community has permission to delete it."
        )

    db.delete(community)
    db.commit()


def join_community(db: Session, community_id: int, student_id: int) -> CommunityMemberRead:
    """
    Enrolls a student into a community or study group.
    Prevents duplicate joining.
    """
    community = get_community_by_id(db, community_id=community_id)
    student = get_student_by_id(db, student_id=student_id)

    # Check if already a member
    existing = (
        db.query(CommunityMember)
        .filter(
            CommunityMember.community_id == community.id,
            CommunityMember.student_id == student.id
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student '{student.full_name}' is already a member of '{community.name}'."
        )

    membership = CommunityMember(
        community_id=community.id,
        student_id=student.id,
        role="member"
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)

    return CommunityMemberRead(
        student_id=student.id,
        full_name=student.full_name,
        department=student.department,
        college_name=student.college_name,
        role=membership.role,
        joined_at=membership.joined_at
    )


def leave_community(db: Session, community_id: int, student_id: int) -> None:
    """
    Removes a student from a community.
    """
    get_community_by_id(db, community_id=community_id)
    get_student_by_id(db, student_id=student_id)

    membership = (
        db.query(CommunityMember)
        .filter(
            CommunityMember.community_id == community_id,
            CommunityMember.student_id == student_id
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student with ID {student_id} is not an enrolled member of community {community_id}."
        )

    db.delete(membership)
    db.commit()


def get_student_communities(db: Session, student_id: int) -> List[CommunityRead]:
    """
    Retrieves all communities a given student has joined.
    """
    get_student_by_id(db, student_id=student_id)

    memberships = db.query(CommunityMember).filter(CommunityMember.student_id == student_id).all()
    community_ids = [m.community_id for m in memberships]

    communities = db.query(Community).filter(Community.id.in_(community_ids)).all()

    results: List[CommunityRead] = []
    for comm in communities:
        count = db.query(CommunityMember).filter(CommunityMember.community_id == comm.id).count()
        results.append(
            CommunityRead(
                id=comm.id,
                name=comm.name,
                description=comm.description,
                category=comm.category,
                topic_tags=comm.topic_tags,
                created_by_student_id=comm.created_by_student_id,
                member_count=count,
                created_at=comm.created_at,
                updated_at=comm.updated_at
            )
        )
    return results


def recommend_communities_for_student(
    db: Session,
    student_id: int,
    limit: int = 10
) -> CommunityRecommendationsResponse:
    """
    Recommends relevant communities and study groups based on the student's skills and interests.

    Algorithm:
    1. Collects student's normalized interests and skills tags.
    2. Excludes communities the student has already joined.
    3. Calculates topic tag overlap and Jaccard relevance score.
    4. Ranks recommendations descending by relevance score.
    """
    student = get_student_by_id(db, student_id=student_id)

    # 1. Gather student's normalized tags
    student_tags_map = {}
    for i in (student.interests or []):
        if i.strip():
            student_tags_map[i.strip().lower()] = i.strip()
    for s in (student.skills or []):
        if s.strip():
            student_tags_map[s.strip().lower()] = s.strip()

    student_tags_set = set(student_tags_map.keys())

    # 2. Find communities the student has already joined
    joined_ids = {
        m.community_id
        for m in db.query(CommunityMember.community_id).filter(CommunityMember.student_id == student_id).all()
    }

    # Query all candidate communities not yet joined
    candidate_communities = db.query(Community).filter(~Community.id.in_(joined_ids) if joined_ids else True).all()

    recommendations: List[CommunityRecommendation] = []

    for comm in candidate_communities:
        comm_tags_map = {t.strip().lower(): t.strip() for t in (comm.topic_tags or []) if t.strip()}
        comm_tags_set = set(comm_tags_map.keys())

        if not comm_tags_set or not student_tags_set:
            continue

        intersection = student_tags_set.intersection(comm_tags_set)
        union = student_tags_set.union(comm_tags_set)

        if not intersection:
            continue

        # Jaccard relevance score
        score = len(intersection) / len(union)
        match_percentage = min(100, max(1, round(score * 100)))

        # Display matched tags in original casing
        matched_display_tags = [
            comm_tags_map.get(k, student_tags_map.get(k, k))
            for k in sorted(intersection)
        ]

        member_count = db.query(CommunityMember).filter(CommunityMember.community_id == comm.id).count()

        recommendations.append(
            CommunityRecommendation(
                community_id=comm.id,
                name=comm.name,
                category=comm.category,
                description=comm.description,
                topic_tags=comm.topic_tags,
                member_count=member_count,
                matched_tags=matched_display_tags,
                relevance_score=round(score, 4),
                match_percentage=match_percentage
            )
        )

    # Sort descending by relevance score, then by member count
    recommendations.sort(key=lambda r: (r.relevance_score, r.member_count), reverse=True)

    return CommunityRecommendationsResponse(
        student_id=student_id,
        total_recommendations=len(recommendations),
        recommendations=recommendations[:limit]
    )
