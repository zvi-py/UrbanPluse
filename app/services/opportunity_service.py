from typing import List, Optional, Set
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.opportunity import Opportunity, OpportunityBookmark
from app.models.student import Student
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityRead,
    OpportunityRecommendation,
)
from app.services.student_service import get_student_by_id


def get_opportunity_by_id(db: Session, opp_id: int) -> Opportunity:
    """
    Fetch an opportunity by its ID.
    Raises 404 if not found.
    """
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Opportunity with ID {opp_id} was not found."
        )
    return opp


def _to_opportunity_read(db: Session, opp: Opportunity) -> OpportunityRead:
    """Helper to convert an Opportunity model to OpportunityRead with live bookmark count."""
    count = db.query(OpportunityBookmark).filter(OpportunityBookmark.opportunity_id == opp.id).count()
    return OpportunityRead(
        id=opp.id,
        title=opp.title,
        description=opp.description,
        opportunity_type=opp.opportunity_type,
        organization=opp.organization,
        location=opp.location,
        is_online=opp.is_online,
        tags=opp.tags,
        event_date=opp.event_date,
        application_deadline=opp.application_deadline,
        registration_link=opp.registration_link,
        created_by_student_id=opp.created_by_student_id,
        bookmark_count=count,
        created_at=opp.created_at,
        updated_at=opp.updated_at
    )


def create_opportunity(db: Session, opp_in: OpportunityCreate) -> OpportunityRead:
    """
    Publish a new workshop, hackathon, or internship opportunity.
    """
    if opp_in.created_by_student_id is not None:
        get_student_by_id(db, student_id=opp_in.created_by_student_id)

    cleaned_tags = list(dict.fromkeys(t.strip() for t in opp_in.tags if t.strip()))

    opp = Opportunity(
        title=opp_in.title.strip(),
        description=opp_in.description,
        opportunity_type=opp_in.opportunity_type.strip(),
        organization=opp_in.organization.strip(),
        location=opp_in.location,
        is_online=opp_in.is_online,
        tags=cleaned_tags,
        event_date=opp_in.event_date,
        application_deadline=opp_in.application_deadline,
        registration_link=opp_in.registration_link,
        created_by_student_id=opp_in.created_by_student_id
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)

    return _to_opportunity_read(db, opp)


def list_opportunities(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    opportunity_type: Optional[str] = None,
    is_online: Optional[bool] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    upcoming_only: bool = False
) -> List[OpportunityRead]:
    """
    Browse and search opportunities with multiple filters.
    """
    query = db.query(Opportunity)

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type.ilike(f"%{opportunity_type.strip()}%"))

    if is_online is not None:
        query = query.filter(Opportunity.is_online == is_online)

    if upcoming_only:
        now = datetime.now()
        query = query.filter(
            (Opportunity.event_date >= now) | (Opportunity.application_deadline >= now)
        )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Opportunity.title.ilike(search_term)) |
            (Opportunity.description.ilike(search_term)) |
            (Opportunity.organization.ilike(search_term))
        )

    opportunities = query.order_by(Opportunity.created_at.desc()).offset(skip).limit(limit).all()

    results: List[OpportunityRead] = []
    target_tag = tag.strip().lower() if tag else None

    for opp in opportunities:
        if target_tag:
            opp_tags = [t.lower() for t in (opp.tags or [])]
            if not any(target_tag in t for t in opp_tags):
                continue

        results.append(_to_opportunity_read(db, opp))

    return results


def update_opportunity(db: Session, opp_id: int, opp_in: OpportunityUpdate) -> OpportunityRead:
    """
    Update details of an opportunity.
    """
    opp = get_opportunity_by_id(db, opp_id=opp_id)
    update_data = opp_in.model_dump(exclude_unset=True)

    if "tags" in update_data and update_data["tags"] is not None:
        update_data["tags"] = list(dict.fromkeys(t.strip() for t in update_data["tags"] if t.strip()))

    for field, value in update_data.items():
        setattr(opp, field, value)

    db.commit()
    db.refresh(opp)
    return _to_opportunity_read(db, opp)


