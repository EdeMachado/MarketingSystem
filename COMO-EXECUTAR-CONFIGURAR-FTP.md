# 🚀 COMO EXECUTAR - CONFIGURAR FTP

## ⚡ FORMA MAIS RÁPIDA

### **Duplo clique no arquivo:**
```
CONFIGURAR-FTP.bat
```

O script vai:
1. ✅ Mostrar onde encontrar as credenciais
2. ✅ Pedir cada informação
3. ✅ Configurar automaticamente
4. ✅ Pronto!

---

## 📋 O QUE VOCÊ PRECISA TER ANTES

**Antes de executar, você precisa ter:**

1. ✅ **Host FTP** (ex: `ftp.grupobiomed.com`)
2. ✅ **Usuário FTP** 
3. ✅ **Senha FTP**
4. ✅ **Caminho** (geralmente `/public_html/`)

**Onde encontrar:**
- Acesse: `grupobiomed.com/cpanel`
- Clique em "FTP Accounts"
- Copie os dados

---

## 🔧 EXECUTAR O SCRIPT

### **OPÇÃO 1: Duplo Clique** (Mais Fácil)

1. Vá na pasta do projeto: `C:\Users\Ede Machado\MarketingSystem`
2. **Duplo clique** em `CONFIGURAR-FTP.bat`
3. O script vai abrir e pedir as informações
4. Digite cada informação quando pedir
5. **Pronto!**

---

### **OPÇÃO 2: Terminal/PowerShell**

```bash
cd "C:\Users\Ede Machado\MarketingSystem"
.\CONFIGURAR-FTP.bat
```

---

## 📝 EXEMPLO DE COMO PREENCHER

Quando o script perguntar:

```
Host FTP (ex: ftp.grupobiomed.com): ftp.grupobiomed.com
Usuário FTP: usuario@grupobiomed.com
Senha FTP: minhaSenha123
Porta FTP [21]: [pressione ENTER]
Caminho no servidor [/public_html/]: [pressione ENTER]
URL do site [https://grupobiomed.com]: [pressione ENTER]
```

**Depois você verá:**

```
===========================================
   CONFIGURADO COM SUCESSO!
===========================================
```

---

## ✅ DEPOIS DE CONFIGURAR

**Reinicie o backend:**

```bash
cd backend
npm run dev
```

**Pronto! Agora quando você clicar "PUBLICAR", tudo será automático!** 🚀

---

## 🎯 RESUMO

1. ✅ Encontre credenciais FTP (cPanel → FTP Accounts)
2. ✅ Duplo clique em `CONFIGURAR-FTP.bat`
3. ✅ Cole as credenciais quando perguntar
4. ✅ Reinicie o backend
5. ✅ **PRONTO! Tudo automático!**

---

**O script está esperando você executar! Duplo clique em `CONFIGURAR-FTP.bat`!** 🎯


