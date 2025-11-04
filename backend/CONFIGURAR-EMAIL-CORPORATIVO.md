# 📧 Configurar Email Corporativo - grupobiomed.com

## 🎯 Email Corporativo

Vamos configurar o SMTP para o email corporativo do **grupobiomed.com**.

---

## 🔍 IDENTIFICANDO O PROVEDOR

O domínio `grupobiomed.com` pode usar diferentes provedores. Precisamos identificar qual:

### Opções Mais Comuns:

1. **Google Workspace (Gmail Empresarial)**
   - SMTP: `smtp.gmail.com:587`
   - Mesma configuração do Gmail normal
   - Precisa de senha de app

2. **Microsoft 365 / Outlook Empresarial**
   - SMTP: `smtp.office365.com:587`
   - Ou: `smtp-mail.outlook.com:587`
   - Usa senha normal ou autenticação moderna

3. **Provedor Personalizado (cPanel, Zimbra, etc)**
   - SMTP varia conforme o servidor
   - Geralmente: `mail.grupobiomed.com` ou `smtp.grupobiomed.com`

---

## 📋 O QUE PRECISAMOS SABER:

Para configurar corretamente, preciso de:

1. **Email completo:** (ex: contato@grupobiomed.com)
2. **Senha:** (senha do email corporativo)
3. **Provedor:** Qual provedor você usa?
   - Google Workspace?
   - Microsoft 365?
   - Outro? (qual?)

---

## 🔑 CONFIGURAÇÕES POR PROVEDOR:

### ✅ GOOGLE WORKSPACE (Gmail Empresarial)

**SMTP:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@grupobiomed.com
SMTP_PASS=senha-de-app (precisa gerar senha de app)
SMTP_FROM="Grupo Biomed <seu-email@grupobiomed.com>"
```

**Como gerar senha de app:**
1. Acesse: https://admin.google.com (conta admin)
2. Ou: https://myaccount.google.com/apppasswords
3. Gere senha de app para "Email"

---

### ✅ MICROSOFT 365 / OUTLOOK

**SMTP:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=seu-email@grupobiomed.com
SMTP_PASS=senha-normal (pode precisar autenticação moderna)
SMTP_FROM="Grupo Biomed <seu-email@grupobiomed.com>"
```

**Ou alternativo:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

---

### ✅ PROVEDOR PERSONALIZADO (cPanel, etc)

**SMTP:**
```env
SMTP_HOST=mail.grupobiomed.com
SMTP_PORT=587
SMTP_USER=seu-email@grupobiomed.com
SMTP_PASS=senha-do-email
SMTP_FROM="Grupo Biomed <seu-email@grupobiomed.com>"
```

---

## 🚀 AÇÃO IMEDIATA

**Me informe:**

1. ✅ **Email completo:** (ex: contato@grupobiomed.com)
2. ✅ **Senha:** (senha do email ou senha de app)
3. ✅ **Provedor:** 
   - [ ] Google Workspace
   - [ ] Microsoft 365
   - [ ] Outro: _______________

**Com essas informações, eu configuro tudo automaticamente!** 🎯

---

## 💡 COMO IDENTIFICAR O PROVEDOR:

**Se você acessa email via:**
- `https://mail.google.com` ou `https://gmail.com` → **Google Workspace**
- `https://outlook.office.com` ou `https://outlook.com` → **Microsoft 365**
- `https://mail.grupobiomed.com` ou outro → **Provedor Personalizado**

**Ou pergunte ao administrador do domínio!**

---

**Aguardando suas informações para configurar! 🚀**

