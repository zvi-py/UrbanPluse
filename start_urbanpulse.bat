@echo off
echo ========================================================
echo   Starting UrbanPulse AI Multi-Agent Platform
echo   One City. Four Intelligent Agents. One Connected Platform.
echo ========================================================
echo.

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "UrbanPulse Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 4 /nobreak >nul

echo [2/3] Starting Vite Frontend on http://127.0.0.1:5173 ...
start "UrbanPulse Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 2 /nobreak >nul

echo [3/3] Launching Dashboard in default browser ...
start http://localhost:5173

echo.
echo ========================================================
echo   UrbanPulse is now LIVE at http://localhost:5173
echo   API Documentation is at http://localhost:8000/docs
echo ========================================================
