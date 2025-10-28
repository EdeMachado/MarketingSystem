@echo off
chcp 65001 >nul
echo ========================================
echo   Atualizando Sistema de Marketing
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Instalando dependências do Backend...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do backend!
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependências do Frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do frontend!
    pause
    exit /b 1
)

echo.
echo [3/4] Gerando Prisma Client...
cd ..\backend
call npx prisma generate
if errorlevel 1 (
    echo ❌ Erro ao gerar Prisma Client!
    pause
    exit /b 1
)

echo.
echo [4/4] Aplicando migrações do banco de dados...
call npx prisma migrate dev --name add_tracking_and_features
if errorlevel 1 (
    echo ⚠️ Erro ao aplicar migrações! Pode ser necessário criar manualmente.
    echo Execute: npx prisma migrate dev
)

echo.
echo ========================================
echo   ✅ Atualização concluída!
echo.
echo   Execute INICIAR-TUDO.bat para iniciar
echo ========================================
pause

