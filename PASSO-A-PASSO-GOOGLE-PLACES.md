# 🔑 PASSO A PASSO: Configurar Google Places API Key

## 📋 PRÉ-REQUISITOS

- ✅ Conta Google (Gmail)
- ✅ Navegador (Chrome, Edge, Firefox)
- ✅ Acesso a internet

---

## 🚀 PASSO A PASSO COMPLETO

### **PASSO 1: Acessar Google Cloud Console**

1. Abra seu navegador
2. Acesse: **https://console.cloud.google.com/**
3. Faça login com sua conta Google
4. Se for a primeira vez, aceite os termos de serviço

---

### **PASSO 2: Criar um Projeto**

1. No topo da página, clique no menu de projetos (ao lado de "Google Cloud")
   - Se você nunca criou um projeto, aparecerá "Selecionar um projeto"
   
2. Clique no botão **"NOVO PROJETO"** (canto superior direito)

3. Preencha:
   - **Nome do projeto**: `Marketing System` (ou qualquer nome que preferir)
   - **Organização**: Deixe como está (ou selecione se tiver)
   
4. Clique em **"CRIAR"**

5. ⏳ Aguarde alguns segundos - o projeto será criado automaticamente

6. ✅ Clique em **"SELECIONAR"** para usar o projeto recém-criado

---

### **PASSO 3: Ativar a Places API**

1. No menu lateral esquerdo, procure por **"APIs e Serviços"**
   - Se não ver, clique nas **"☰"** (três linhas) no topo esquerdo

2. Clique em **"Biblioteca"** (dentro de "APIs e Serviços")

3. Na barra de pesquisa no topo, digite: **"Places API"**

4. Você verá dois resultados:
   - **"Places API"** (versão antiga)
   - **"Places API (New)"** (versão nova - RECOMENDADA)
   
5. ⚠️ **IMPORTANTE**: Clique em **"Places API"** primeiro (versão clássica)

6. Clique no botão azul **"ATIVAR"**

7. ⏳ Aguarde alguns segundos enquanto a API é ativada

8. Repita o processo para **"Places API (New)"**:
   - Volte para "Biblioteca"
   - Busque por "Places API (New)"
   - Clique e ative

✅ **Resultado esperado**: Você verá um check verde e "API habilitada"

---

### **PASSO 4: Criar a API Key (Chave)**

1. No menu lateral, clique em **"APIs e Serviços"** > **"Credenciais"**

2. No topo da página, clique em **"+ CRIAR CREDENCIAIS"**

3. Selecione **"Chave de API"**

4. 🎉 **A chave será criada automaticamente!**
   - Uma janela aparecerá mostrando sua chave
   - **IMPORTANTE**: COPIE A CHAVE AGORA (ela aparece apenas uma vez)
   - Exemplo: `AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz`

5. Clique em **"Fechar"** (ou X)

---

### **PASSO 5: Configurar Restrições (Opcional, mas Recomendado)**

**⚠️ OPCIONAL mas importante para segurança!**

1. Na lista de "Credenciais", clique na chave que você acabou de criar

2. Em **"Restrições de aplicativo"**:
   - Selecione **"Nenhum"** para começar (mais fácil de testar)
   - Ou **"IPs HTTP referrers"** para produção

3. Em **"Restrições de API"**:
   - Selecione **"Limitar chave"**
   - Marque apenas:
     - ☑️ **Places API**
     - ☑️ **Places API (New)**
   - Isso evita uso indevido da chave

4. Clique em **"SALVAR"** (canto inferior)

---

### **PASSO 6: Habilitar Faturamento (GRATUITO até o limite)**

**💰 IMPORTANTE**: A Google dá $200 USD GRÁTIS por mês!

1. No menu lateral, clique em **"Faturamento"**

2. Se você nunca configurou:
   - Clique em **"Vincular conta de faturamento"**
   - Adicione um cartão (será usado APENAS se exceder o crédito gratuito)
   - **Mas não se preocupe**: $200 grátis = ~40.000 buscas/mês!

3. ⏳ Pode levar alguns minutos para processar

---

### **PASSO 7: Adicionar a Chave no Sistema**

1. Abra o arquivo de edição de texto (Bloco de Notas, VS Code, etc)

2. Navegue até a pasta do seu projeto:
   ```
   C:\Users\Ede Machado\MarketingSystem\backend\
   ```

3. Abra o arquivo `.env` (se não existir, crie um novo)

4. Adicione esta linha (cole sua chave):
   ```env
   GOOGLE_PLACES_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
   ```
   ⚠️ **SUBSTITUA** pela sua chave real!

5. Salve o arquivo (Ctrl+S)

---

### **PASSO 8: Reiniciar o Backend**

1. Se o backend estiver rodando, pare pressionando **Ctrl+C** no terminal

2. Inicie novamente:
   ```bash
   cd backend
   npm run dev
   ```

3. ✅ Você deve ver esta mensagem:
   ```
   ✅ Google Places API configurado
   ```

4. Se aparecer um aviso, verifique se:
   - A chave foi copiada corretamente
   - Não há espaços extras
   - O arquivo `.env` está na pasta `backend/`

---

### **PASSO 9: Testar a Busca**

1. Acesse o sistema no navegador: **http://localhost:3002**

2. Clique em **"Buscar Empresas"** no menu

3. Preencha:
   - **O que buscar**: `clínicas de saúde`
   - **Localização**: `São Paulo, SP`

4. Clique em **"Buscar Empresas"**

5. ✅ Se funcionar, você verá uma lista de empresas!

---

## 🎯 RESUMO RÁPIDO (5 minutos)

1. **Console**: https://console.cloud.google.com/
2. **Projeto**: Criar novo projeto
3. **API**: Ativar "Places API" e "Places API (New)"
4. **Chave**: Criar API Key e COPIAR
5. **.env**: Adicionar `GOOGLE_PLACES_API_KEY=sua-chave`
6. **Reiniciar**: Backend
7. **Testar**: Buscar empresas no sistema

---

## ❌ PROBLEMAS COMUNS

### "API not enabled"
- **Solução**: Volte ao Passo 3 e certifique-se de ativar AMBAS as APIs

### "API key not valid"
- **Solução**: Verifique se copiou a chave completa (começa com `AIzaSy`)

### "Quota exceeded"
- **Solução**: Você usou todos os créditos. Aguarde até o próximo mês ou configure faturamento

### "Permission denied"
- **Solução**: Verifique as restrições de API (Passo 5)

---

## 💰 CUSTOS

- **Gratuito**: $200 USD/mês (crédito)
- **Após isso**: ~$0.005 por busca
- **Exemplo**: 10.000 buscas/mês = $0 (dentro do crédito)

---

## ✅ CHECKLIST FINAL

- [ ] Projeto criado no Google Cloud
- [ ] Places API ativada (ambas as versões)
- [ ] API Key criada e copiada
- [ ] Chave adicionada no `backend/.env`
- [ ] Backend reiniciado
- [ ] Mensagem "✅ Google Places API configurado" aparece
- [ ] Teste de busca funcionando

---

## 🆘 PRECISA DE AJUDA?

1. Verifique se seguiu todos os passos
2. Veja os problemas comuns acima
3. Confira os logs do backend para mensagens de erro
4. Documentação oficial: https://developers.google.com/maps/documentation/places/web-service

---

**Tempo estimado**: 10-15 minutos
**Dificuldade**: ⭐⭐ (Fácil)
**Custo**: 💰 GRÁTIS (até o limite)

---

**Pronto! Agora você pode buscar empresas automaticamente! 🎉**

