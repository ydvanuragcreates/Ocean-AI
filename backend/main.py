import sys
from pathlib import Path

# Add the backend directory to Python path to allow imports when running from parent directory
backend_dir = Path(__file__).parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from urllib.parse import quote
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai
from docx import Document
from pptx import Presentation
from pptx.util import Inches as PPTXInches
import io

from database import get_db, Base, engine
from models import User, Project, DocumentSection, DocType
from schemas import (
    UserCreate, UserResponse, Token, ProjectCreate, ProjectResponse,
    ProjectWithSections, DocumentSectionCreate, DocumentSectionResponse,
    DocumentSectionUpdate, OutlineRequest, OutlineResponse, SectionRequest,
    SectionResponse
)
from crud import (
    create_user, get_user_by_email, authenticate_user,
    create_project, get_project, get_projects_by_owner, delete_project,
    create_section, get_sections_by_project, update_section, delete_section
)

load_dotenv()

# Initialize database
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="AI Document Generator API")

# CORS - Allow both common Vite ports
# New Code (GOOD for Vercel)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Google Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)

# Print available models for debugging
try:
    print("Available Gemini models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
except Exception as e:
    print(f"Could not list models: {e}")


# Authentication helpers
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Security(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


# Authentication endpoints
@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return create_user(db=db, user=user)


@app.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# Project endpoints
@app.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_project(db=db, project=project, owner_id=current_user.id)


@app.get("/projects", response_model=list[ProjectResponse])
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = get_projects_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)
    return projects


@app.get("/projects/{project_id}", response_model=ProjectWithSections)
async def read_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project(db, project_id=project_id, owner_id=current_user.id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@app.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_endpoint(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_project(db, project_id=project_id, owner_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )


# Document Section endpoints
@app.post("/sections", response_model=DocumentSectionResponse, status_code=status.HTTP_201_CREATED)
async def create_new_section(
    section: DocumentSectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify project belongs to user
    project = get_project(db, section.project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return create_section(db=db, section=section)


@app.get("/projects/{project_id}/sections", response_model=list[DocumentSectionResponse])
async def read_sections(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sections = get_sections_by_project(db, project_id=project_id, owner_id=current_user.id)
    return sections


@app.patch("/sections/{section_id}", response_model=DocumentSectionResponse)
async def update_section_endpoint(
    section_id: int,
    section_update: DocumentSectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    section = update_section(db, section_id=section_id, section_update=section_update, owner_id=current_user.id)
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    return section


@app.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section_endpoint(
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_section(db, section_id=section_id, owner_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )


# AI Generation endpoints
@app.post("/generate/outline", response_model=OutlineResponse)
async def generate_outline(
    request: OutlineRequest,
    current_user: User = Depends(get_current_user)
):
    # Check if API key is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key-here":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured. Please add your API key to the .env file."
        )
    
    try:
        # Use the correct model name from available models list
        model = genai.GenerativeModel('models/gemini-3.5-flash-lite')
        
        if request.doc_type == DocType.DOCX:
            prompt = f"""Generate a comprehensive outline for a document about "{request.topic}". 
            Return ONLY a list of section headings, one per line, without any numbering, bullets, or special characters.
            Each heading should be clear and descriptive. Return 5-8 sections.
            Format: Just plain text headings, one per line."""
        else:  # PPTX
            prompt = f"""Generate a presentation outline for a topic about "{request.topic}". 
            Return ONLY a list of slide titles, one per line, without any numbering, bullets, or special characters.
            Each title should be concise and suitable for a presentation slide. Return 5-8 slides.
            Format: Just plain text titles, one per line."""
        
        response = model.generate_content(prompt)
        sections = [line.strip() for line in response.text.strip().split('\n') if line.strip()]
        return OutlineResponse(sections=sections)
    except Exception as e:
        print(f"Error generating outline: {str(e)}")  # Log the error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating outline: {str(e)}"
        )


@app.post("/generate/section", response_model=SectionResponse)
async def generate_section(
    request: SectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if API key is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key-here":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured. Please add your API key to the .env file."
        )
    
    try:
        # Use the correct model name from available models list
        model = genai.GenerativeModel('models/gemini-3.5-flash-lite')
        
        # Different prompts for DOCX vs PPTX
        if request.doc_type == DocType.PPTX:
            prompt = f"""Create engaging, concise content for a PowerPoint slide titled "{request.section_title}" 
            about "{request.topic}".
            
            POWERPOINT FORMATTING RULES:
            - Use 5-7 bullet points (one per line)
            - Each bullet should be concise (1-2 sentences maximum)
            - Start each line with a dash (-) for bullets
            - Use powerful, impactful language
            - Include key statistics, facts, or insights where relevant
            - Make it visually scannable and easy to present
            - Be creative and engaging while staying professional
            - NO paragraphs, NO markdown symbols (#, **, etc.)
            - Focus on the most important information only
            
            Example format:
            - First key point about the topic
            - Second important insight or statistic
            - Third compelling fact or recommendation
            
            Generate the slide content now:"""
        else:
            # DOCX format - paragraphs
            prompt = f"""Write detailed, professional content for a section titled "{request.section_title}" 
            in a document about "{request.topic}".
            
            IMPORTANT FORMATTING RULES:
            - Write in clean, flowing prose with proper paragraphs
            - Do NOT use any markdown symbols (no #, ##, ***, ---, ||, etc.)
            - Do NOT use tables, lists with special characters, or code blocks
            - Use natural paragraph breaks (blank lines between paragraphs)
            - Write in a professional, academic tone
            - Make it comprehensive and well-structured (3-5 paragraphs)
            - Focus on clear, readable text suitable for a professional document
            
            Generate the content now:"""
        
        response = model.generate_content(prompt)
        
        # Clean up any remaining markdown symbols or special characters
        content = response.text.strip()
        
        # For PPTX, keep bullet points but clean other symbols
        if request.doc_type == DocType.PPTX:
            # Remove markdown symbols but keep dashes for bullets
            content = content.replace('##', '')
            content = content.replace('**', '')
            content = content.replace('||', '')
            content = content.replace('|:', '')
            content = content.replace('::::', '')
            content = content.replace('***', '')
            content = content.replace('___', '')
            # Ensure consistent bullet format
            lines = []
            for line in content.split('\n'):
                line = line.strip()
                # Convert various bullet formats to simple dash
                if line.startswith('•') or line.startswith('*') or line.startswith('–'):
                    line = '- ' + line[1:].strip()
                elif line and not line.startswith('-'):
                    # Add dash if it's content but not already a bullet
                    if len(line) > 5:  # Avoid adding dash to short lines
                        line = '- ' + line
                if line:
                    lines.append(line)
            content = '\n'.join(lines)
        else:
            # For DOCX, remove all special symbols including dashes
            content = content.replace('##', '')
            content = content.replace('**', '')
            content = content.replace('--', '')
            content = content.replace('||', '')
            content = content.replace('|:', '')
            content = content.replace('::::', '')
            content = content.replace('***', '')
            content = content.replace('___', '')
            # Remove any lines that are just dashes or equal signs
            lines = [line for line in content.split('\n') if not all(c in '-=*#_| ' for c in line)]
            content = '\n'.join(lines)
        
        return SectionResponse(content=content.strip())
    except Exception as e:
        print(f"Error generating section: {str(e)}")  # Log the error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating section: {str(e)}"
        )


# Export endpoint
@app.get("/projects/{project_id}/export")
async def export_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project(db, project_id=project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    sections = get_sections_by_project(db, project_id=project_id, owner_id=current_user.id)
    sections = sorted(sections, key=lambda x: x.order_index)
    
    if project.doc_type == DocType.DOCX:
        # Create DOCX document
        doc = Document()
        doc.add_heading(project.title, 0)
        
        for section in sections:
            doc.add_heading(section.heading, level=1)
            # Split content into paragraphs
            paragraphs = section.content.split('\n\n')
            for para in paragraphs:
                if para.strip():
                    doc.add_paragraph(para.strip())
            doc.add_paragraph()  # Add spacing between sections
        
        # Save to bytes
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        filename = quote(f"{project.title}.docx")
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    
    else:  # PPTX
        # Create PPTX presentation
        prs = Presentation()
        prs.slide_width = PPTXInches(10)
        prs.slide_height = PPTXInches(7.5)
        
        # Title slide
        title_slide_layout = prs.slide_layouts[0]
        slide = prs.slides.add_slide(title_slide_layout)
        title = slide.shapes.title
        subtitle = slide.placeholders[1]
        title.text = project.title
        subtitle.text = f"Generated on {project.created_at.strftime('%Y-%m-%d')}"
        
        # Content slides
        for section in sections:
            # Use Title and Content layout
            bullet_slide_layout = prs.slide_layouts[1]
            slide = prs.slides.add_slide(bullet_slide_layout)
            title_shape = slide.shapes.title
            content_shape = slide.placeholders[1]
            
            title_shape.text = section.heading
            
            # Add content to text frame
            tf = content_shape.text_frame
            tf.word_wrap = True
            tf.clear()
            
            # Limit content length to fit on slide (approximately 1000 characters)
            content = section.content
            if len(content) > 1000:
                content = content[:997] + "..."
            
            # Split content into paragraphs and add as bullet points
            paragraphs = content.split('\n\n')
            for i, para in enumerate(paragraphs):
                para = para.strip()
                if para:
                    if i == 0:
                        tf.text = para
                    else:
                        p = tf.add_paragraph()
                        p.text = para
                        p.level = 0
        
        # Save to bytes
        buffer = io.BytesIO()
        prs.save(buffer)
        buffer.seek(0)
        
        filename = quote(f"{project.title}.pptx")
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )


@app.get("/")
async def root():
    return {"message": "AI Document Generator API"}

