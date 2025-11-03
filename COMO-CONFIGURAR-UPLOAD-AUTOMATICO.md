# 🤖 CONFIGURAR UPLOAD AUTOMÁTICO PARA O SITE

## ✅ O QUE VAI ACONTECER

Quando você clicar em **"PUBLICAR"**, o sistema vai:

1. ✅ Criar página SEO
2. ✅ **AUTOMATICAMENTE fazer upload para grupobiomed.com**
3. ✅ **AUTOMATICAMENTE submeter ao Google**
4. ✅ Enviar para Email/WhatsApp/Redes Sociais
5. ✅ **TUDO AUTOMÁTICO!**

---

## 🔧 COMO CONFIGURAR (UMA VEZ SÓ)

### **OPÇÃO 1: Via FTP** (Recomendado)

**1. Obter credenciais FTP:**

Você precisa de:
- Host FTP (ex: `ftp.grupobiomed.com` ou IP do servidor)
- Usuário FTP
- Senha FTP
- Caminho onde fica o site (ex: `/public_html/` ou `/www/`)

**Onde encontrar:**
- Painel da hospedagem (cPanel, Plesk, etc)
- Email de boas-vindas da hospedagem
- Ou pergunte para quem configurou o site

**2. Adicionar no `backend/.env`:**

```env
# Upload Automático FTP
FTP_HOST=ftp.grupobiomed.com
FTP_USER=seu-usuario-ftp
FTP_PASS=sua-senha-ftp
FTP_PATH=/public_html/
FTP_PORT=21

# URL do seu site
SITE_URL=https://grupobiomed.com
```

**3. Instalar biblioteca FTP:**

```bash
cd backend
npm install basic-ftp
npm install --save-dev @types/basic-ftp
```

**4. Pronto!** Agora é automático! 🎉

---

### **OPÇÃO 2: Via SSH/SCP** (Se tiver acesso SSH)

**1. Adicionar no `backend/.env`:**

```env
SSH_HOST=seu-servidor.com.br
SSH_USER=seu-usuario
SSH_PASSWORD=sua-senha
SSH_PATH=/var/www/html/
```

**2. Instalar biblioteca:**

```bash
cd backend
npm install ssh2
```

---

### **OPÇÃO 3: Via API da Hospedagem** (Se tiver API)

Algumas hospedagens têm API própria:
- cPanel API
- Plesk API
- WordPress REST API

**Me diga qual hospedagem você usa e eu configuro!**

---

## 🚀 DEPOIS DE CONFIGURAR

**Quando você clicar "PUBLICAR":**

```
1. Sistema cria página SEO ✅
2. Sistema faz upload FTP automático ✅
3. Página aparece em: grupobiomed.com/exame-admissional ✅
4. Sistema submete ao Google automaticamente ✅
5. Sistema envia Email/WhatsApp ✅
6. BUMMMMMMMM! Tudo pronto! ✅
```

---

## 📋 CHECKLIST

- [ ] Obter credenciais FTP
- [ ] Adicionar no `.env`
- [ ] Instalar biblioteca (`npm install basic-ftp`)
- [ ] Testar upload de uma página
- [ ] Verificar se apareceu no site
- [ ] Configurar submissão automática ao Google

---

## 💡 MINHA RECOMENDAÇÃO

**Fazer OPÇÃO 1 (FTP):**

1. Você me passa:
   - Host FTP
   - Usuário FTP
   - Senha FTP
   - Caminho do site

2. Eu implemento tudo automático

3. **Pronto!** Depois é só clicar "PUBLICAR"!

---

## ❓ PRECISA DE AJUDA?

**Se não souber as credenciais FTP:**

1. **Acesse painel da hospedagem**
2. **Procure por:**
   - "FTP Accounts" / "Contas FTP"
   - "File Manager" / "Gerenciador de Arquivos"
   - "Servidor FTP"
   - Ou pergunte para quem configurou o site

**Quer que eu implemente agora?** 

Me passe as credenciais FTP ou me diga qual hospedagem você usa! 🚀

