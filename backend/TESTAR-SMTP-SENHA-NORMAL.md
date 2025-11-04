# 🔧 Testar SMTP com Senha Normal (MFA Removido)

## ✅ SITUAÇÃO:

Você removeu o autenticador MFA, então agora só tem a senha do email.

**Vamos testar se a senha normal funciona agora!**

---

## 📋 VERIFICAÇÕES:

### 1. **Confirmar que MFA está desabilitado:**

1. Acesse: https://mysignins.microsoft.com/security-info
2. Verifique se só aparece "Senha" ou "Password"
3. Não deve ter mais autenticador/token/telefone

### 2. **Verificar senha no .env:**

O arquivo `.env` deve ter:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=contato@grupobiomed.com
SMTP_PASS=gloriaaJesus8!
SMTP_FROM="GRUPO BIOMED <contato@grupobiomed.com>"
```

**⚠️ IMPORTANTE:** A senha deve ser a **senha normal do email**, não senha de app.

---

## 🧪 TESTAR:

### 1. **Reiniciar Backend:**
```bash
# Pare o backend (Ctrl+C)
# Inicie novamente:
cd backend
npm run dev
```

### 2. **Testar Conexão:**
1. Acesse: http://localhost:3002/configuracoes
2. Clique em "🔄 Testar Conexão SMTP"
3. Veja o resultado

---

## ⚠️ SE AINDA DER ERRO:

### **Possíveis causas:**

1. **MFA ainda parcialmente ativo:**
   - Verifique se removeu TODOS os métodos MFA
   - Pode levar alguns minutos para desativar

2. **Senha incorreta:**
   - Teste fazer login no Outlook Web com a mesma senha
   - Se não conseguir, a senha está errada

3. **Políticas de segurança:**
   - O administrador pode ter políticas que bloqueiam
   - Mesmo sem MFA, pode precisar de senha de app

4. **Propagação:**
   - Aguarde 10-15 minutos após remover MFA
   - Mudanças podem demorar

---

## 🚀 PRÓXIMOS PASSOS:

1. ✅ Verificar se MFA está completamente desativado
2. ✅ Confirmar que senha no `.env` está correta
3. ✅ Reiniciar backend
4. ✅ Testar conexão SMTP
5. ✅ Me informar o resultado!

---

**Vamos testar agora! Reinicie o backend e teste a conexão.** 🎯

