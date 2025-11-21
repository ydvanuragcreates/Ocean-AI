# AI Document Generator

An intelligent document generation platform that creates professional Word documents and PowerPoint presentations using AI.

## Features

- 🤖 **AI-Powered Generation**: Uses Google Gemini to generate document outlines and content
- 📄 **Multiple Formats**: Support for Word (.docx) and PowerPoint (.pptx) documents
- 🎨 **Beautiful 3D UI**: Modern interface with Three.js visualizations
- ✏️ **Interactive Editor**: Edit, comment, and provide feedback on generated content
- 🔐 **Authentication**: Secure user authentication with JWT
- 💾 **Project Management**: Save and manage multiple document projects

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy (ORM)
- SQLite (Database)
- Google Gemini AI
- JWT Authentication

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- Three.js (React Three Fiber)
- Framer Motion
- Axios

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
   - `SECRET_KEY`: Generate a random secret key for JWT
   - `GEMINI_API_KEY`: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

5. Start the backend server:

**Windows (PowerShell):**
```powershell
.\start_server.ps1
```

**Windows (Batch):**
```cmd
start_server.bat
```

**Mac/Linux:**
```bash
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

1. Navigate to the project directory:
```bash
cd project
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Sign Up / Login**: Create an account or login to existing account
2. **Create Project**: Click "New Project" and configure your document
3. **Generate Outline**: Enter a topic and let AI generate an outline
4. **Edit Outline**: Add, remove, or modify sections
5. **Generate Content**: Click "Generate Full Text" to create content for all sections
6. **Edit & Review**: Review generated content, provide feedback, and edit as needed
7. **Export**: Download your document as .docx or .pptx

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /token` - Login and get access token

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `DELETE /projects/{id}` - Delete project
- `GET /projects/{id}/export` - Export document

### Sections
- `POST /sections` - Create section
- `GET /projects/{id}/sections` - Get project sections
- `PATCH /sections/{id}` - Update section
- `DELETE /sections/{id}` - Delete section

### AI Generation
- `POST /generate/outline` - Generate document outline
- `POST /generate/section` - Generate section content

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-jwt-secret-key
GEMINI_API_KEY=your-google-gemini-api-key
```

## Development

### Backend Development
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Development
```bash
cd project
npm run dev
```

### Type Checking (Frontend)
```bash
npm run typecheck
```

### Linting (Frontend)
```bash
npm run lint
```

## Database

The application uses SQLite for data storage. The database file (`app.db`) is automatically created in the backend directory on first run.

## Security Notes

- Never commit your `.env` file to version control
- Use strong, random secret keys in production
- Keep your API keys secure
- Use HTTPS in production

## Troubleshooting

### Backend Issues

**Port already in use:**
- Change the port in the start script or kill the process using port 8000

**Database errors:**
- Delete `app.db` and restart to recreate the database

**API key errors:**
- Verify your Gemini API key is correct and active

### Frontend Issues

**CORS errors:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`

**Module not found:**
- Run `npm install` again

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

