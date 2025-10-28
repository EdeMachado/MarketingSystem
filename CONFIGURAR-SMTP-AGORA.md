# 🚨 CONFIGURAR SMTP AGORA - Passo a Passo

## ❌ PROBLEMA IDENTIFICADO:

O sistema está tentando enviar emails, mas **o SMTP não está configurado**. Por isso você não recebe os emails mesmo a mensagem dizendo "enviado".

## ✅ SOLUÇÃO EM 3 PASSOS:

### 1️⃣ Criar Arquivo .env

Vá na pasta: `marketing-system/backend/`

Crie um arquivo chamado `.env` (sem extensão) com este conteúdo:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# Gmail SMTP (CONFIGURE AQUI!)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=aqui-vai-a-senha-de-app
SMTP_FROM="Grupo Biomed <seu-email@gmail.com>"

EMAIL_RATE_LIMIT=10
```

### 2️⃣ Obter Senha de App do Gmail

1. Acesse: **https://myaccount.google.com/security**
2. Ative **"Verificação em duas etapas"** (se não tiver)
3. Depois vá em **"Senhas de app"**
4. Clique em **"Selecionar app"** → escolha **"Email"**
5. Clique em **"Selecionar dispositivo"** → escolha **"Outro (personalizado)"**
6. Digite: **Marketing System**
7. Clique em **"Gerar"**
8. **COPIE A SENHA** (16 caracteres)
9. Cole no `.env` no campo `SMTP_PASS`

### 3️⃣ Reiniciar Backend

1. Pare o backend (Ctrl+C)
2. Inicie novamente: `npm run dev`
3. Deve aparecer: **"✅ SMTP configurado"**

---

## 🧪 TESTAR:

1. Vá em **"Configurações SMTP"** no menu
2. Clique em **"🔄 Testar Conexão"**
3. Deve aparecer: **"✅ SMTP configurado e funcionando!"**

---

## 📧 DEPOIS DE CONFIGURAR:

1. Vá em **"Campanhas"**
2. Clique em **"Executar"** na sua campanha
3. **Você vai receber os emails!** 📬

---

## ⚠️ IMPORTANTE:

- Use **Senha de App**, NÃO sua senha normal do Gmail
- A senha de app tem 16 caracteres
- Se der erro, verifique se copiou a senha corretamente (sem espaços)

---

**Configure agora e teste! 🚀**

