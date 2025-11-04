# 🔧 Como Configurar SendGrid - Guia Completo

## ❌ Erro Atual
```
Invalid login: 535 Authentication failed: The provided authorization grant is invalid, expired, or revoked
```

Isso significa que a **API Key do SendGrid está inválida, expirada ou foi revogada**.

---

## ✅ Solução Passo a Passo

### 1️⃣ Acessar o Painel do SendGrid

1. Acesse: https://app.sendgrid.com/
2. Faça login na sua conta SendGrid

### 2️⃣ Verificar/Criar API Key

1. No menu lateral, vá em **Settings** → **API Keys**
2. Você verá a lista de API Keys existentes
3. **Opção A - Se já existe uma API Key:**
   - Verifique se está **ativa** (não revogada)
   - Verifique se tem permissão **"Mail Send"**
   - Se estiver revogada ou sem permissão, **revogue** e crie uma nova

4. **Opção B - Criar nova API Key:**
   - Clique em **"Create API Key"**
   - Escolha **"Full Access"** (recomendado) ou **"Restricted Access"** com permissão "Mail Send"
   - Dê um nome (ex: "Marketing System")
   - Clique em **"Create & View"**
   - ⚠️ **IMPORTANTE:** Copie a API Key **Imediatamente**! Ela só aparece uma vez!
   - Cole no arquivo `.env` na variável `SMTP_PASS`

### 3️⃣ Atualizar o arquivo .env

1. Abra o arquivo `backend/.env`
2. Localize a linha:
   ```
   SMTP_PASS=FHRWTGT5MP542JMZPV3UADPC
   ```
3. Substitua pela nova API Key:
   ```
   SMTP_PASS=SUA_NOVA_API_KEY_AQUI
   ```
4. Salve o arquivo

### 4️⃣ Verificar Domínio/Remetente

O SendGrid precisa que você verifique o domínio ou configure um "Single Sender":

**Opção A - Verificar Domínio (Recomendado):**
1. Vá em **Settings** → **Sender Authentication**
2. Clique em **"Authenticate Your Domain"**
3. Siga as instruções para adicionar registros DNS
4. Isso permite enviar de qualquer email do domínio `@grupobiomed.com`

**Opção B - Single Sender Verification (Mais Rápido):**
1. Vá em **Settings** → **Sender Authentication**
2. Clique em **"Verify a Single Sender"**
3. Preencha:
   - **From Email Address:** `contato@grupobiomed.com`
   - **From Name:** `GRUPO BIOMED`
   - **Reply To:** `contato@grupobiomed.com`
4. Confirme o email de verificação
5. Aguarde aprovação (pode levar algumas horas)

### 5️⃣ Testar a Configuração

Após atualizar a API Key, execute:

```bash
cd backend
node test-sendgrid.js
```

Se funcionar, você verá:
```
✅ Conexão com SendGrid estabelecida com sucesso!
✅ Email de teste enviado com sucesso!
```

---

## 🔍 Troubleshooting

### Erro: "API Key inválida"
- Verifique se copiou a API Key completa (geralmente começa com `SG.`)
- Não deve ter espaços ou quebras de linha
- Verifique se a API Key está ativa no painel

### Erro: "The from address does not match a verified Sender Identity"
- Você precisa verificar o domínio ou o email remetente
- Siga o passo 4 acima

### Erro: "Permission denied"
- A API Key precisa ter permissão "Mail Send"
- Crie uma nova API Key com permissões corretas

---

## 📝 Configuração Final no .env

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SUA_API_KEY_AQUI
SMTP_FROM="GRUPO BIOMED <contato@grupobiomed.com>"
```

---

## ✅ Checklist

- [ ] API Key criada no SendGrid
- [ ] API Key copiada e colada no `.env`
- [ ] Domínio ou Single Sender verificado
- [ ] Teste executado com sucesso
- [ ] Backend reiniciado após alterar `.env`

---

## 🆘 Precisa de Ajuda?

1. Verifique a documentação: https://docs.sendgrid.com/
2. Suporte SendGrid: https://support.sendgrid.com/

