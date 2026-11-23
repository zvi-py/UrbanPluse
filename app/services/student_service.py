from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


def get_student_by_id(db: Session, student_id: int) -> Student:
    """
    Fetch a student by their unique ID.
    Raises HTTP 404 if the student is not found.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} was not found."
        )
    return student


def get_student_by_email(db: Session, email: str) -> Optional[Student]:
    """
    Fetch a student by their email address.
    """
    return db.query(Student).filter(Student.email == email).first()


def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
    """
    Fetch all registered students with pagination support.
    """
    return db.query(Student).offset(skip).limit(limit).all()


def create_student(db: Session, student_in: StudentCreate) -> Student:
    """
    Register a new student profile in SQLite.
    Checks for duplicate registrations based on email.
    """
    existing_student = get_student_by_email(db, email=student_in.email)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A student with email '{student_in.email}' is already registered."
        )

    # Clean and deduplicate initial skills and interests
    cleaned_skills = list(dict.fromkeys(s.strip() for s in student_in.skills if s.strip()))
    cleaned_interests = list(dict.fromkeys(i.strip() for i in student_in.interests if i.strip()))

    student = Student(
        full_name=student_in.full_name,
        email=student_in.email,
        college_name=student_in.college_name,
        department=student_in.department,
        year_of_study=student_in.year_of_study,
        skills=cleaned_skills,
        interests=cleaned_interests,
        bio=student_in.bio
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def update_student(db: Session, student_id: int, student_in: StudentUpdate) -> Student:
    """
    Update an existing student's profile.
    Validates duplicate email conflict if email is being updated.
    """
    student = get_student_by_id(db, student_id=student_id)

    update_data = student_in.model_dump(exclude_unset=True)

    # Check for email collision if email is being changed
    if "email" in update_data and update_data["email"] != student.email:
        existing_with_email = get_student_by_email(db, email=update_data["email"])
        if existing_with_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{update_data['email']}' is already in use by another student."
            )

    # Deduplicate skills or interests if provided in update
    if "skills" in update_data and update_data["skills"] is not None:
        update_data["skills"] = list(dict.fromkeys(s.strip() for s in update_data["skills"] if s.strip()))
    if "interests" in update_data and update_data["interests"] is not None:
        update_data["interests"] = list(dict.fromkeys(i.strip() for i in update_data["interests"] if i.strip()))

    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


def update_student_skills(db: Session, student_id: int, new_skills: List[str]) -> Student:
    """
    Directly update or replace a student's skills list.
    Cleans whitespace and deduplicates entries.
    """
    student = get_student_by_id(db, student_id=student_id)
    cleaned = list(dict.fromkeys(s.strip() for s in new_skills if s.strip()))
    student.skills = cleaned
    db.commit()
    db.refresh(student)
    return student


def update_student_interests(db: Session, student_id: int, new_interests: List[str]) -> Student:
    """
    Directly update or replace a student's interests list.
    Cleans whitespace and deduplicates entries.
    """
    student = get_student_by_id(db, student_id=student_id)
    cleaned = list(dict.fromkeys(i.strip() for i in new_interests if i.strip()))
    student.interests = cleaned
    db.commit()
    db.refresh(student)
    return student


def update_student_skills(db: Session, student_id: int, new_skills: List[str]) -> Student:
    """
    Directly update or replace a student's skills list.
    """
    student = get_student_by_id(db, student_id=student_id)
    cleaned = list(dict.fromkeys(s.strip() for s in new_skills if s.strip()))
    student.skills = cleaned
    db.commit()
    db.refresh(student)
    return student


def update_student_interests(db: Session, student_id: int, new_interests: List[str]) -> Student:
    """
    Directly update or replace a student's interests list.
    Cleans whitespace and deduplicates entries.
    """
    student = get_student_by_id(db, student_id=student_id)
    cleaned = list(dict.fromkeys(i.strip() for i in new_interests if i.strip()))
    student.interests = cleaned
    db.commit()
    db.refresh(student)
    return student


def delete_student(db: Session, student_id: int) -> None:
    """
    Delete a student profile by ID.
    """
    student = get_student_by_id(db, student_id=student_id)
    db.delete(student)
    db.commit()
