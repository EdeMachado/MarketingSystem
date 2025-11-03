# 🔧 CONFIGURAR FTP - GUIA RÁPIDO

## ⚡ FORMA MAIS RÁPIDA

### **OPÇÃO 1: Script Interativo** (Recomendado)

Execute:
```bash
cd backend
node configurar-ftp.js
```

O script vai perguntar:
- Host FTP (ex: `ftp.grupobiomed.com` ou IP)
- Usuário FTP
- Senha FTP
- Porta (geralmente 21)
- Caminho (ex: `/public_html/` ou `/www/`)

---

### **OPÇÃO 2: Editar .env Manualmente**

Abra `backend/.env` e adicione:

```env
# Site Configuration
SITE_URL=https://grupobiomed.com

# FTP Upload (para upload automático de páginas SEO)
FTP_HOST=ftp.grupobiomed.com
FTP_USER=seu-usuario-ftp
FTP_PASS=sua-senha-ftp
FTP_PATH=/public_html/
FTP_PORT=21
```

---

## 📋 ONDE ENCONTRAR CREDENCIAIS FTP

### **1. Painel da Hospedagem** (cPanel, Plesk, etc)

Procure por:
- **"FTP Accounts"** / **"Contas FTP"**
- **"File Manager"** / **"Gerenciador de Arquivos"**
- **"FTP Settings"** / **"Configurações FTP"**

### **2. Email de Boas-Vindas**

Quando você contratou a hospedagem, geralmente recebeu email com:
- Host FTP
- Usuário FTP
- Senha FTP

### **3. Pedir para Quem Configurou o Site**

Se não souber, peça para quem configurou o site grupobiomed.com

---

## ✅ DEPOIS DE CONFIGURAR

1. **Reinicie o backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Teste fazendo uma publicação:**
   - Vá em "Publicar"
   - Escolha tema e palavras-chave
   - Clique "PUBLICAR TUDO AGORA!"
   - Verifique se a página apareceu no site!

---

## 🎯 O QUE VAI ACONTECER

Quando você clicar **"PUBLICAR"**:

1. ✅ Sistema cria página SEO
2. ✅ **Faz upload FTP automático** para grupobiomed.com
3. ✅ **Página aparece em:** grupobiomed.com/exame-admissional (exemplo)
4. ✅ **Submete ao Google automaticamente**
5. ✅ Envia Email/WhatsApp/Redes Sociais
6. ✅ **BUMMMMMMMM! Tudo automático!**

---

**Precisa de ajuda para encontrar as credenciais FTP?** 

Me diga qual hospedagem você usa (cPanel, Plesk, Hostinger, etc) e eu te ajudo! 🚀


