# Script para instalar e usar Exchange Online Management
# Execute como Administrador

Write-Host "`n📦 INSTALAÇÃO DO MÓDULO EXCHANGE ONLINE`n" -ForegroundColor Cyan

# Passo 1: Instalar NuGet Provider
Write-Host "🔧 Passo 1: Instalando provedor NuGet..." -ForegroundColor Yellow
try {
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser
    Write-Host "✅ Provedor NuGet instalado!`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro ao instalar NuGet: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Tentando continuar mesmo assim...`n" -ForegroundColor Yellow
}

# Passo 2: Instalar módulo Exchange Online
Write-Host "📦 Passo 2: Instalando módulo ExchangeOnlineManagement..." -ForegroundColor Yellow
try {
    Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck
    Write-Host "✅ Módulo instalado com sucesso!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar módulo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Tentando método alternativo...`n" -ForegroundColor Yellow
    
    # Método alternativo
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force -AllowClobber -Repository PSGallery
        Write-Host "✅ Módulo instalado com método alternativo!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro persistente. Tente executar manualmente:" -ForegroundColor Red
        Write-Host "   Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force -AllowClobber" -ForegroundColor Cyan
        exit 1
    }
}

# Passo 3: Importar módulo
Write-Host "📥 Passo 3: Importando módulo..." -ForegroundColor Yellow
try {
    Import-Module ExchangeOnlineManagement
    Write-Host "✅ Módulo importado!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao importar módulo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Tente reiniciar o PowerShell e executar novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Execute: Connect-ExchangeOnline" -ForegroundColor Cyan
Write-Host "   2. Faça login com sua conta de administrador" -ForegroundColor Cyan
Write-Host "   3. Execute: Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor White

