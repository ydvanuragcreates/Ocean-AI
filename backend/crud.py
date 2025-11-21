from sqlalchemy.orm import Session
from sqlalchemy import and_
from passlib.context import CryptContext
from typing import Optional
from models import User, Project, DocumentSection
from schemas import UserCreate, ProjectCreate, DocumentSectionCreate, DocumentSectionUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# User CRUD
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# Project CRUD
def create_project(db: Session, project: ProjectCreate, owner_id: int) -> Project:
    db_project = Project(**project.model_dump(), owner_id=owner_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_project(db: Session, project_id: int, owner_id: int) -> Optional[Project]:
    return db.query(Project).filter(
        and_(Project.id == project_id, Project.owner_id == owner_id)
    ).first()


def get_projects_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> list[Project]:
    return db.query(Project).filter(Project.owner_id == owner_id).offset(skip).limit(limit).all()


def delete_project(db: Session, project_id: int, owner_id: int) -> bool:
    project = get_project(db, project_id, owner_id)
    if not project:
        return False
    db.delete(project)
    db.commit()
    return True


# Document Section CRUD
def create_section(db: Session, section: DocumentSectionCreate) -> DocumentSection:
    db_section = DocumentSection(**section.model_dump())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section


def get_sections_by_project(db: Session, project_id: int, owner_id: int) -> list[DocumentSection]:
    # Verify project belongs to owner
    project = get_project(db, project_id, owner_id)
    if not project:
        return []
    return db.query(DocumentSection).filter(
        DocumentSection.project_id == project_id
    ).order_by(DocumentSection.order_index).all()


def update_section(db: Session, section_id: int, section_update: DocumentSectionUpdate, owner_id: int) -> Optional[DocumentSection]:
    db_section = db.query(DocumentSection).filter(DocumentSection.id == section_id).first()
    if not db_section:
        return None
    
    # Verify project belongs to owner
    project = get_project(db, db_section.project_id, owner_id)
    if not project:
        return None
    
    update_data = section_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_section, field, value)
    
    db.commit()
    db.refresh(db_section)
    return db_section


def delete_section(db: Session, section_id: int, owner_id: int) -> bool:
    db_section = db.query(DocumentSection).filter(DocumentSection.id == section_id).first()
    if not db_section:
        return False
    
    # Verify project belongs to owner
    project = get_project(db, db_section.project_id, owner_id)
    if not project:
        return False
    
    db.delete(db_section)
    db.commit()
    return True

