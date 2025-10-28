@echo off
chcp 65001 >nul
echo ========================================
echo   Configurando Ambiente do Sistema
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
echo [2/4] Gerando Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Erro ao gerar Prisma Client!
    pause
    exit /b 1
)

echo.
echo [3/4] Criando banco de dados...
if not exist .env (
    copy env.example .env
    echo ✅ Arquivo .env criado! Configure suas credenciais.
)

call npx prisma migrate dev --name init
if errorlevel 1 (
    echo ❌ Erro ao criar banco de dados!
    pause
    exit /b 1
)

echo.
echo [4/4] Instalando dependências do Frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do frontend!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ Configuração concluída!
echo.
echo   Próximos passos:
echo   1. Edite backend\.env com suas configurações
echo   2. Execute INICIAR-TUDO.bat para iniciar
echo ========================================
pause

