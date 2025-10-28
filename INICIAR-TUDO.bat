@echo off
chcp 65001 >nul
echo ========================================
echo   Sistema de Marketing - Iniciando TUDO
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Backend...
cd backend
start "Marketing Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Iniciando Frontend...
cd ..\frontend
start "Marketing Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   ✅ Sistema iniciado!
echo.
echo   Backend: http://localhost:3001
echo   Frontend: http://localhost:3002
echo.
echo   Aguarde alguns segundos para tudo carregar...
echo ========================================
timeout /t 5

