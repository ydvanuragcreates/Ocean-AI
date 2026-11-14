@echo off
echo Starting AI Document Generator API with OpenAI...
cd /d "%~dp0"
python -m uvicorn main_openai:app --reload --host 0.0.0.0 --port 8000
pause