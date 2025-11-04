# Script simples para verificar e habilitar SMTP AUTH
# Execute: .\VERIFICAR-SMTP-AUTH-SIMPLES.ps1

Write-Host ""
Write-Host "=== VERIFICACAO DE SMTP AUTH ===" -ForegroundColor Cyan
Write-Host ""

# Importar modulo
Write-Host "Importando modulo Exchange Online..." -ForegroundColor Yellow
try {
    Import-Module ExchangeOnlineManagement -ErrorAction Stop
    Write-Host "Modulo importado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Nao foi possivel importar o modulo" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Conectar ao Exchange Online
Write-Host "Conectando ao Exchange Online..." -ForegroundColor Yellow
Write-Host "ATENCAO: Vai abrir janela para login. Use sua conta de administrador!" -ForegroundColor Yellow
Write-Host ""

try {
    Connect-ExchangeOnline -ShowProgress $false
    
    Write-Host "Conectado com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Email a verificar
    $email = "contato@grupobiomed.com"
    
    Write-Host "Verificando: $email" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar status
    $mailbox = Get-CASMailbox -Identity $email | Select-Object Name, SmtpClientAuthenticationDisabled
    
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host "RESULTADO:" -ForegroundColor White
    Write-Host "  Nome: $($mailbox.Name)" -ForegroundColor White
    Write-Host "  SMTP AUTH Desabilitado: $($mailbox.SmtpClientAuthenticationDisabled)" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Gray
    Write-Host ""
    
    if ($mailbox.SmtpClientAuthenticationDisabled -eq $true) {
        Write-Host "SMTP AUTH esta DESABILITADO!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Habilitando SMTP AUTH..." -ForegroundColor Yellow
        
        Set-CASMailbox -Identity $email -SmtpClientAuthenticationDisabled $false
        
        Write-Host "SMTP AUTH habilitado!" -ForegroundColor Green
        Write-Host ""
        
        # Verificar novamente
        Start-Sleep -Seconds 2
        $mailbox = Get-CASMailbox -Identity $email | Select-Object Name, SmtpClientAuthenticationDisabled
        
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host "CONFIRMACAO:" -ForegroundColor White
        Write-Host "  SMTP AUTH Desabilitado: $($mailbox.SmtpClientAuthenticationDisabled)" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host ""
        
        if ($mailbox.SmtpClientAuthenticationDisabled -eq $false) {
            Write-Host "SUCESSO! SMTP AUTH agora esta HABILITADO!" -ForegroundColor Green
        } else {
            Write-Host "ATENCAO: Ainda aparece como desabilitado. Aguarde alguns minutos." -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Aguarde 15-30 minutos para propagacao." -ForegroundColor Yellow
        Write-Host "Depois teste a conexao SMTP novamente no sistema." -ForegroundColor Yellow
        Write-Host ""
        
    } else {
        Write-Host "SMTP AUTH ja esta HABILITADO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Se ainda da erro, pode ser:" -ForegroundColor Yellow
        Write-Host "  - Propagacao (aguarde mais tempo)" -ForegroundColor White
        Write-Host "  - MFA habilitado (precisa senha de app)" -ForegroundColor White
        Write-Host "  - Politicas de seguranca" -ForegroundColor White
        Write-Host ""
    }
    
    # Desconectar
    Write-Host "Desconectando..." -ForegroundColor Yellow
    Disconnect-ExchangeOnline -Confirm:$false
    Write-Host "Desconectado!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique se voce tem permissoes de administrador." -ForegroundColor Yellow
    Write-Host "Ou tente executar como administrador." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
