# 📧 Como Configurar SMTP para Enviar Emails

## ⚠️ IMPORTANTE: SMTP NÃO CONFIGURADO

O sistema está tentando enviar emails, mas **o SMTP não está configurado**. Por isso você não recebe os emails.

## 🚀 SOLUÇÃO RÁPIDA (Gmail):

### 1️⃣ Criar Senha de App no Gmail:

1. Acesse: https://myaccount.google.com/security
2. Vá em **"Verificação em duas etapas"** (ative se não tiver)
3. Depois vá em **"Senhas de app"**
4. Selecione **"Email"** e **"Outro (personalizado)"**
5. Digite "Marketing System"
6. Clique em **"Gerar"**
7. **COPIE A SENHA** (16 caracteres)

### 2️⃣ Criar Arquivo .env:

Crie o arquivo `.env` na pasta `marketing-system/backend/` com:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=aqui-vai-a-senha-de-app-gerada
SMTP_FROM="Grupo Biomed <seu-email@gmail.com>"

EMAIL_RATE_LIMIT=10
```

**Substitua:**
- `seu-email@gmail.com` pelo seu email
- `aqui-vai-a-senha-de-app-gerada` pela senha de app gerada

### 3️⃣ Reiniciar Backend:

Pare o backend (Ctrl+C) e inicie novamente.

### 4️⃣ Testar:

1. Vá em **"Campanhas"**
2. Crie uma nova campanha
3. Execute
4. **Verifique sua caixa de entrada!**

---

## 📋 Outros Provedores de Email:

### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

### Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha-de-app
```

### SendGrid (Recomendado para produção):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-do-sendgrid
```

---

## ✅ Verificar Configuração:

Após configurar, o console do backend deve mostrar:
```
✅ SMTP configurado
```

Se mostrar erro, verifique:
- Senha de app correta (Gmail)
- Email correto
- Servidor SMTP correto
- Porta correta (geralmente 587)

---

**Depois de configurar, seus emails serão enviados! 📧**

