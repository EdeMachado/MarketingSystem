# ⚡ CONFIGURAR SMTP AGORA - Guia Rápido

## 📋 O QUE VOCÊ PRECISA:

1. **Seu email Gmail** (ex: seu-email@gmail.com)
2. **Senha de app do Google** (16 caracteres)

---

## 🔑 PASSO 1: GERAR SENHA DE APP

### Opção A: Link Direto
👉 **Acesse:** https://myaccount.google.com/apppasswords

### Opção B: Passo a Passo
1. Acesse: https://myaccount.google.com/security
2. Role até "Verificação em duas etapas"
3. Se não tiver ativado, **ATIVE AGORA** (obrigatório!)
4. Depois de ativar, volte e clique em **"Senhas de app"**
5. Selecione:
   - **App:** Email
   - **Dispositivo:** Outro (personalizado)
   - **Nome:** Digite "Marketing System"
6. Clique em **"Gerar"**
7. **COPIE A SENHA** (16 caracteres)

**Importante:**
- ⚠️ Use a **senha de app**, NÃO sua senha normal do Gmail
- ⚠️ A senha aparece apenas UMA VEZ, copie imediatamente
- ⚠️ A senha tem espaços, mas pode remover (funciona das duas formas)

---

## 📝 PASSO 2: INFORMAR DADOS

Depois de gerar a senha de app, me informe:

1. **Email:** seu-email@gmail.com
2. **Senha de app:** a senha de 16 caracteres gerada
3. **Nome:** "Grupo Biomed" (ou outro que preferir)

Eu vou atualizar o arquivo `.env` automaticamente!

---

## ✅ PASSO 3: TESTAR

Depois que eu configurar, você vai:

1. **Reiniciar o backend** (se estiver rodando):
   ```bash
   # Pressione Ctrl+C para parar
   # Depois inicie novamente
   cd backend
   npm run dev
   ```

2. **Testar conexão:**
   - Abra: http://localhost:3002/configuracoes
   - Clique em "🔄 Testar Conexão SMTP"
   - Deve aparecer ✅ "Conexão verificada com sucesso!"

3. **Fazer envio de teste:**
   - Vá em "Campanhas"
   - Crie uma campanha de teste
   - Execute para você mesmo
   - Verifique se recebeu o email!

---

## 🎯 RESUMO

**Você precisa fazer:**
1. ✅ Gerar senha de app no Google
2. ✅ Me passar email + senha de app

**Eu faço:**
3. ✅ Atualizar arquivo .env
4. ✅ Testar configuração

**Depois:**
5. ✅ Reiniciar backend
6. ✅ Testar envio

---

## 🆘 PROBLEMAS COMUNS

**"Não consigo gerar senha de app"**
- ⚠️ Precisa ter verificação em duas etapas ATIVADA primeiro!

**"Erro ao enviar email"**
- Verifique se copiou a senha correta (sem espaços extras)
- Verifique se o email está correto
- Teste a conexão primeiro em Configurações

**"Senha de app não funciona"**
- Gere uma nova senha de app
- Certifique-se que está usando a senha de app, não a senha normal

---

**Pronto! Me passe os dados quando tiver a senha de app! 🚀**

