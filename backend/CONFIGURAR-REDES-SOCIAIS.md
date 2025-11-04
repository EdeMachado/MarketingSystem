# 📱 Configuração de Redes Sociais - WhatsApp, Facebook, Instagram, LinkedIn

## ✅ RESUMO DO QUE PRECISA CONFIGURAR

### 1. **WhatsApp Business API** ⚠️ FALTA CONFIGURAR
### 2. **Facebook** ⚠️ PRECISA CONTA/PÁGINA
### 3. **Instagram** ⚠️ PRECISA CONTA/PÁGINA
### 4. **LinkedIn** ⚠️ PRECISA CONTA/PÁGINA

---

## 📱 1. WHATSAPP BUSINESS API

### O que é:
- API oficial do WhatsApp para envio de mensagens em massa
- **NÃO** é o WhatsApp Web comum
- Precisa de um serviço intermediário (Evolution API, Twilio, etc.)

### Como funciona:
1. Você contrata um serviço (Evolution API, Twilio, etc.)
2. Faz conexão do número de telefone
3. Obtém API Key e Instance ID
4. Configura no sistema

### O que precisa:
```env
WHATSAPP_API_URL=https://api.evolution-api.com
WHATSAPP_API_KEY=sua-api-key-aqui
WHATSAPP_INSTANCE_ID=sua-instancia-id
```

### Opções de Serviço:
1. **Evolution API** (Recomendado - Open Source)
   - Link: https://evolution-api.com
   - Custo: Gratuito (self-hosted) ou pago (hosted)
   - Precisa: Servidor próprio ou usar versão hosted

2. **Twilio WhatsApp API**
   - Link: https://www.twilio.com/whatsapp
   - Custo: ~$0.005 por mensagem
   - Precisa: Conta Twilio + número verificado

3. **360Dialog**
   - Link: https://www.360dialog.com
   - Custo: Variável
   - Precisa: Conta comercial

### Passos para configurar:
1. Escolher serviço (Evolution API recomendado)
2. Criar conta e obter credenciais
3. Conectar número de telefone
4. Adicionar no `.env` do backend
5. Testar conexão

---

## 📘 2. FACEBOOK

### O que é:
- API do Facebook para criar posts em páginas
- Precisa de uma **Página do Facebook** (não perfil pessoal)

### O que precisa ter:
1. ✅ **Conta Facebook** (já tem)
2. ✅ **Página do Facebook** (precisa criar se não tiver)
3. ✅ **App no Facebook Developers** (precisa criar)
4. ✅ **Access Token** (gerar)

### Passos para configurar:

#### 1. Criar Página do Facebook (se não tiver):
1. Acesse: https://www.facebook.com/pages/create
2. Escolha "Empresa ou Marca"
3. Preencha nome (ex: "GRUPO BIOMED")
4. Clique em "Criar Página"

#### 2. Criar App no Facebook Developers:
1. Acesse: https://developers.facebook.com
2. Clique em "Meus Apps" → "Criar App"
3. Tipo: "Empresa" ou "Outro"
4. Preencha nome (ex: "Marketing System")
5. Clique em "Criar App"

#### 3. Adicionar Produto "Facebook Login":
1. No app criado, clique em "Adicionar Produto"
2. Escolha "Facebook Login"
3. Configure (pode usar configurações padrão)

#### 4. Obter Access Token:
1. Acesse: https://developers.facebook.com/tools/explorer
2. Selecione seu app
3. Em "Permissões", adicione: `pages_manage_posts`, `pages_read_engagement`
4. Clique em "Gerar Token de Acesso"
5. Copie o token

