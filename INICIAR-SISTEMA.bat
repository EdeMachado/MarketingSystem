@echo off
chcp 65001 >nul
title Marketing System - Grupo Biomed

echo.
echo ═══════════════════════════════════════════════════
echo   MARKETING SYSTEM - GRUPO BIOMED
echo ═══════════════════════════════════════════════════
echo.

echo 🔍 Verificando configuração...

if not exist "backend\.env" (
    echo.
    echo ⚠️  ARQUIVO .env NÃO ENCONTRADO!
    echo.
    echo 📝 Para enviar emails, você precisa configurar o SMTP:
    echo.
    echo    1. Execute: node backend\configurar-smtp.js
    echo    2. Ou crie manualmente: backend\.env
    echo.
    echo    Veja: README-CONFIGURAR-SMTP.md
    echo.
    pause
)

echo.
echo 🚀 Iniciando sistema...
echo.

echo 📦 Iniciando BACKEND...
start "Marketing System - Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 📦 Iniciando FRONTEND...
start "Marketing System - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Sistema iniciado!
echo.
echo 📧 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3002
echo.
echo ⚠️  Feche esta janela para manter os serviços rodando
echo.
pause