def delete_opportunity(db: Session, opp_id: int) -> None:
    """
    Delete an opportunity.
    """
    opp = get_opportunity_by_id(db, opp_id=opp_id)
    db.delete(opp)
    db.commit()


def bookmark_opportunity(db: Session, opp_id: int, student_id: int) -> None:
    """
    Save / bookmark an opportunity for a student.
    Prevents duplicate bookmarking.
    """
    get_opportunity_by_id(db, opp_id=opp_id)
    get_student_by_id(db, student_id=student_id)

    existing = db.query(OpportunityBookmark).filter(
        OpportunityBookmark.opportunity_id == opp_id,
        OpportunityBookmark.student_id == student_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student has already bookmarked this opportunity."
        )

    bookmark = OpportunityBookmark(
        opportunity_id=opp_id,
        student_id=student_id
    )
    db.add(bookmark)
    db.commit()


def unbookmark_opportunity(db: Session, opp_id: int, student_id: int) -> None:
    """
    Remove a bookmark.
    """
    get_opportunity_by_id(db, opp_id=opp_id)
    get_student_by_id(db, student_id=student_id)

    bookmark = db.query(OpportunityBookmark).filter(
        OpportunityBookmark.opportunity_id == opp_id,
        OpportunityBookmark.student_id == student_id
    ).first()

    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student has not bookmarked this opportunity."
        )

    db.delete(bookmark)
    db.commit()


def get_student_bookmarks(db: Session, student_id: int) -> List[OpportunityRead]:
    """
    Fetch all opportunities saved by a student.
    """
    get_student_by_id(db, student_id=student_id)

    bookmarks = db.query(OpportunityBookmark).filter(OpportunityBookmark.student_id == student_id).all()
    opp_ids = [b.opportunity_id for b in bookmarks]

    opportunities = db.query(Opportunity).filter(Opportunity.id.in_(opp_ids)).all()
    return [_to_opportunity_read(db, opp) for opp in opportunities]


def recommend_opportunities_for_student(
    db: Session,
    student_id: int,
    limit: int = 10
) -> List[OpportunityRecommendation]:
    """
    Recommends relevant workshops, hackathons, and opportunities based on the
    student's skills and interests.
    """
    student = get_student_by_id(db, student_id=student_id)

    student_tags_map = {}
    for i in (student.interests or []):
        if i.strip():
            student_tags_map[i.strip().lower()] = i.strip()
    for s in (student.skills or []):
        if s.strip():
            student_tags_map[s.strip().lower()] = s.strip()

    student_tags_set = set(student_tags_map.keys())

    opportunities = db.query(Opportunity).all()
    recommendations: List[OpportunityRecommendation] = []

    for opp in opportunities:
        opp_tags_map = {t.strip().lower(): t.strip() for t in (opp.tags or []) if t.strip()}
        opp_tags_set = set(opp_tags_map.keys())

        if not opp_tags_set or not student_tags_set:
            continue

        intersection = student_tags_set.intersection(opp_tags_set)
        union = student_tags_set.union(opp_tags_set)

        if not intersection:
            continue

        score = len(intersection) / len(union)
        match_percentage = min(100, max(1, round(score * 100)))

        matched_display_tags = [
            opp_tags_map.get(k, student_tags_map.get(k, k))
            for k in sorted(intersection)
        ]

        reason = f"Matches your skills & interests in {', '.join(matched_display_tags[:3])}"

        opp_read = _to_opportunity_read(db, opp)

        recommendations.append(
            OpportunityRecommendation(
                opportunity=opp_read,
                matched_tags=matched_display_tags,
                relevance_score=round(score, 4),
                match_percentage=match_percentage,
                recommendation_reason=reason
            )
        )

    recommendations.sort(key=lambda r: r.relevance_score, reverse=True)
    return recommendations[:limit]