#### 5. Obter Page ID:
1. Acesse sua página: https://www.facebook.com/sua-pagina
2. Clique em "Sobre" ou "Configurações"
3. Role até "ID da página" (ou use ferramenta: https://findmyfbid.in)
4. Copie o ID

#### 6. Configurar no sistema:
```env
FACEBOOK_APP_ID=seu-app-id
FACEBOOK_APP_SECRET=seu-app-secret
FACEBOOK_ACCESS_TOKEN=seu-access-token
FACEBOOK_PAGE_ID=seu-page-id
```

---

## 📷 3. INSTAGRAM

### O que é:
- API do Instagram para criar posts (via Facebook Graph API)
- Precisa estar vinculado a uma **Conta de Negócios do Instagram**

### O que precisa ter:
1. ✅ **Conta Instagram** (já tem)
2. ✅ **Conta de Negócios** (converter se for pessoal)
3. ✅ **Página do Facebook** (necessário para vincular)
4. ✅ **Instagram Business Account ID** (obter)

### Passos para configurar:

#### 1. Converter para Conta de Negócios (se não tiver):
1. Abra Instagram no celular
2. Vá em "Configurações" → "Conta"
3. Toque em "Mudar para conta profissional"
4. Escolha "Empresa"
5. Conecte à sua Página do Facebook

#### 2. Obter Instagram Account ID:
1. Acesse: https://developers.facebook.com/tools/explorer
2. Selecione seu app
3. Em "IDs", procure seu Instagram Account ID
4. Ou use: https://www.instagram.com/seu-perfil/?__a=1 (ver JSON)
5. Copie o ID

#### 3. Obter Access Token:
- Use o mesmo token do Facebook (se tiver permissões corretas)
- Ou gere um novo com permissões do Instagram:
  - `instagram_basic`
  - `instagram_content_publish`
  - `pages_show_list`

#### 4. Configurar no sistema:
```env
INSTAGRAM_ACCESS_TOKEN=seu-instagram-token
INSTAGRAM_ACCOUNT_ID=seu-account-id
FACEBOOK_ACCESS_TOKEN=seu-facebook-token  # Mesmo do Facebook
```

---

## 💼 4. LINKEDIN

### O que é:
- API do LinkedIn para criar posts em páginas
- Precisa de uma **Página da Empresa no LinkedIn**

### O que precisa ter:
1. ✅ **Perfil LinkedIn pessoal** (já tem)
2. ✅ **Página da Empresa no LinkedIn** (precisa criar)
3. ✅ **App no LinkedIn Developers** (precisa criar)
4. ✅ **Access Token** (gerar)

### Passos para configurar:

#### 1. Criar Página da Empresa (se não tiver):
1. Acesse: https://www.linkedin.com/company/setup/new/
2. Preencha informações da empresa
3. Clique em "Criar página"

#### 2. Criar App no LinkedIn Developers:
1. Acesse: https://www.linkedin.com/developers/apps
2. Clique em "Criar app"
3. Preencha:
   - Nome do app
   - URL do site
   - Logo
   - Email de contato
4. Selecione produtos:
   - "Sign In with LinkedIn using OpenID Connect"
   - "Marketing Developer Platform" (se disponível)
5. Clique em "Criar app"

#### 3. Obter Access Token:
1. No app criado, vá em "Auth"
2. Em "Redirect URLs", adicione: `http://localhost:3001/callback`
3. Em "Products", adicione permissões:
   - `w_member_social` (para posts)
   - `r_liteprofile`
4. Use OAuth 2.0 para gerar token
5. Ou use ferramenta: https://www.linkedin.com/oauth/v2/authorization

#### 4. Obter Page ID:
1. Acesse sua página: https://www.linkedin.com/company/sua-empresa
2. Na URL, veja o número após `/company/`
3. Ou use API: `GET /v2/organizations`

#### 5. Configurar no sistema:
```env
LINKEDIN_CLIENT_ID=seu-client-id
LINKEDIN_CLIENT_SECRET=seu-client-secret
LINKEDIN_ACCESS_TOKEN=seu-access-token
LINKEDIN_ORG_ID=seu-org-id
```

---

## 📊 RESUMO - O QUE PRECISA FAZER

### WhatsApp:
- ✅ Código implementado
- ❌ Falta: Contratar serviço (Evolution API, Twilio, etc.)
- ❌ Falta: Obter credenciais (API Key, Instance ID)
- ❌ Falta: Configurar no `.env`

### Facebook:
- ✅ Código implementado
- ❌ Falta: Criar Página do Facebook (se não tiver)
- ❌ Falta: Criar App no Facebook Developers
- ❌ Falta: Obter Access Token e Page ID
- ❌ Falta: Configurar no `.env`

### Instagram:
- ✅ Código implementado
- ❌ Falta: Converter para Conta de Negócios (se não tiver)
- ❌ Falta: Vincular ao Facebook
- ❌ Falta: Obter Instagram Account ID
- ❌ Falta: Configurar no `.env`

### LinkedIn:
- ✅ Código implementado
- ❌ Falta: Criar Página da Empresa (se não tiver)
- ❌ Falta: Criar App no LinkedIn Developers
- ❌ Falta: Obter Access Token e Org ID
- ❌ Falta: Configurar no `.env`

---

## 🎯 PRIORIDADE DE CONFIGURAÇÃO

### 1. **WhatsApp** (Alta Prioridade)
- Mais usado para marketing direto
- Precisa de serviço pago (mas pode ser barato)
- Recomendado: Evolution API (open source)

### 2. **Facebook** (Média Prioridade)
- Útil para alcance orgânico
- Precisa apenas de Página (gratuito)
- App Developers é gratuito

### 3. **Instagram** (Média Prioridade)
- Vinculado ao Facebook
- Se já tem Facebook configurado, é mais fácil
- Precisa de Conta de Negócios

### 4. **LinkedIn** (Baixa Prioridade)
- Mais para B2B
- Processo mais complexo de aprovação
- Pode deixar para depois

---

## 💡 DICA IMPORTANTE

**Você NÃO precisa configurar tudo de uma vez!**

- Configure apenas o que vai usar agora
- Sistema funciona mesmo se só tiver Email configurado
- Você pode adicionar outros canais depois

**Ordem recomendada:**
1. ✅ Email (já está configurado - SendGrid)
2. ⚠️ WhatsApp (se quiser usar)
3. ⚠️ Facebook (se quiser usar)
4. ⚠️ Instagram (se quiser usar)
5. ⚠️ LinkedIn (se quiser usar)

---

## 📝 ONDE CONFIGURAR

Todas as configurações vão no arquivo: `backend/.env`

Após adicionar as credenciais, reinicie o servidor:
```bash
cd backend
npm run dev
```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

Acesse: http://localhost:3002/configuracoes

Você verá o status de cada integração:
- ✅ Verde: Configurado e conectado
- ⚠️ Amarelo: Configurado mas não conectado
- ❌ Vermelho: Não configurado

