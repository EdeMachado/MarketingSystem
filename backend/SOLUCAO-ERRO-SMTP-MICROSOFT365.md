# 🔧 Solução: Erro SMTP Microsoft 365

## ❌ ERRO ENCONTRADO:

```
535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant.
```

**Significado:** A autenticação SMTP básica está **DESABILITADA** no seu tenant do Microsoft 365.

---

## ✅ SOLUÇÕES (em ordem de prioridade):

### **SOLUÇÃO 1: Habilitar SMTP AUTH no Admin Center** ⭐ (Recomendada)

**Precisa de acesso de ADMINISTRADOR do Microsoft 365:**

1. **Acesse:** https://admin.microsoft.com
2. Vá em **"Configurações"** → **"Exibir todas as configurações"**
3. Clique em **"Email"**
4. Role até **"POP e IMAP"**
5. Procure por **"SMTP AUTH"** ou **"Permitir que aplicativos usem senhas menos seguras"**
6. **HABILITE** a opção para o usuário `contato@grupobiomed.com`
7. Salve as alterações
8. **Aguarde 5-10 minutos** para propagação

**OU via PowerShell (para administradores):**
```powershell
Set-CASMailbox -Identity contato@grupobiomed.com -SmtpClientAuthenticationDisabled $false
```

---

### **SOLUÇÃO 2: Habilitar para TODOS os usuários** (se tiver acesso)

1. Acesse: https://admin.microsoft.com
2. Vá em **"Configurações"** → **"Email"**
3. Clique em **"Autenticação moderna"**
4. **Habilite** "SMTP AUTH" para todos os usuários
5. Salve e aguarde propagação

---

### **SOLUÇÃO 3: Usar Autenticação Moderna (OAuth 2.0)** (Mais Seguro)

**Vantagem:** Mais seguro, não precisa habilitar SMTP AUTH básico

**Requer:** Configuração adicional no código para usar OAuth 2.0

Se o SMTP AUTH básico não puder ser habilitado, podemos implementar autenticação OAuth 2.0.

---

## 🔍 VERIFICAÇÕES:

### 1. Verificar se a conta pode usar SMTP AUTH:

**Via PowerShell (requer acesso admin):**
```powershell
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object SmtpClientAuthenticationDisabled
```

**Se retornar `True`**, significa que está desabilitado e precisa ser habilitado.

### 2. Verificar permissões da conta:

- A conta precisa ter licença do Microsoft 365
- A conta precisa ter permissão para enviar emails
- Verificar se não está bloqueada

---

## 🚀 AÇÃO IMEDIATA:

### **Se você tem acesso de ADMINISTRADOR:**

1. Siga a **SOLUÇÃO 1** acima
2. Aguarde 5-10 minutos
3. Teste novamente a conexão

### **Se NÃO tem acesso de ADMINISTRADOR:**

1. Entre em contato com o **administrador do Microsoft 365**
2. Peça para ele:
   - Habilitar SMTP AUTH para `contato@grupobiomed.com`
   - Ou habilitar SMTP AUTH globalmente
3. Compartilhe este link com ele: https://aka.ms/smtp_auth_disabled

---

## 📋 COMANDOS ÚTEIS (para administradores):

### Habilitar SMTP AUTH para um usuário específico:
```powershell
Set-CASMailbox -Identity contato@grupobiomed.com -SmtpClientAuthenticationDisabled $false
```

### Habilitar SMTP AUTH para todos os usuários:
```powershell
Get-CASMailbox -Filter {SmtpClientAuthenticationDisabled -eq $true} | Set-CASMailbox -SmtpClientAuthenticationDisabled $false
```

### Verificar status:
```powershell
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled
```

---

## ⚠️ ALTERNATIVAS (se não conseguir habilitar):

### Opção A: Usar outro método de envio
- Microsoft Graph API (requer token OAuth)
- SendGrid ou outro serviço de email
- Relay SMTP configurado

### Opção B: Implementar OAuth 2.0
- Mais seguro
- Não precisa SMTP AUTH básico
- Requer configuração adicional

---

## 📞 PRÓXIMOS PASSOS:

1. **Verificar se você tem acesso de administrador**
2. **Se SIM:** Habilitar SMTP AUTH seguindo SOLUÇÃO 1
3. **Se NÃO:** Contatar administrador com as instruções acima
4. **Aguardar 5-10 minutos** após habilitar
5. **Testar novamente** a conexão

---

## 🔗 LINKS ÚTEIS:

- **Erro oficial:** https://aka.ms/smtp_auth_disabled
- **Microsoft Admin Center:** https://admin.microsoft.com
- **Documentação:** https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission

---

**Status:** ⏳ Aguardando habilitação do SMTP AUTH no Microsoft 365

**Ação necessária:** Habilitar SMTP AUTH no admin center ou contatar administrador

