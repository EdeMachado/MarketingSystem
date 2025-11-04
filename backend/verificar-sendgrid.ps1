# Script para verificar configuração do SendGrid
Write-Host "`n=== VERIFICACAO DE CONFIGURACAO SENDGRID ===" -ForegroundColor Cyan

# Verificar se arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "`n❌ ERRO: Arquivo .env nao encontrado!" -ForegroundColor Red
    Write-Host "   Crie o arquivo .env na pasta backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Lendo configuração do .env..." -ForegroundColor Yellow

# Ler variáveis do .env
$envContent = Get-Content .env
$smtpHost = ""
$smtpPort = ""
$smtpUser = ""
$smtpPass = ""
$smtpFrom = ""

foreach ($line in $envContent) {
    if ($line -match "^SMTP_HOST=(.+)") {
        $smtpHost = $matches[1].Trim('"')
    }
    elseif ($line -match "^SMTP_PORT=(.+)") {
        $smtpPort = $matches[1].Trim('"')
    }
    elseif ($line -match "^SMTP_USER=(.+)") {
        $smtpUser = $matches[1].Trim('"')
    }
    elseif ($line -match "^SMTP_PASS=(.+)") {
        $smtpPass = $matches[1].Trim('"')
    }
    elseif ($line -match "^SMTP_FROM=(.+)") {
        $smtpFrom = $matches[1].Trim('"')
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACAO ATUAL:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMTP_HOST: $smtpHost" -ForegroundColor White
Write-Host "SMTP_PORT: $smtpPort" -ForegroundColor White
Write-Host "SMTP_USER: $smtpUser" -ForegroundColor White

if ($smtpPass) {
    $passPreview = if ($smtpPass.Length -gt 15) { $smtpPass.Substring(0, 15) + "..." } else { "***" }
    Write-Host "SMTP_PASS: $passPreview" -ForegroundColor White
} else {
    Write-Host "SMTP_PASS: NAO CONFIGURADO" -ForegroundColor Red
}

Write-Host "SMTP_FROM: $smtpFrom" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar se está tudo configurado
$missing = @()
if (-not $smtpHost) { $missing += "SMTP_HOST" }
if (-not $smtpPort) { $missing += "SMTP_PORT" }
if (-not $smtpUser) { $missing += "SMTP_USER" }
if (-not $smtpPass) { $missing += "SMTP_PASS" }
if (-not $smtpFrom) { $missing += "SMTP_FROM" }

if ($missing.Count -gt 0) {
    Write-Host "❌ VARIAVEIS FALTANDO:" -ForegroundColor Red
    foreach ($var in $missing) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host "`nConfigure no arquivo .env" -ForegroundColor Yellow
    exit 1
}

# Verificar se é SendGrid
if ($smtpHost -ne "smtp.sendgrid.net") {
    Write-Host "⚠️  ATENCAO: SMTP_HOST nao e SendGrid" -ForegroundColor Yellow
    Write-Host "   Host atual: $smtpHost" -ForegroundColor White
    Write-Host "   Esperado: smtp.sendgrid.net" -ForegroundColor White
}

if ($smtpUser -ne "apikey") {
    Write-Host "⚠️  ATENCAO: SMTP_USER deve ser 'apikey' para SendGrid" -ForegroundColor Yellow
    Write-Host "   Usuario atual: $smtpUser" -ForegroundColor White
}

# Verificar formato da API Key
if ($smtpPass -and $smtpPass.Length -lt 20) {
    Write-Host "`n⚠️  ATENCAO: API Key parece muito curta" -ForegroundColor Yellow
    Write-Host "   API Keys do SendGrid geralmente tem mais de 50 caracteres" -ForegroundColor White
    Write-Host "   Verifique se copiou a API Key completa" -ForegroundColor White
}

if ($smtpPass -and $smtpPass.StartsWith("SG.")) {
    Write-Host "`n✅ API Key parece estar no formato correto (SG.xxx)" -ForegroundColor Green
} elseif ($smtpPass -and -not $smtpPass.StartsWith("SG.")) {
    Write-Host "`n⚠️  API Key nao comeca com 'SG.'" -ForegroundColor Yellow
    Write-Host "   API Keys do SendGrid geralmente comecam com 'SG.'" -ForegroundColor White
    Write-Host "   Verifique se esta usando a API Key correta" -ForegroundColor White
}

Write-Host "`n✅ Configuracao basica OK" -ForegroundColor Green
Write-Host "`n💡 PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. Verifique se a API Key esta ativa no SendGrid" -ForegroundColor White
Write-Host "   2. Verifique se tem permissao 'Mail Send'" -ForegroundColor White
Write-Host "   3. Execute: node test-sendgrid.js" -ForegroundColor White
Write-Host "   4. Se der erro, veja: CONFIGURAR-SENDGRID.md" -ForegroundColor White

Write-Host "`nPressione qualquer tecla para sair..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null

