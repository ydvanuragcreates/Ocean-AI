# 🤖 AI Document Generator - OCEAN AI

An intelligent document generation platform powered by Google Gemini AI that creates professional Word documents and PowerPoint presentations.

![Ocean AI](https://img.shields.io/badge/AI-Powered-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.121-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)

## ✨ Features

- 🤖 **AI-Powered Content Generation** - Uses Google Gemini 1.5 Flash for intelligent content creation
- 📄 **Multiple Formats** - Generate Word documents (.docx) and PowerPoint presentations (.pptx)
- 🎨 **Beautiful 3D UI** - Modern interface with Three.js visualizations and Framer Motion animations
- ✏️ **Interactive Editor** - Edit, comment, and provide feedback on generated content
- 🔐 **Secure Authentication** - JWT-based user authentication
- 💾 **Project Management** - Save and manage multiple document projects
- 🎯 **Smart Formatting** - Different content styles for Word (paragraphs) vs PowerPoint (bullet points)
- 📊 **Live 3D Preview** - Real-time 3D visualization of document structure
- ↩️ **Edit at Any Stage** - Navigate back to modify topic or outline

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Gemini API Key ([Get one free here](https://makersuite.google.com/app/apikey))

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file:
   ```bash
   cp env_example.txt .env
   ```

4. Edit `.env` and add your credentials:
   ```env
   SECRET_KEY=your-secret-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

5. Start the server:
   ```bash
   python -m uvicorn main:app --reload
   ```

   Backend runs on `http://localhost:8000`

### Frontend Setup

1. Navigate to project:
   ```bash
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:5173` (or 5174)

## 📖 How to Use

1. **Sign Up / Login** - Create an account
2. **New Project** - Click "New Project" and choose your topic
3. **Select Format** - Choose Word or PowerPoint
4. **AI Generates Outline** - Get 5-8 AI-generated sections
5. **Edit Outline** - Customize sections as needed
6. **Generate Content** - Let AI write full content
7. **Edit & Review** - Polish the generated content
8. **Export** - Download as .docx or .pptx

## 🎯 Key Features in Detail

### Smart Content Generation
- **Word Documents**: Professional paragraphs with academic tone
- **PowerPoint Slides**: Concise bullet points, 5-7 per slide
- **Context-Aware**: AI understands your topic and generates relevant content

### Interactive 3D Preview
- Real-time visualization of document structure
- See papers stack up as you add sections
- Different shapes for Word (tall) vs PowerPoint (wide)

### Full Navigation
- Go back from Editor → Outline
- Go back from Outline → Config
- Edit at any stage without losing work

## 🛠️ Tech Stack

### Frontend
- **React 18.3** with TypeScript
- **Vite** for blazing fast builds
- **TailwindCSS** for styling
- **Three.js** (React Three Fiber) for 3D graphics
- **Framer Motion** for animations
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **FastAPI** for high-performance API
- **SQLAlchemy** ORM with SQLite
- **JWT** authentication
- **Google Gemini AI** for content generation
- **python-docx** for Word generation
- **python-pptx** for PowerPoint generation

## 📁 Project Structure

```
ocean-ai/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # Database operations
│   ├── database.py          # DB connection
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not in git)
├── project/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── App.tsx          # Main app
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
└── README.md                # This file
```

## 🔒 Security

- JWT token-based authentication
- Password hashing with bcrypt
- Environment variables for sensitive data
- CORS protection
- Input validation with Pydantic

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes!

## 🙏 Acknowledgments

- Google Gemini AI for intelligent content generation
- React Three Fiber community for 3D rendering tools
- FastAPI for the amazing Python web framework

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Made with ❤️ using AI**

