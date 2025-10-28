@echo off
echo ========================================
echo   Sistema de Marketing - Instalacao
echo ========================================
echo.

echo Instalando dependencias do Backend...
cd backend
call npm install
echo.

echo Gerando Prisma Client...
call npx prisma generate
echo.

echo Executando migracoes...
call npx prisma migrate dev --name init
echo.

echo Instalando dependencias do Frontend...
cd ..\frontend
call npm install
echo.

echo ========================================
echo   Instalacao concluida!
echo   
echo   IMPORTANTE:
echo   1. Configure o arquivo backend\.env
echo   2. Execute INICIAR.bat para iniciar
echo ========================================
pause

