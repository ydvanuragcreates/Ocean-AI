# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  http://localhost:5173                                           │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ HTTP/REST API
             │ (with JWT tokens)
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Components Layer                                         │   │
│  │  ├── Auth.tsx (Login/Register)                           │   │
│  │  ├── App.tsx (Main orchestration)                        │   │
│  │  ├── ProjectConfig.tsx                                   │   │
│  │  ├── OutlineSetup.tsx                                    │   │
│  │  ├── Editor.tsx                                          │   │
│  │  ├── Sidebar.tsx                                         │   │
│  │  └── TextCard.tsx                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Context Layer                                            │   │
│  │  └── AuthContext.tsx (Global auth state)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services Layer                                           │   │
│  │  └── api.ts (Axios + API functions)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ HTTP Requests (JSON)
             │ Authorization: Bearer <token>
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
│  http://localhost:8000                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Endpoints (main.py)                                 │   │
│  │  ├── POST /register                                      │   │
│  │  ├── POST /token                                         │   │
│  │  ├── GET/POST/DELETE /projects                          │   │
│  │  ├── GET/POST/PATCH/DELETE /sections                    │   │
│  │  ├── POST /generate/outline                             │   │
│  │  ├── POST /generate/section                             │   │
│  │  └── GET /projects/{id}/export                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware                                               │   │
│  │  ├── CORS (allow localhost:5173)                        │   │
│  │  └── JWT Authentication                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Business Logic                                           │   │
│  │  ├── crud.py (Database operations)                      │   │
│  │  ├── models.py (SQLAlchemy models)                      │   │
│  │  └── schemas.py (Pydantic schemas)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────┬────────────────────────────┘
             │                        │
             │                        │ API Calls
             │                        ▼
             │              ┌──────────────────────┐
             │              │  Google Gemini AI    │
             │              │  (Content Generation)│
             │              └──────────────────────┘
             │
             │ SQLAlchemy ORM
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (SQLite)                           │
│  app.db                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tables:                                                  │   │
│  │  ├── users (id, email, hashed_password)                 │   │
│  │  ├── projects (id, title, doc_type, owner_id)           │   │
│  │  └── document_sections (id, project_id, heading,        │   │
│  │       content, order_index, feedback, comments)         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Examples

### 1. User Registration Flow

```
User fills form
    ↓
Auth.tsx: handleSubmit()
    ↓
authAPI.register({ email, password })
    ↓
POST /register
    ↓
Backend validates & hashes password
    ↓
Creates user in database
    ↓
Returns user object
    ↓
Auto-login with authAPI.login()
    ↓
Returns JWT token
    ↓
Token stored in localStorage
    ↓
AuthContext updates (user logged in)
    ↓
App.tsx renders main interface
```

### 2. Project Creation & Outline Generation

```
User clicks "Initialize AI Engine"
    ↓
ProjectConfig: handleSubmit()
    ↓
projectsAPI.create(title, doc_type)
    ↓
POST /projects (with JWT token)
    ↓
Backend creates project in database
    ↓
Returns project object
    ↓
aiAPI.generateOutline(topic, doc_type)
    ↓
POST /generate/outline
    ↓
Backend calls Google Gemini API
    ↓
Gemini generates outline
    ↓
Returns array of section titles
    ↓
OutlineSetup displays sections
    ↓
3D visualization updates
```

### 3. Content Generation

```
User clicks "Generate Full Text"
    ↓
App.tsx: handleGenerateContent()
    ↓
For each outline section:
  ↓
  aiAPI.generateSection(heading, topic)
  ↓
  POST /generate/section
  ↓
  Backend calls Gemini API
  ↓
  Gemini generates content
  ↓
  sectionsAPI.create(project_id, heading, content, index)
  ↓
  POST /sections
  ↓
  Backend saves to database
  ↓
  Returns section object
    ↓
All sections collected
    ↓
Editor.tsx displays sections
```

### 4. Section Editing & Feedback

```
User edits content / clicks Like
    ↓
TextCard: onUpdate()
    ↓
sectionsAPI.update(id, { content, feedback })
    ↓
PATCH /sections/{id}
    ↓
Backend updates database
    ↓
Returns updated section
    ↓
UI reflects changes
```

### 5. Document Export

```
User clicks "Export"
    ↓
App.tsx: handleExport()
    ↓
projectsAPI.export(project_id)
    ↓
GET /projects/{id}/export
    ↓
Backend loads project & sections
    ↓
Generates .docx or .pptx file
    ↓
Returns file as blob
    ↓
Browser downloads file
```

## Technology Stack Details

### Frontend Stack

