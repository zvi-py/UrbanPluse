from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class StudentBase(BaseModel):
    """
    Shared base fields for student profiles with strict validation.
    """
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Student's full name",
        examples=["Sarah Connor"]
    )
    email: EmailStr = Field(
        ...,
        description="Valid college or personal email address (used for unique identification)",
        examples=["sarah.connor@university.edu"]
    )
    college_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Name of the college or university",
        examples=["Metro Institute of Technology"]
    )
    department: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Department or major",
        examples=["Computer Science & Engineering"]
    )
    year_of_study: int = Field(
        ...,
        ge=1,
        le=6,
        description="Current academic year (1 to 6)",
        examples=[3]
    )
    skills: List[str] = Field(
        default_factory=list,
        description="List of technical/soft skills",
        examples=[["Python", "FastAPI", "Machine Learning", "Git"]]
    )
    interests: List[str] = Field(
        default_factory=list,
        description="List of academic/personal interests",
        examples=[["AI Research", "Open Source", "Hackathons", "Robotics"]]
    )
    bio: Optional[str] = Field(
        None,
        max_length=500,
        description="Short biographical note or summary",
        examples=["Passionate developer interested in building smart campus tools."]
    )


class StudentCreate(StudentBase):
    """
    Schema for registering a new student.
    All required fields in StudentBase must be supplied.
    """
    pass


class StudentUpdate(BaseModel):
    """
    Schema for updating an existing student profile.
    All fields are optional; only supplied fields will be modified.
    """
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, examples=["Sarah Connor"])
    email: Optional[EmailStr] = Field(None, description="Updated email address", examples=["sarah.new@university.edu"])
    college_name: Optional[str] = Field(None, min_length=2, max_length=150, examples=["Metro Institute of Technology"])
    department: Optional[str] = Field(None, min_length=2, max_length=100, examples=["Data Science & AI"])
    year_of_study: Optional[int] = Field(None, ge=1, le=6, examples=[4])
    skills: Optional[List[str]] = Field(None, examples=[["Python", "PyTorch", "Docker"]])
    interests: Optional[List[str]] = Field(None, examples=[["Deep Learning", "Hackathons"]])
    bio: Optional[str] = Field(None, max_length=500, examples=["Senior student exploring generative AI solutions."])


class StudentRead(StudentBase):
    """
    Schema for returning student profiles in API responses.
    Includes database-generated fields like id and timestamps.
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
