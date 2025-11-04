# 🔍 Como Verificar SMTP AUTH no Microsoft 365

## 📋 MÉTODO 1: Via PowerShell (Requer Módulo Exchange Online)

### Passo 1: Abrir PowerShell como Administrador

1. Pressione `Win + X`
2. Selecione "Windows PowerShell (Admin)" ou "Terminal (Admin)"

### Passo 2: Instalar Módulo Exchange Online (se necessário)

```powershell
Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force
```

Se pedir confirmação, digite `Y` e pressione Enter.

### Passo 3: Conectar ao Exchange Online

```powershell
Connect-ExchangeOnline
```

Vai abrir uma janela para fazer login. Use sua conta de administrador do Microsoft 365.

### Passo 4: Verificar Status

```powershell
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled
```

**Resultado esperado:**
- `SmtpClientAuthenticationDisabled: False` = ✅ HABILITADO
- `SmtpClientAuthenticationDisabled: True` = ❌ DESABILITADO

### Passo 5: Habilitar (se necessário)

Se retornar `True`, execute:

```powershell
Set-CASMailbox -Identity contato@grupobiomed.com -SmtpClientAuthenticationDisabled $false
```

### Passo 6: Verificar Novamente

```powershell
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled
```

Agora deve retornar `False` (habilitado).

### Passo 7: Desconectar

```powershell
Disconnect-ExchangeOnline
```

---

## 📋 MÉTODO 2: Via Admin Center (Interface Web)

1. Acesse: https://admin.microsoft.com
2. Login com conta de administrador
3. Vá em **"Usuários"** → **"Usuários ativos"**
4. Procure por: `contato@grupobiomed.com`
5. Clique no nome
6. Vá na aba **"Email"**
7. Role até **"Autenticação de email"**
8. Procure por **"SMTP AUTH"** ou **"Autenticação de cliente SMTP"**
9. Verifique se está **habilitado**

---

## 📋 MÉTODO 3: Usar o Script Automático

Execute o script que criei:

```powershell
cd "C:\Users\Ede Machado\MarketingSystem\backend"
.\verificar-smtp-auth.ps1
```

**Se der erro de permissão:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois execute o script novamente.

---

## ✅ VERIFICAÇÃO RÁPIDA (PowerShell Simples)

Se você tem acesso admin, cole tudo de uma vez:

```powershell
# Instalar módulo
Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force

# Conectar
Connect-ExchangeOnline

# Verificar
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled

# Se retornar True, habilitar:
Set-CASMailbox -Identity contato@grupobiomed.com -SmtpClientAuthenticationDisabled $false

# Verificar novamente
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled

# Desconectar
Disconnect-ExchangeOnline
```

---

## 🚨 IMPORTANTE:

- Precisa de **acesso de ADMINISTRADOR** do Microsoft 365
- Pode pedir autenticação MFA (dois fatores)
- Mudanças podem levar **15-30 minutos** para propagar

---

## 📞 PRÓXIMOS PASSOS:

1. Execute a verificação usando um dos métodos acima
2. Me informe o resultado (`True` ou `False`)
3. Se estiver `True`, habilite e aguarde propagação
4. Teste novamente a conexão SMTP no sistema

