# 🔧 Soluções Alternativas - SMTP Microsoft 365

## ❌ Se ainda está dando erro após habilitar SMTP AUTH:

### **SOLUÇÃO 1: Aguardar Propagação** ⏰

**Aguarde 15-30 minutos** após habilitar. Mudanças no Microsoft 365 podem demorar para propagar.

---

### **SOLUÇÃO 2: Tentar Servidor Alternativo** 🔄

Atualize o `.env` com servidor alternativo:

**Opção A: smtp-mail.outlook.com**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Opção B: Tentar porta 25**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=25
```

**Opção C: Tentar porta 465 (SSL)**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=465
SMTP_SECURE=true
```

---

### **SOLUÇÃO 3: Verificar se Habilitou Corretamente** ✅

**Via PowerShell (com acesso admin):**
```powershell
# Verificar status
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled

# Se retornar True, está desabilitado - precisa habilitar:
Set-CASMailbox -Identity contato@grupobiomed.com -SmtpClientAuthenticationDisabled $false

# Verificar novamente (deve retornar False agora)
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled
```

---

### **SOLUÇÃO 4: Verificar MFA (Autenticação Multifator)** 🔐

Se o usuário tem **MFA (autenticação de dois fatores)** habilitado:

1. Precisa usar **senha de app** ao invés de senha normal
2. Ou desabilitar temporariamente MFA para testar
3. Ou usar autenticação moderna (OAuth 2.0)

**Como gerar senha de app no Microsoft 365:**
- https://mysignins.microsoft.com/security-info
- Adicionar método → Senha de app
- Usar a senha gerada no SMTP_PASS

---

### **SOLUÇÃO 5: Verificar Políticas de Segurança** 🛡️

O administrador pode ter políticas que bloqueiam SMTP AUTH mesmo habilitado:

1. Verificar **Políticas de Acesso Condicional**
2. Verificar **Políticas de Autenticação Moderna**
3. Verificar se a conta não está bloqueada

---

### **SOLUÇÃO 6: Usar Relay SMTP** 📡

Se sua empresa tem relay SMTP configurado:

1. Obter endereço do relay do administrador
2. Configurar no `.env`:
```env
SMTP_HOST=relay.grupobiomed.com  # Exemplo
SMTP_PORT=587
SMTP_USER=contato@grupobiomed.com
SMTP_PASS=sua-senha
```

---

### **SOLUÇÃO 7: Usar Serviço de Email Terceiro** 📧

Se nada funcionar, usar serviço dedicado:

**SendGrid** (Recomendado):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-do-sendgrid
```

**Amazon SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=sua-access-key
SMTP_PASS=sua-secret-key
```

---

## 🧪 TESTES RÁPIDOS:

### Teste 1: Verificar se SMTP AUTH está realmente habilitado
```powershell
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object SmtpClientAuthenticationDisabled
```
**Resultado esperado:** `False` (significa habilitado)

### Teste 2: Tentar conectar via telnet (se disponível)
```bash
telnet smtp.office365.com 587
```
Deve conectar sem erro.

---

## 📋 CHECKLIST DE TROUBLESHOOTING:

- [ ] Aguardou 15-30 minutos após habilitar?
- [ ] SMTP AUTH está realmente habilitado (verificado via PowerShell)?
- [ ] Tentou servidor alternativo (smtp-mail.outlook.com)?
- [ ] Verificou se há MFA habilitado (precisa senha de app)?
- [ ] Verificou políticas de segurança/bloqueio?
- [ ] Tentou reiniciar o backend após mudanças?
- [ ] Verificou se a senha está correta (sem espaços extras)?

---

## 🚀 AÇÃO IMEDIATA:

1. **Verificar status via PowerShell:**
   ```powershell
   Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object SmtpClientAuthenticationDisabled
   ```

2. **Se retornar `True`**, execute:
   ```powershell
   Set-CASMailbox -Identity contato@grupobiomed.com -SmtpClientAuthenticationDisabled $false
   ```

3. **Aguardar 30 minutos**

4. **Testar servidor alternativo:**
   - Atualizar `.env` com `smtp-mail.outlook.com`
   - Reiniciar backend
   - Testar conexão

5. **Se ainda não funcionar:**
   - Verificar MFA
   - Contatar administrador
   - Considerar serviço terceiro (SendGrid)

---

## 📞 PRÓXIMOS PASSOS:

**Qual erro específico aparece agora?**

Me envie a mensagem de erro completa para eu poder ajudar melhor!

