from typing import List, Set, Dict, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.community import Community, CommunityMember
from app.schemas.recommendation import (
    PeerRecommendation,
    CommunitySmartRecommendation,
    StudentRecommendationFeed,
)
from app.services.student_service import get_student_by_id


def _compute_jaccard(set_a: Set[str], set_b: Set[str]) -> Tuple[float, Set[str]]:
    """Calculates Jaccard similarity and returns (score, intersection)."""
    if not set_a or not set_b:
        return 0.0, set()
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    if not union:
        return 0.0, set()
    return len(intersection) / len(union), intersection


def get_advanced_peer_recommendations(
    db: Session,
    student_id: int,
    limit: int = 10,
    min_score: float = 0.02
) -> List[PeerRecommendation]:
    """
    Multi-factor peer recommendation engine:
    1. Shared Interests (45% weight)
    2. Shared Skills (25% weight)
    3. Shared Communities & Study Groups (20% weight)
    4. Academic Affiliation: same department / college (10% weight)
    Generates explainable, human-readable match reasons.
    """
    target = get_student_by_id(db, student_id=student_id)

    # 1. Target tags
    target_interests_map = {i.strip().lower(): i.strip() for i in (target.interests or []) if i.strip()}
    target_skills_map = {s.strip().lower(): s.strip() for s in (target.skills or []) if s.strip()}
    target_interests_set = set(target_interests_map.keys())
    target_skills_set = set(target_skills_map.keys())

    # 2. Target communities
    target_comm_memberships = db.query(CommunityMember.community_id).filter(CommunityMember.student_id == student_id).all()
    target_comm_ids = {m.community_id for m in target_comm_memberships}

    candidates = db.query(Student).filter(Student.id != student_id).all()
    recommendations: List[PeerRecommendation] = []

    for candidate in candidates:
        candidate_interests_map = {i.strip().lower(): i.strip() for i in (candidate.interests or []) if i.strip()}
        candidate_skills_map = {s.strip().lower(): s.strip() for s in (candidate.skills or []) if s.strip()}
        candidate_interests_set = set(candidate_interests_map.keys())
        candidate_skills_set = set(candidate_skills_map.keys())

        # Calculate tag similarities
        j_interest, common_int_keys = _compute_jaccard(target_interests_set, candidate_interests_set)
        j_skill, common_skill_keys = _compute_jaccard(target_skills_set, candidate_skills_set)

        # Calculate shared communities
        candidate_comm_memberships = db.query(CommunityMember.community_id).filter(CommunityMember.student_id == candidate.id).all()
        candidate_comm_ids = {m.community_id for m in candidate_comm_memberships}

        shared_comm_ids = target_comm_ids.intersection(candidate_comm_ids)
        shared_comm_names = []
        if shared_comm_ids:
            comms = db.query(Community.name).filter(Community.id.in_(shared_comm_ids)).all()
            shared_comm_names = [c.name for c in comms]

        comm_score = len(shared_comm_ids) / max(1, len(target_comm_ids.union(candidate_comm_ids))) if (target_comm_ids or candidate_comm_ids) else 0.0

        # Academic affiliation score
        academic_score = 0.0
        reasons: List[str] = []

        if target.department and candidate.department and target.department.lower() == candidate.department.lower():
            academic_score += 0.6
            reasons.append(f"Same department: {candidate.department}")
        if target.college_name and candidate.college_name and target.college_name.lower() == candidate.college_name.lower():
            academic_score += 0.4
            reasons.append(f"Same college: {candidate.college_name}")

        # Multi-factor composite score
        composite_score = (
            (0.45 * j_interest) +
            (0.25 * j_skill) +
            (0.20 * comm_score) +
            (0.10 * academic_score)
        )

        if composite_score >= min_score:
            common_interests = [
                candidate_interests_map.get(k, target_interests_map.get(k, k))
                for k in sorted(common_int_keys)
            ]
            common_skills = [
                candidate_skills_map.get(k, target_skills_map.get(k, k))
                for k in sorted(common_skill_keys)
            ]

            if common_interests:
                reasons.insert(0, f"Shared interests in {', '.join(common_interests[:3])}")
            if common_skills:
                reasons.insert(1, f"Shared skills in {', '.join(common_skills[:3])}")
            if shared_comm_names:
                reasons.append(f"Both members of: {', '.join(shared_comm_names[:2])}")

            match_pct = min(100, max(1, round(composite_score * 100)))

            recommendations.append(
                PeerRecommendation(
                    student_id=candidate.id,
                    full_name=candidate.full_name,
                    department=candidate.department,
                    college_name=candidate.college_name,
                    year_of_study=candidate.year_of_study,
                    bio=candidate.bio,
                    common_interests=common_interests,
                    common_skills=common_skills,
                    shared_communities=shared_comm_names,
                    match_reasons=reasons,
                    similarity_score=round(composite_score, 4),
                    match_percentage=match_pct
                )
            )

    recommendations.sort(key=lambda r: r.similarity_score, reverse=True)
    return recommendations[:limit]


