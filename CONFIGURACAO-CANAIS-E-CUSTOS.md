# 🔌 Configuração de Canais e Controle de Custos

## 📊 Resumo: Custos e Limites

### ✅ **CANAIS GRATUITOS** (com limites)

| Canal | Limite Gratuito | O que acontece ao ultrapassar |
|-------|----------------|-------------------------------|
| **Email (Gmail)** | 500 emails/dia | Envio bloqueado até próximo dia |
| **Instagram** | Ilimitado | ✅ Totalmente gratuito |
| **Facebook** | Ilimitado | ✅ Totalmente gratuito |
| **LinkedIn** | Ilimitado (API básica) | ✅ Totalmente gratuito |
| **Telegram** | Ilimitado | ✅ Totalmente gratuito |
| **SEO/Buscadores** | Ilimitado | ✅ Totalmente gratuito (orgânico) |

### 💰 **CANAIS PAGOS**

| Canal | Modelo de Custo | Controle |
|-------|----------------|----------|
| **WhatsApp** | Por mensagem (Evolution API) | ⚠️ Precisamos configurar limite |
| **Google Places API** | $200/mês gratuito | ✅ Já temos controle |

---

## 🔧 COMO CONFIGURAR CADA CANAL

### 1️⃣ **Email (SMTP/Gmail)** ✅ JÁ TEMOS SISTEMA

**Status:** Sistema pronto, só precisa configurar

**Como configurar:**
```bash
cd backend
node configurar-smtp.js
```

Ou editar `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app  # Senha de app do Gmail
```

**Limite:** 500 emails/dia (Gmail gratuito)
**Custo:** Gratuito até 500/dia
**Alerta:** Sistema vai alertar quando próximo de 500/dia

---

### 2️⃣ **WhatsApp** ⚠️ PRECISA CONFIGURAR

**Status:** Sistema pronto, precisa de API key

**Como configurar:**
1. Criar conta em serviço de WhatsApp API (Evolution API, Twilio, etc)
2. Obter API Key e Instance ID
3. Editar `.env`:
```env
WHATSAPP_API_URL=https://api.evolution-api.com
WHATSAPP_API_KEY=sua-api-key
WHATSAPP_INSTANCE_ID=sua-instancia-id
```

**Custo:** Variável (geralmente ~$0.005 a $0.01 por mensagem)
**Alerta:** ⚠️ **PRECISA DEFINIR LIMITE MENSAL** para controlar custos

---

### 3️⃣ **Instagram** ✅ GRATUITO (via Facebook)

**Status:** Sistema pronto, precisa de Facebook App

**Como configurar:**
1. Criar app no Facebook Developers: https://developers.facebook.com
2. Conectar Instagram Business Account
3. Obter tokens
4. Editar `.env`:
```env
FACEBOOK_ACCESS_TOKEN=seu-token-facebook
FACEBOOK_PAGE_ID=id-da-pagina
INSTAGRAM_ACCOUNT_ID=id-da-conta-instagram
```

**Custo:** ✅ **GRATUITO** (ilimitado)
**Alerta:** Não precisa (gratuito)

---

### 4️⃣ **Facebook** ✅ GRATUITO

**Status:** Sistema pronto, usa mesmo token do Instagram

**Como configurar:**
- Mesmo processo do Instagram (acima)
- Usa `FACEBOOK_ACCESS_TOKEN` e `FACEBOOK_PAGE_ID`

**Custo:** ✅ **GRATUITO** (ilimitado)
**Alerta:** Não precisa (gratuito)

---

### 5️⃣ **LinkedIn** ⚠️ PRECISA IMPLEMENTAR

**Status:** Não implementado ainda

**Como configurar (quando implementarmos):**
1. Criar app no LinkedIn Developers
2. Obter Client ID e Secret
3. Editar `.env`:
```env
LINKEDIN_CLIENT_ID=seu-client-id
LINKEDIN_CLIENT_SECRET=seu-client-secret
```

**Custo:** ✅ **GRATUITO** (API básica de posts)
**Alerta:** Não precisa (gratuito)

---

### 6️⃣ **Telegram** ⚠️ PRECISA IMPLEMENTAR

**Status:** Não implementado ainda

**Como configurar (quando implementarmos):**
1. Criar bot no Telegram via @BotFather
2. Obter Bot Token
3. Editar `.env`:
```env
TELEGRAM_BOT_TOKEN=seu-bot-token
TELEGRAM_CHAT_ID=id-do-canal-ou-chat
```

**Custo:** ✅ **GRATUITO** (ilimitado)
**Alerta:** Não precisa (gratuito)

---

### 7️⃣ **SEO/Buscadores (Google, Bing, etc)** ✅ GRATUITO

**Status:** Sistema pronto

**Como funciona:**
- Cria páginas SEO otimizadas
- Google/Bing indexa automaticamente
- Não precisa de API ou pagamento

**Custo:** ✅ **GRATUITO** (100% orgânico)
**Alerta:** Não precisa (gratuito)

---

## 🚨 SISTEMA DE ALERTAS DE CUSTOS

### Canais que PRECISAM de alerta:

1. **Email (Gmail)**
   - Limite: 500/dia
   - Alerta em: 400 emails (80%)
   - Alerta crítico: 480 emails (96%)

2. **WhatsApp**
   - ⚠️ **VOCÊ PRECISA DEFINIR:**
     - Limite mensal máximo (ex: $50/mês)
     - Custo por mensagem
   - Alerta em: 70% do limite
   - Alerta crítico: 90% do limite

3. **Google Places API**
   - Limite: $200/mês
   - Alerta em: $140 (70%)
   - Alerta crítico: $180 (90%)
   - ✅ **JÁ TEMOS CONTROLE**

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

- [ ] Email (SMTP) - Configurar
- [ ] WhatsApp - Configurar + definir limite de custo
- [ ] Instagram - Configurar (via Facebook)
- [ ] Facebook - Configurar (mesmo do Instagram)
- [ ] LinkedIn - Implementar depois
- [ ] Telegram - Implementar depois
- [ ] SEO - ✅ Já funciona (sem config)

---

## 💡 RECOMENDAÇÕES

1. **Comece pelos gratuitos:** Email, Instagram, Facebook
2. **WhatsApp:** Defina limite mensal antes de usar muito
3. **Telegram/LinkedIn:** Podemos implementar depois
4. **Sistema de alertas:** Vai avisar antes de ultrapassar limites

---

## ❓ PRÓXIMOS PASSOS

1. Eu configuro o sistema de alertas para todos os canais
2. Você configura as APIs (Email, WhatsApp, Instagram/Facebook)
3. Você define o limite mensal do WhatsApp
4. Sistema vai alertar automaticamente quando próximo dos limites

**Posso configurar tudo automaticamente no código, só preciso que você:**
- Configure as APIs (Email, WhatsApp, Instagram/Facebook)
- Defina limite mensal do WhatsApp (ex: $50/mês)


