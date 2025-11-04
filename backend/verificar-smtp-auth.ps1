# Script para verificar SMTP AUTH no Microsoft 365
# Execute como administrador ou com permissões adequadas

Write-Host "`n🔍 VERIFICAÇÃO DE SMTP AUTH - Microsoft 365`n" -ForegroundColor Cyan

# Verificar se o módulo Exchange Online está instalado
$moduleInstalled = Get-Module -ListAvailable -Name ExchangeOnlineManagement

if (-not $moduleInstalled) {
    Write-Host "⚠️  Módulo Exchange Online não está instalado." -ForegroundColor Yellow
    Write-Host "`n📦 Instalando módulo Exchange Online Management..." -ForegroundColor Yellow
    
    try {
        Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force -AllowClobber
        Write-Host "✅ Módulo instalado com sucesso!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao instalar módulo: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n💡 Alternativa: Execute manualmente:" -ForegroundColor Yellow
        Write-Host "   Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force" -ForegroundColor Cyan
        exit 1
    }
}

# Importar módulo
try {
    Import-Module ExchangeOnlineManagement
    Write-Host "✅ Módulo carregado!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao carregar módulo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Email a verificar
$email = "contato@grupobiomed.com"

Write-Host "🔐 Conectando ao Exchange Online..." -ForegroundColor Yellow
Write-Host "⚠️  Você precisará fazer login com sua conta de administrador do Microsoft 365`n" -ForegroundColor Yellow

try {
    # Conectar ao Exchange Online
    Connect-ExchangeOnline -UserPrincipalName $email -ShowProgress $false
    
    Write-Host "✅ Conectado!`n" -ForegroundColor Green
    
    # Verificar status do SMTP AUTH
    Write-Host "🔍 Verificando status do SMTP AUTH para: $email`n" -ForegroundColor Cyan
    
    $mailbox = Get-CASMailbox -Identity $email | Select-Object Name, SmtpClientAuthenticationDisabled
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Resultado:" -ForegroundColor White
    Write-Host "  Nome: $($mailbox.Name)" -ForegroundColor White
    Write-Host "  SMTP AUTH Desabilitado: $($mailbox.SmtpClientAuthenticationDisabled)" -ForegroundColor $(if ($mailbox.SmtpClientAuthenticationDisabled) { "Red" } else { "Green" })
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    
    if ($mailbox.SmtpClientAuthenticationDisabled) {
        Write-Host "❌ SMTP AUTH está DESABILITADO!" -ForegroundColor Red
        Write-Host "`n🔧 Habilitando SMTP AUTH..." -ForegroundColor Yellow
        
        Set-CASMailbox -Identity $email -SmtpClientAuthenticationDisabled $false
        
        Write-Host "✅ SMTP AUTH habilitado!" -ForegroundColor Green
        Write-Host "⏰ Aguarde 15-30 minutos para a propagação.`n" -ForegroundColor Yellow
        
        # Verificar novamente
        Start-Sleep -Seconds 2
        $mailbox = Get-CASMailbox -Identity $email | Select-Object Name, SmtpClientAuthenticationDisabled
        
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "Verificação após alteração:" -ForegroundColor White
        Write-Host "  SMTP AUTH Desabilitado: $($mailbox.SmtpClientAuthenticationDisabled)" -ForegroundColor $(if ($mailbox.SmtpClientAuthenticationDisabled) { "Red" } else { "Green" })
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    } else {
        Write-Host "✅ SMTP AUTH está HABILITADO!" -ForegroundColor Green
        Write-Host "`n💡 Se ainda está dando erro, pode ser:" -ForegroundColor Yellow
        Write-Host "   - Propagação ainda não concluída (aguarde mais tempo)" -ForegroundColor White
        Write-Host "   - MFA habilitado (precisa senha de app)" -ForegroundColor White
        Write-Host "   - Políticas de segurança bloqueando" -ForegroundColor White
        Write-Host "   - Servidor SMTP incorreto`n" -ForegroundColor White
    }
    
    # Desconectar
    Disconnect-ExchangeOnline -Confirm:$false
    Write-Host "✅ Desconectado!`n" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Verifique se você tem permissões de administrador." -ForegroundColor Yellow
    Write-Host "💡 Ou execute este script como administrador.`n" -ForegroundColor Yellow
}

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

