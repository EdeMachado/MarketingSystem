@echo off
chcp 65001 >nul
echo.
echo ============================================
echo   CONFIGURAR FTP - Upload Automatico
echo ============================================
echo.
echo Este script vai configurar o FTP para upload automatico de paginas SEO.
echo.
echo ONDE ENCONTRAR AS CREDENCIAIS:
echo   1. Acesse: grupobiomed.com/cpanel
echo   2. Clique em "FTP Accounts"
echo   3. Copie: Host, Usuario, Senha
echo   4. Ou veja: PASSO-A-PASSO-CONFIGURAR-FTP.md
echo.
echo ============================================
echo.

cd /d "%~dp0backend"

if not exist .env (
    echo Arquivo .env nao encontrado. Criando novo...
    echo. > .env
)

echo Por favor, forneca as informacoes do FTP:
echo.

set /p FTP_HOST="Host FTP (ex: ftp.grupobiomed.com): "
if "%FTP_HOST%"=="" (
    echo.
    echo ERRO: Host FTP e obrigatorio!
    pause
    exit /b 1
)

set /p FTP_USER="Usuario FTP: "
if "%FTP_USER%"=="" (
    echo.
    echo ERRO: Usuario FTP e obrigatorio!
    pause
    exit /b 1
)

set /p FTP_PASS="Senha FTP: "
if "%FTP_PASS%"=="" (
    echo.
    echo ERRO: Senha FTP e obrigatoria!
    pause
    exit /b 1
)

set /p FTP_PORT="Porta FTP [21]: "
if "%FTP_PORT%"=="" set FTP_PORT=21

set /p FTP_PATH="Caminho no servidor [/public_html/]: "
if "%FTP_PATH%"=="" set FTP_PATH=/public_html/

set /p SITE_URL="URL do site [https://grupobiomed.com]: "
if "%SITE_URL%"=="" set SITE_URL=https://grupobiomed.com

echo.
echo Configurando...

REM Remover linhas FTP existentes do .env
powershell -Command "(Get-Content .env) | Where-Object { $_ -notmatch '^FTP_|^SITE_URL=' } | Set-Content .env.tmp && Move-Item -Force .env.tmp .env"

REM Adicionar novas configuracoes
echo. >> .env
echo # Site Configuration >> .env
echo SITE_URL=%SITE_URL% >> .env
echo. >> .env
echo # FTP Upload (para upload automatico de paginas SEO) >> .env
echo FTP_HOST=%FTP_HOST% >> .env
echo FTP_USER=%FTP_USER% >> .env
echo FTP_PASS=%FTP_PASS% >> .env
echo FTP_PATH=%FTP_PATH% >> .env
echo FTP_PORT=%FTP_PORT% >> .env

echo.
echo ============================================
echo   CONFIGURADO COM SUCESSO!
echo ============================================
echo.
echo Configuracao salva:
echo    Host: %FTP_HOST%
echo    Usuario: %FTP_USER%
echo    Porta: %FTP_PORT%
echo    Caminho: %FTP_PATH%
echo    Site: %SITE_URL%
echo.
echo Agora quando voce clicar "PUBLICAR", o sistema fara upload automatico!
echo.
echo Reinicie o backend para aplicar as mudancas.
echo.
pause
