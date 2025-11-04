# 🔐 Como Gerar Senha de App - Microsoft 365 com MFA

## ✅ CONFIRMADO: Você tem MFA habilitado!

Por isso a senha normal não funciona. Você **precisa gerar uma senha de app**.

---

## 📋 PASSO A PASSO - Gerar Senha de App:

### **MÉTODO 1: Via Security Info** ⭐ (Mais Fácil)

1. **Acesse:** https://mysignins.microsoft.com/security-info
2. **Login** com `contato@grupobiomed.com`
3. **Clique em:** "+ Adicionar método" (ou "Add method")
4. **Selecione:** "Senha de app" (ou "App password")
5. **Dê um nome:** "Marketing System" ou "SMTP"
6. **Clique em:** "Adicionar" (ou "Add")
7. **COPIE A SENHA** que aparece (16 caracteres, tipo: `abcd-efgh-ijkl-mnop`)

⚠️ **IMPORTANTE:** A senha aparece apenas UMA VEZ. Copie imediatamente!

---

### **MÉTODO 2: Via My Account** (Alternativa)

1. **Acesse:** https://myaccount.microsoft.com/security
2. **Login** com `contato@grupobiomed.com`
3. **Vá em:** "Segurança" → "Informações de segurança"
4. **Clique em:** "+ Adicionar método"
5. **Selecione:** "Senha de app"
6. **Siga os passos** para gerar
7. **COPIE A SENHA**

---

### **MÉTODO 3: Via Admin Center** (Se tiver acesso admin)

1. **Acesse:** https://admin.microsoft.com
2. **Vá em:** "Usuários" → "Usuários ativos"
3. **Procure:** `contato@grupobiomed.com`
4. **Clique no nome**
5. **Aba:** "Email" ou "Segurança"
6. **Procure por:** "Senhas de app" ou "App passwords"
7. **Gere uma nova senha**

---

## 🔑 FORMATO DA SENHA:

A senha de app tem **16 caracteres** no formato:
- `abcd-efgh-ijkl-mnop` (com hífens)
- Ou `abcdefghijklmnop` (sem hífens)

**Ambos funcionam!** Pode remover os hífens se quiser.

---

## 📝 DEPOIS DE GERAR:

1. **Me informe a senha de app** (16 caracteres)
2. **OU atualize manualmente** o `.env`:
   ```env
   SMTP_PASS=sua-senha-de-app-aqui
   ```

---

## ⚠️ IMPORTANTE:

- ✅ Use a **senha de app**, NÃO a senha normal
- ✅ A senha de app é específica para aplicativos
- ✅ Você pode ter várias senhas de app (uma para cada app)
- ✅ Pode remover os hífens da senha (funciona das duas formas)

---

## 🚀 PRÓXIMOS PASSOS:

1. **Gere a senha de app** usando um dos métodos acima
2. **Copie a senha** (16 caracteres)
3. **Me informe a senha** OU atualize o `.env` manualmente
4. **Reinicie o backend**
5. **Teste a conexão** novamente

---

**Gere a senha de app e me informe quando tiver!** 🎯

