# 📧 Guia Completo - Teste de Email

## 🎯 Objetivo
Enviar um email de teste para seu email pessoal e verificar se o SendGrid está funcionando corretamente.

---

## 📋 Métodos de Teste

### Método 1: Script Automático (Mais Fácil) ⭐

1. **Abra o terminal na pasta backend:**
   ```bash
   cd backend
   ```

2. **Execute o script:**
   ```bash
   node test-email-pessoal.js
   ```

3. **Digite seu email quando solicitado:**
   ```
   Digite seu email para receber o teste: seu-email@exemplo.com
   ```

4. **Aguarde o resultado:**
   - Se funcionar: `✅ Email enviado com sucesso!`
   - Se der erro: Vai mostrar o problema

5. **Verifique sua caixa de entrada:**
   - Procure por: "🎉 Teste do Marketing System - SendGrid"
   - Verifique também a pasta de **SPAM**

---

### Método 2: Via API (Usando Postman/Insomnia/Browser)

1. **Certifique-se que o backend está rodando:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Faça uma requisição POST:**
   ```
   POST http://localhost:3001/api/email/send
   Content-Type: application/json
   ```

3. **Body (JSON):**
   ```json
   {
     "to": "seu-email@exemplo.com",
     "subject": "Teste do Marketing System",
     "html": "<h1>Teste de Email</h1><p>Se você recebeu isso, está funcionando!</p>",
     "text": "Teste de Email - Se você recebeu isso, está funcionando!"
   }
   ```

4. **Exemplo usando cURL:**
   ```bash
   curl -X POST http://localhost:3001/api/email/send \
     -H "Content-Type: application/json" \
     -d '{
       "to": "seu-email@exemplo.com",
       "subject": "Teste do Marketing System",
       "html": "<h1>Teste</h1><p>Funcionando!</p>",
       "text": "Teste - Funcionando!"
     }'
   ```

---

### Método 3: Criar Campanha de Teste (Simulação Real)

1. **Acesse o frontend:**
   ```
   http://localhost:3002
   ```

2. **Crie um contato de teste:**
   - Vá em "Contatos"
   - Clique em "+ Novo Contato"
   - Adicione seu email
   - Salve

3. **Crie uma campanha de teste:**
   - Vá em "Campanhas"
   - Clique em "+ Nova Campanha"
   - Preencha:
     - Nome: "Teste de Email"
     - Tipo: Email
     - Template: Escolha um template simples
     - Contatos: Selecione seu contato
   - Clique em "Executar"

4. **Verifique o resultado:**
   - Deve aparecer: "1 enviado com sucesso!"
   - Verifique sua caixa de entrada

---

## ✅ Checklist de Verificação

### Antes de Testar:
- [ ] Backend está rodando (`npm run dev`)
- [ ] SendGrid está configurado no `.env`
- [ ] API Key do SendGrid está válida
- [ ] Remetente está verificado no SendGrid

### Depois de Enviar:
- [ ] Email chegou na caixa de entrada
- [ ] Email não está na pasta de spam
- [ ] Formatação HTML está correta
- [ ] Remetente aparece como "GRUPO BIOMED"
- [ ] Links funcionam (se houver)

---

## 🐛 Troubleshooting

### Email não chegou?

1. **Verifique a pasta de SPAM:**
   - SendGrid pode cair em spam na primeira vez
   - Marque como "Não é spam"

2. **Aguarde alguns minutos:**
   - Envio pode levar até 5 minutos

3. **Verifique o email digitado:**
   - Confirme se está correto
   - Sem espaços antes/depois

4. **Verifique logs do backend:**
   - Veja se há erros no console
   - Procure por mensagens de erro

### Erro: "Limite diário atingido"

- Você já enviou 100 emails hoje
- Aguarde até meia-noite OU
- Faça upgrade do plano SendGrid

### Erro: "The from address does not match"

- Remetente não está verificado no SendGrid
- Verifique em: https://app.sendgrid.com/settings/sender_auth

### Erro: "Authentication failed"

- API Key inválida ou expirada
- Gere uma nova API Key no SendGrid

---

## 📊 Verificar Quota Antes de Enviar

### Via API:
```bash
GET http://localhost:3001/api/channel-costs/email/quota
```

### Resposta:
```json
{
  "success": true,
  "data": {
    "sent": 5,
    "limit": 100,
    "remaining": 95,
    "percentageUsed": 5,
    "status": "ok"
  }
}
```

---

## 🎯 Teste Completo Recomendado

1. **Teste 1: Email simples**
   ```bash
   node test-email-pessoal.js
   ```
   - Digite seu email
   - Verifique se chegou

2. **Teste 2: Verificar quota**
   ```bash
   # Via navegador ou Postman
   GET http://localhost:3001/api/channel-costs/email/quota
   ```
   - Deve mostrar: `sent: 1` (após o teste 1)

3. **Teste 3: Campanha completa**
   - Crie uma campanha no frontend
   - Execute para seu email
   - Verifique estatísticas

4. **Teste 4: Email HTML**
   - Use o Método 2 (API) com HTML completo
   - Verifique formatação

---

## 📝 Exemplo de Email de Teste

O script `test-email-pessoal.js` envia um email bonito com:
- ✅ Cabeçalho colorido
- ✅ Informações do teste
- ✅ Checklist de verificação
- ✅ Próximos passos
- ✅ Formatação HTML profissional

---

## 🚀 Próximos Passos Após Teste Bem-Sucedido

1. ✅ Criar templates de email
2. ✅ Importar lista de contatos
3. ✅ Criar campanhas reais
4. ✅ Monitorar estatísticas
5. ✅ Acompanhar quota do SendGrid

---

## 💡 Dicas

- **Use sempre o mesmo email** para testes iniciais
- **Marque como "Não é spam"** na primeira vez
- **Verifique quota** antes de campanhas grandes
- **Monitore estatísticas** no painel do SendGrid

---

## ✅ Sucesso!

Se o email chegou, **parabéns!** 🎉

O sistema está **100% configurado** e pronto para uso!

