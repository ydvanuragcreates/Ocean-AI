# Quick Start Guide

Get your AI Document Generator up and running in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

## Step 1: Backend Setup (3 minutes)

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install Python packages:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup environment variables:**
   - Copy `env_example.txt` to `.env`
   - Edit `.env` and add:
     - Your Google Gemini API key
     - A random secret key (you can generate one with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)

4. **Start the backend:**
   
   **Windows (PowerShell):**
   ```powershell
   .\start_server.ps1
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   start_server.bat
   ```
   
   **Mac/Linux:**
   ```bash
   python -m uvicorn main:app --reload
   ```

   ✅ Backend should now be running on `http://localhost:8000`

## Step 2: Frontend Setup (2 minutes)

1. **Navigate to project folder:**
   ```bash
   cd project
   ```

2. **Install Node packages:**
   ```bash
   npm install
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

   ✅ Frontend should now be running on `http://localhost:5173`

## Step 3: Use the App!

1. Open your browser to `http://localhost:5173`
2. Create an account (register)
3. Click "New Project"
4. Enter a topic (e.g., "Electric Vehicle Market Analysis")
5. Choose document type (Word or PowerPoint)
6. Click "Initialize AI Engine"
7. Review and edit the generated outline
8. Click "Generate Full Text"
9. Review, edit, and provide feedback
10. Export your document!

## Troubleshooting

### Backend won't start
- **Issue:** Port 8000 already in use
- **Fix:** Stop other processes using port 8000 or change the port

### API Key Error
- **Issue:** "GEMINI_API_KEY environment variable is not set"
- **Fix:** Make sure you created `.env` file (not `env_example.txt`) and added your API key

### Frontend can't connect to backend
- **Issue:** CORS or connection errors
- **Fix:** Make sure backend is running on port 8000

### Database Error
- **Issue:** Database locked or corrupted
- **Fix:** Delete `app.db` in backend folder and restart

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API at `http://localhost:8000/docs` (when backend is running)
- Customize the UI in `project/src/components/`

## Need Help?

- Check backend logs for error messages
- Check browser console for frontend errors
- Ensure both servers are running simultaneously

Happy document generating! 🚀

