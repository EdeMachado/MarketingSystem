# 🔑 Como Obter Google Places API Key

## 📋 Passo a Passo Rápido

### 1. Acessar Google Cloud Console
- **URL**: https://console.cloud.google.com/
- Faça login com sua conta Google

### 2. Criar ou Selecionar Projeto
- Clique no menu de projetos (topo da página)
- Clique em **"Novo Projeto"**
- Nome: `Marketing System` (ou outro de sua preferência)
- Clique em **"Criar"**

### 3. Ativar Google Places API
- No menu lateral, vá em **"APIs e Serviços"** > **"Biblioteca"**
- Procure por: **"Places API"** ou **"Places API (New)"**
- Clique no resultado
- Clique em **"Ativar"**

> ⚠️ **Importante**: Você também precisa ativar a **"Places API (New)"** que é a versão mais recente.

### 4. Criar Credencial (API Key)
- Vá em **"APIs e Serviços"** > **"Credenciais"**
- Clique em **"+ CRIAR CREDENCIAIS"**
- Selecione **"Chave de API"**
- A chave será criada automaticamente
- **COPIE A CHAVE** (ela aparece apenas uma vez)

### 5. Configurar Restrições (Recomendado)
- Clique na chave criada para editá-la
- **Restrições de aplicativo**:
  - Selecione **"Limitar chave"**
  - Em **"Restringir chave"**, escolha conforme necessário:
    - **Nenhum** (mais fácil, mas menos seguro)
    - **IPs HTTP referrers** (para produção)
- **Restrições de API**:
  - Selecione **"Limitar chave"**
  - Selecione apenas: **"Places API"** e **"Places API (New)"**
- Clique em **"Salvar"**

### 6. Adicionar no .env
Abra o arquivo `backend/.env` e adicione:
```env
GOOGLE_PLACES_API_KEY=sua-chave-aqui
```

### 7. Reiniciar Backend
```bash
cd backend
npm run dev
```

---

## 💰 Custos

**Google Places API tem créditos gratuitos:**
- **$200 USD em créditos mensais** (suficiente para ~40.000 buscas/mês)
- Após isso: ~$0.005 por busca

**Para a maioria dos casos, está dentro do plano gratuito!**

---

## ✅ Verificar se Funcionou

Após configurar:
1. Reinicie o backend
2. Acesse `/buscar-empresas` no frontend
3. Faça uma busca de teste
4. Se funcionar, o aviso desaparecerá

---

## 🔒 Segurança

**Nunca commit a API Key no Git!**
- O arquivo `.env` já está no `.gitignore`
- Não compartilhe a chave publicamente
- Use restrições na chave para produção

---

## 🆘 Problemas Comuns

### "API not enabled"
- Verifique se ativou a API no console
- Pode levar alguns minutos para ativar

### "API key not valid"
- Verifique se copiou a chave corretamente
- Certifique-se que não há espaços extras

### "Quota exceeded"
- Você excedeu o limite gratuito
- Verifique o uso no console do Google Cloud

---

## 📚 Documentação Oficial

- **Console Google Cloud**: https://console.cloud.google.com/
- **Documentação Places API**: https://developers.google.com/maps/documentation/places/web-service

---

**Dúvidas?** Verifique o console do Google Cloud ou a documentação oficial!

