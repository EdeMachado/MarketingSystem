# ⚡ CONFIGURAR GMAIL EM 2 MINUTOS

## 🚀 PASSO A PASSO SUPER RÁPIDO:

### 1️⃣ GERAR SENHA DE APP (Google):

1. **Acesse:** https://myaccount.google.com/security
2. **Ative** "Verificação em duas etapas" (se não tiver)
3. Clique em **"Senhas de app"** (ou "App passwords")
4. Selecione **"Email"** → **"Outro (personalizado)"**
5. Digite: **"Marketing System"**
6. Clique em **"Gerar"**
7. **COPIE A SENHA** (16 caracteres, tipo: `abcd efgh ijkl mnop`)

### 2️⃣ CONFIGURAR NO ARQUIVO .env:

Abra o arquivo: `marketing-system/backend/.env`

**Edite estas 3 linhas:**
```env
SMTP_USER=COLOQUE-SEU-EMAIL@gmail.com
SMTP_PASS=COLE-A-SENHA-DE-APP-AQUI
SMTP_FROM="Grupo Biomed <COLOQUE-SEU-EMAIL@gmail.com>"
```

**Exemplo:**
```env
SMTP_USER=joao.silva@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM="Grupo Biomed <joao.silva@gmail.com>"
```

### 3️⃣ REINICIAR BACKEND:

- Pare o backend (Ctrl+C)
- Inicie: `npm run dev`
- Deve aparecer: **"✅ SMTP configurado"**

### 4️⃣ TESTAR:

- Vá em **"Configurações SMTP"**
- Clique em **"🔄 Testar Conexão"**
- ✅ **Pronto!** Agora pode enviar emails!

---

## ⚠️ IMPORTANTE:

- Use **senha de app**, NÃO sua senha normal
- Remove espaços da senha se copiar com espaços
- Se der erro, verifique se copiou a senha corretamente

---

**Pronto! Configure e teste! 🚀**

