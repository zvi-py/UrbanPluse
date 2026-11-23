from typing import List, Set, Tuple, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.student import Student
from app.schemas.matching import StudentMatchItem, StudentMatchResponse
from app.services.student_service import get_student_by_id


def _compute_jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> Tuple[float, Set[str]]:
    """
    Computes Jaccard Similarity between two sets of strings:
        J(A, B) = |A ∩ B| / |A ∪ B|
    Returns (score, common_elements).
    Handles empty sets safely without division by zero.
    """
    if not set_a or not set_b:
        return 0.0, set()

    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)

    if not union:
        return 0.0, set()

    score = len(intersection) / len(union)
    return score, intersection


def find_matching_students(
    db: Session,
    student_id: int,
    skip: int = 0,
    limit: int = 20,
    interest_weight: Optional[float] = None,
    skill_weight: Optional[float] = None,
    min_score: float = 0.001
) -> StudentMatchResponse:
    """
    Finds and ranks students with similar interests and complementary skills.

    Requirements addressed:
    1. Compares students using normalized (lowercase, whitespace-stripped) interests and skills.
    2. Weights are configurable (default: 70% interests, 30% skills).
    3. Handles empty profiles gracefully without division by zero.
    4. Never recommends a student to themselves (candidate.id != student_id).
    5. Returns matches sorted from highest to lowest matching score with pagination.
    """
    # 1. Fetch target student (raises 404 if not found)
    target = get_student_by_id(db, student_id=student_id)

    # 2. Configure and normalize weights
    w_interest = interest_weight if interest_weight is not None else settings.MATCH_INTEREST_WEIGHT
    w_skill = skill_weight if skill_weight is not None else settings.MATCH_SKILL_WEIGHT
    total_weight = w_interest + w_skill
    if total_weight > 0:
        w_interest = w_interest / total_weight
        w_skill = w_skill / total_weight
    else:
        w_interest, w_skill = 0.7, 0.3

    # 3. Normalize target student's tags (map lowercase string to original casing for display)
    target_interests_map = {i.strip().lower(): i.strip() for i in (target.interests or []) if i.strip()}
    target_skills_map = {s.strip().lower(): s.strip() for s in (target.skills or []) if s.strip()}

    target_interests_set = set(target_interests_map.keys())
    target_skills_set = set(target_skills_map.keys())

    # If target has neither interests nor skills, no meaningful match can be made
    if not target_interests_set and not target_skills_set:
        return StudentMatchResponse(
            target_student_id=student_id,
            total_matches=0,
            skip=skip,
            limit=limit,
            matches=[]
        )

    # 4. Fetch all other candidate students (never recommend a student to themselves)
    candidates = db.query(Student).filter(Student.id != student_id).all()

    all_matches: List[StudentMatchItem] = []

    for candidate in candidates:
        candidate_interests_map = {i.strip().lower(): i.strip() for i in (candidate.interests or []) if i.strip()}
        candidate_skills_map = {s.strip().lower(): s.strip() for s in (candidate.skills or []) if s.strip()}

        candidate_interests_set = set(candidate_interests_map.keys())
        candidate_skills_set = set(candidate_skills_map.keys())

        # Compute Jaccard similarities
        j_interest, common_interest_keys = _compute_jaccard_similarity(
            target_interests_set,
            candidate_interests_set
        )
        j_skill, common_skill_keys = _compute_jaccard_similarity(
            target_skills_set,
            candidate_skills_set
        )

        # Composite score
        matching_score = (w_interest * j_interest) + (w_skill * j_skill)

        # Only include candidates with a positive matching score above threshold
        if matching_score >= min_score:
            # Preserve original casing for display
            common_interests = [
                candidate_interests_map.get(k, target_interests_map.get(k, k))
                for k in sorted(common_interest_keys)
            ]
            common_skills = [
                candidate_skills_map.get(k, target_skills_map.get(k, k))
                for k in sorted(common_skill_keys)
            ]

            match_percentage = min(100, max(1, round(matching_score * 100)))

            all_matches.append(
                StudentMatchItem(
                    student_id=candidate.id,
                    full_name=candidate.full_name,
                    department=candidate.department,
                    college_name=candidate.college_name,
                    year_of_study=candidate.year_of_study,
                    bio=candidate.bio,
                    common_interests=common_interests,
                    common_skills=common_skills,
                    matching_score=round(matching_score, 4),
                    match_percentage=match_percentage
                )
            )

    # 5. Rank matches from highest to lowest score
    all_matches.sort(key=lambda m: m.matching_score, reverse=True)

    # 6. Apply pagination
    paginated_matches = all_matches[skip : skip + limit]

    return StudentMatchResponse(
        target_student_id=student_id,
        total_matches=len(all_matches),
        skip=skip,
        limit=limit,
        matches=paginated_matches
    )