```
React 18.3.1
├── TypeScript (Type safety)
├── Vite (Build tool)
├── TailwindCSS (Styling)
├── Framer Motion (Animations)
├── Three.js / React Three Fiber (3D graphics)
│   └── @react-three/drei (3D helpers)
├── Axios (HTTP client)
└── Lucide React (Icons)
```

### Backend Stack

```
Python 3.8+
└── FastAPI (Web framework)
    ├── Uvicorn (ASGI server)
    ├── SQLAlchemy (ORM)
    ├── Pydantic (Data validation)
    ├── python-jose (JWT tokens)
    ├── passlib (Password hashing)
    ├── google-generativeai (AI)
    ├── python-docx (Word generation)
    ├── python-pptx (PowerPoint generation)
    └── python-dotenv (Environment variables)
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL
);

-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    doc_type VARCHAR NOT NULL,  -- 'docx' or 'pptx'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id INTEGER REFERENCES users(id)
);

-- Document sections table
CREATE TABLE document_sections (
    id INTEGER PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    heading VARCHAR NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    feedback VARCHAR,  -- 'like', 'dislike', or NULL
    comments TEXT
);
```

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│  Security Layers                                 │
├─────────────────────────────────────────────────┤
│  1. CORS Middleware                              │
│     - Only allows localhost:5173                 │
│     - Credentials support enabled                │
├─────────────────────────────────────────────────┤
│  2. JWT Authentication                           │
│     - HS256 algorithm                            │
│     - 30-minute expiration                       │
│     - Automatic token injection (frontend)       │
├─────────────────────────────────────────────────┤
│  3. Password Security                            │
│     - Bcrypt hashing                             │
│     - Never store plain passwords                │
├─────────────────────────────────────────────────┤
│  4. Authorization Checks                         │
│     - All endpoints require authentication       │
│     - Users can only access their own data       │
├─────────────────────────────────────────────────┤
│  5. Input Validation                             │
│     - Pydantic schemas validate all inputs       │
│     - Email validation                           │
│     - Type checking                              │
└─────────────────────────────────────────────────┘
```

## State Management Flow

```
┌────────────────────────────────────────────┐
│  localStorage                               │
│  └── access_token (JWT)                    │
└────────────────┬───────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│  AuthContext (React Context)               │
│  ├── user: User | null                     │
│  ├── isAuthenticated: boolean              │
│  ├── login(email, password)                │
│  ├── register(email, password)             │
│  └── logout()                              │
└────────────────┬───────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│  App.tsx (Component State)                 │
│  ├── projects: Project[]                   │
│  ├── activeProject: Project | null         │
│  ├── sections: DocumentSection[]           │
│  ├── outlineSections: string[]             │
│  └── currentStep: 'config'|'outline'|...   │
└────────────────┬───────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│  Child Components                           │
│  (Receive data via props)                   │
└────────────────────────────────────────────┘
```

## API Communication Protocol

### Request Format

```http
POST /projects HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Market Analysis",
  "doc_type": "docx"
}
```

### Response Format

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "title": "Market Analysis",
  "doc_type": "docx",
  "created_at": "2025-11-20T10:30:00",
  "owner_id": 1
}
```

### Error Format

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "detail": "Could not validate credentials"
}
```

## Deployment Considerations

### Development

- Frontend: `npm run dev` (Port 5173)
- Backend: `uvicorn main:app --reload` (Port 8000)
- Database: SQLite file (`app.db`)

### Production Recommendations

```
Frontend:
  - Build: npm run build
  - Serve static files via Nginx/Apache
  - Use environment variables for API URL

Backend:
  - Use production ASGI server (Gunicorn + Uvicorn workers)
  - Switch to PostgreSQL for better performance
  - Use proper SECRET_KEY (64+ characters)
  - Enable HTTPS
  - Configure proper CORS origins
  - Rate limiting
  - API key rotation

Infrastructure:
  - Use reverse proxy (Nginx)
  - Enable HTTPS (Let's Encrypt)
  - Set up monitoring (logs, errors)
  - Backup database regularly
  - Use environment-specific .env files
```

## Performance Considerations

1. **Frontend**
   - React.memo for expensive components
   - Lazy loading for routes
   - Debounce API calls
   - Optimize 3D rendering

2. **Backend**
   - Database indexing (user_id, project_id)
   - Connection pooling
   - Caching frequently accessed data
   - Async operations for AI calls

3. **AI Generation**
   - Stream responses for long content
   - Queue system for bulk generation
   - Retry logic for failed requests
   - Rate limiting for API calls

This architecture provides a scalable, maintainable foundation for your AI Document Generator! 🚀

