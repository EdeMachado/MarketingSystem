# ⚡ CONFIGURAR SMTP - OPÇÕES RÁPIDAS

## 🎯 OPÇÃO 1: Script Automático (MAIS FÁCIL)

### Windows:
1. Abra o terminal na pasta `marketing-system/backend`
2. Execute: `node configurar-smtp.js`
3. Siga as instruções na tela
4. ✅ Pronto!

### Ou use o arquivo .bat:
1. Duplo clique em `CONFIGURAR-SMTP.bat`
2. Siga as instruções

---

## 🎯 OPÇÃO 2: Manual (se preferir)

### 1. Criar/Editar arquivo `.env` em `marketing-system/backend/`

### 2. Adicionar este conteúdo:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=SEU-EMAIL@gmail.com
SMTP_PASS=SUA-SENHA-DE-APP
SMTP_FROM="Grupo Biomed <SEU-EMAIL@gmail.com>"

EMAIL_RATE_LIMIT=10
```

### 3. Substituir:
- `SEU-EMAIL@gmail.com` pelo seu email
- `SUA-SENHA-DE-APP` pela senha de app (16 caracteres)

---

## 📱 COMO OBTER SENHA DE APP (Gmail):

1. Acesse: https://myaccount.google.com/security
2. Ative **"Verificação em duas etapas"** (se não tiver)
3. Vá em **"Senhas de app"** (ou "App passwords")
4. Selecione **"Email"** → **"Outro (personalizado)"**
5. Digite: **"Marketing System"**
6. Clique em **"Gerar"**
7. **COPIE** a senha (16 caracteres)
8. Cole no `.env` em `SMTP_PASS`

---

## ✅ DEPOIS DE CONFIGURAR:

1. **Reinicie o backend:**
   ```bash
   # Pare (Ctrl+C)
   npm run dev
   ```

2. **Teste no sistema:**
   - Vá em **"Configurações SMTP"**
   - Clique em **"🔄 Testar Conexão"**
   - Deve aparecer ✅

3. **Execute uma campanha:**
   - Vá em **"Campanhas"**
   - Clique em **"Executar"**
   - 📧 Você deve receber os emails!

---

## ❓ PROBLEMAS COMUNS:

### "Authentication failed"
- ✅ Verifique se está usando **senha de app**, não senha normal
- ✅ Remova espaços da senha de app

### "Connection refused"
- ✅ Verifique se `SMTP_HOST` e `SMTP_PORT` estão corretos
- ✅ Gmail: `smtp.gmail.com:587`

### Não recebe emails
- ✅ Verifique a pasta de SPAM
- ✅ Verifique se o email está correto
- ✅ Veja os logs do backend para mais detalhes

---

**Boa sorte! 🚀**

