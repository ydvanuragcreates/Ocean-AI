from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import DocType, FeedbackType


# User Schemas
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


# Project Schemas
class ProjectBase(BaseModel):
    title: str
    doc_type: DocType


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True


class ProjectWithSections(ProjectResponse):
    sections: List["DocumentSectionResponse"] = []


# Document Section Schemas
class DocumentSectionBase(BaseModel):
    heading: str
    content: str
    order_index: int


class DocumentSectionCreate(DocumentSectionBase):
    project_id: int


class DocumentSectionUpdate(BaseModel):
    heading: Optional[str] = None
    content: Optional[str] = None
    order_index: Optional[int] = None
    feedback: Optional[FeedbackType] = None
    comments: Optional[str] = None


class DocumentSectionResponse(DocumentSectionBase):
    id: int
    project_id: int
    feedback: Optional[FeedbackType] = None
    comments: Optional[str] = None

    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# AI Generation Schemas
class OutlineRequest(BaseModel):
    topic: str
    doc_type: DocType


class OutlineResponse(BaseModel):
    sections: List[str]


class SectionRequest(BaseModel):
    section_title: str
    topic: str
    doc_type: Optional[DocType] = None


class SectionResponse(BaseModel):
    content: str


# Update forward references
ProjectWithSections.model_rebuild()