def get_advanced_community_recommendations(
    db: Session,
    student_id: int,
    limit: int = 10
) -> List[CommunitySmartRecommendation]:
    """
    Smart community recommendation engine:
    Combines tag relevance (65%) with peer network signals (35%):
    recommends communities that match student's tags and have active participation
    from similar peers.
    """
    student = get_student_by_id(db, student_id=student_id)

    # 1. Student tags
    student_tags_map = {}
    for i in (student.interests or []):
        if i.strip():
            student_tags_map[i.strip().lower()] = i.strip()
    for s in (student.skills or []):
        if s.strip():
            student_tags_map[s.strip().lower()] = s.strip()
    student_tags_set = set(student_tags_map.keys())

    # 2. Communities already joined
    joined_ids = {
        m.community_id
        for m in db.query(CommunityMember.community_id).filter(CommunityMember.student_id == student_id).all()
    }

    # 3. Get top matched peers for social proof signal
    top_peers = get_advanced_peer_recommendations(db, student_id=student_id, limit=5)
    top_peer_dict = {p.student_id: p.full_name for p in top_peers}

    candidate_communities = db.query(Community).filter(~Community.id.in_(joined_ids) if joined_ids else True).all()

    recommendations: List[CommunitySmartRecommendation] = []

    for comm in candidate_communities:
        comm_tags_map = {t.strip().lower(): t.strip() for t in (comm.topic_tags or []) if t.strip()}
        comm_tags_set = set(comm_tags_map.keys())

        # Tag relevance
        tag_score, matched_tag_keys = _compute_jaccard(student_tags_set, comm_tags_set)

        # Peer presence in community
        comm_member_student_ids = {
            m.student_id
            for m in db.query(CommunityMember.student_id).filter(CommunityMember.community_id == comm.id).all()
        }

        matched_peers_in_comm = [
            top_peer_dict[sid] for sid in comm_member_student_ids if sid in top_peer_dict
        ]
        peer_score = len(matched_peers_in_comm) / max(1, len(top_peer_dict)) if top_peer_dict else 0.0

        # Composite relevance
        composite_score = (0.65 * tag_score) + (0.35 * peer_score)

        if composite_score > 0.0:
            matched_display_tags = [
                comm_tags_map.get(k, student_tags_map.get(k, k))
                for k in sorted(matched_tag_keys)
            ]

            reasons: List[str] = []
            if matched_display_tags:
                reasons.append(f"Matches your tags: {', '.join(matched_display_tags[:3])}")
            if matched_peers_in_comm:
                reasons.append(f"Peers with similar interests are members ({', '.join(matched_peers_in_comm[:2])})")
            if comm.category:
                reasons.append(f"Category: {comm.category}")

            member_count = len(comm_member_student_ids)
            match_pct = min(100, max(1, round(composite_score * 100)))

            recommendations.append(
                CommunitySmartRecommendation(
                    community_id=comm.id,
                    name=comm.name,
                    category=comm.category,
                    description=comm.description,
                    topic_tags=comm.topic_tags,
                    member_count=member_count,
                    matched_tags=matched_display_tags,
                    peers_in_community=matched_peers_in_comm,
                    recommendation_reasons=reasons,
                    relevance_score=round(composite_score, 4),
                    match_percentage=match_pct
                )
            )

    recommendations.sort(key=lambda r: (r.relevance_score, r.member_count), reverse=True)
    return recommendations[:limit]


def get_unified_recommendation_feed(
    db: Session,
    student_id: int,
    peer_limit: int = 5,
    community_limit: int = 5
) -> StudentRecommendationFeed:
    """
    Returns a unified feed of both peer recommendations and community recommendations.
    """
    peers = get_advanced_peer_recommendations(db, student_id=student_id, limit=peer_limit)
    communities = get_advanced_community_recommendations(db, student_id=student_id, limit=community_limit)

    return StudentRecommendationFeed(
        student_id=student_id,
        recommended_peers=peers,
        recommended_communities=communities
    )

