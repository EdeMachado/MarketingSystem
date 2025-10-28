@echo off
echo Verificando e criando banco de dados...
cd backend
call npx prisma migrate dev --name init
echo.
echo Banco de dados criado! Pressione qualquer tecla para continuar...
pause >nul

