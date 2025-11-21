from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class DocType(str, enum.Enum):
    DOCX = "docx"
    PPTX = "pptx"


class FeedbackType(str, enum.Enum):
    LIKE = "like"
    DISLIKE = "dislike"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    doc_type = Column(SQLEnum(DocType), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="projects")
    sections = relationship("DocumentSection", back_populates="project", cascade="all, delete-orphan", order_by="DocumentSection.order_index")


class DocumentSection(Base):
    __tablename__ = "document_sections"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    heading = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)
    feedback = Column(SQLEnum(FeedbackType), nullable=True)
    comments = Column(Text, nullable=True)

    project = relationship("Project", back_populates="sections")

