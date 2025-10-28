@echo off
echo ========================================
echo   Sistema de Marketing - Iniciando
echo ========================================
echo.

echo Iniciando Backend...
cd backend
start cmd /k "npm run dev"
timeout /t 3

echo.
echo Iniciando Frontend...
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo ========================================
echo   Sistema iniciado!
echo   Backend: http://localhost:3001
echo   Frontend: http://localhost:3002
echo ========================================
pause

