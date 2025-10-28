@echo off
chcp 65001 >nul
echo.
echo 🚀 CONFIGURADOR DE SMTP - Marketing System
echo.
echo Este script vai ajudar você a configurar o SMTP.
echo.
echo IMPORTANTE: Você precisa ter gerado a senha de app do Gmail primeiro!
echo.
echo Acesse: https://myaccount.google.com/security
echo Vá em "Senhas de app" e gere uma senha para "Marketing System"
echo.
pause
echo.
echo Iniciando configuração...
echo.
node configurar-smtp.js
echo.
pause

