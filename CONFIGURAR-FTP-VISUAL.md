# 🖼️ GUIA VISUAL: CONFIGURAR FTP

## 📍 ONDE ENCONTRAR - PASSO A PASSO VISUAL

### **CENÁRIO 1: cPanel** (Mais Comum - 80% dos sites)

#### **PASSO 1: Acessar cPanel**

```
1. Abra navegador
2. Digite: https://grupobiomed.com/cpanel
   OU
   https://cpanel.grupobiomed.com
   OU
   Acesse site da hospedagem → Login → cPanel
```

**O que você vai ver:**
```
┌─────────────────────────────────┐
│        cPanel                   │
├─────────────────────────────────┤
│  Files          Databases       │
│  ├─ File Manager                │
│  ├─ FTP Accounts  ← AQUI!       │
│  └─ Backup                       │
└─────────────────────────────────┘
```

#### **PASSO 2: Clicar em "FTP Accounts"**

Você verá uma tela assim:

```
FTP Accounts
┌────────────────────────────────────────────────────────────┐
│ Account  │ Path            │ Disk Usage │ Actions          │
├──────────┼─────────────────┼────────────┼──────────────────┤
│ usuario  │ /public_html    │ 50 MB      │ [Change Quota]   │
│          │                 │            │ [Change Password]│
└────────────────────────────────────────────────────────────┘

FTP Connection Information:
Host: ftp.grupobiomed.com  ← COPIAR ISSO
Port: 21
Username: usuario@grupobiomed.com  ← COPIAR ISSO
```

**O que fazer:**
1. Anote o **Host** (ex: `ftp.grupobiomed.com`)
2. Anote o **Username** (ex: `usuario@grupobiomed.com`)
3. Se não souber a senha, clique em **"Change Password"**
4. Anote o **Path** (geralmente `/public_html`)

---

### **CENÁRIO 2: Plesk**

#### **Tela que você vai ver:**

```
Plesk
┌─────────────────────────────────┐
│ Websites & Domains               │
├─────────────────────────────────┤
│ grupobiomed.com                  │
│   ├─ FTP Access       ← CLIQUE  │
│   ├─ File Manager                │
│   └─ Hosting Settings            │
└─────────────────────────────────┘
```

**Depois de clicar em "FTP Access":**

```
FTP Accounts
┌─────────────────────────────────────────────────┐
│ Account Name │ Home Directory │ Actions        │
├──────────────┼────────────────┼────────────────┤
│ usuario      │ /httpdocs      │ [Change Pass]  │
└─────────────────────────────────────────────────┘

Connection Details:
Host: grupobiomed.com  ← COPIAR
Port: 21
Username: usuario@grupobiomed.com  ← COPIAR
```

---

### **CENÁRIO 3: Hostinger / Outras Hospedagens**

#### **Na Hostinger:**

```
1. Acesse: https://www.hostinger.com.br/hpanel
2. Login com sua conta
3. Clique em "FTP" no menu lateral
4. Você verá as credenciais
```

---

### **CENÁRIO 4: Email de Boas-Vindas**

Procure no seu email por algo assim:

```
Assunto: Bem-vindo à [Nome da Hospedagem]

─────────────────────────────────────────
CREDENCIAIS FTP:

Host: ftp.grupobiomed.com
Usuário: usuario
Senha: ABC123XYZ
Porta: 21

Diretório: /public_html/
─────────────────────────────────────────
```

---

## 🔧 CONFIGURAR NO SISTEMA - PASSO A PASSO

### **MÉTODO 1: Script Automático** ⭐

#### **PASSO 1: Abrir Terminal**

1. Pressione `Windows + R`
2. Digite: `cmd` ou `powershell`
3. Pressione Enter

#### **PASSO 2: Ir para pasta do projeto**

Digite:
```bash
cd "C:\Users\Ede Machado\MarketingSystem\backend"
```

#### **PASSO 3: Executar script**

Digite:
```bash
node configurar-ftp.js
```

#### **PASSO 4: Responder perguntas**

Você verá algo assim:

```
🔧 CONFIGURAR FTP - Upload Automático

Este script vai configurar o FTP para upload automático de páginas SEO.

📋 Por favor, forneça as informações do FTP:

Host FTP: [COLE O HOST AQUI]
```

**Cole as informações que você encontrou:**

```
Host FTP: ftp.grupobiomed.com
Usuário FTP: usuario@grupobiomed.com
Senha FTP: [digite a senha - não aparece na tela]
Porta FTP [21]: [pressione ENTER]
Caminho no servidor (ex: /public_html/) [/public_html/]: [pressione ENTER]
URL do site [https://grupobiomed.com]: [pressione ENTER]
```

**Depois você verá:**

```
✅ FTP configurado com sucesso!

📋 Configuração salva:
   Host: ftp.grupobiomed.com
   Usuário: usuario@grupobiomed.com
   Porta: 21
   Caminho: /public_html/
   Site: https://grupobiomed.com

💡 Agora quando você clicar "PUBLICAR", o sistema fará upload automático!
```

**✅ PRONTO!**

---

### **MÉTODO 2: Editar Arquivo Manualmente**

#### **PASSO 1: Abrir arquivo .env**

1. Abra o Windows Explorer
2. Vá para: `C:\Users\Ede Machado\MarketingSystem\backend`
3. Procure pelo arquivo `.env`
4. **Clique direito** → **Abrir com** → **Notepad** (ou qualquer editor)

#### **PASSO 2: Adicionar no final do arquivo**

Role até o final e adicione:

```env

# Site Configuration
SITE_URL=https://grupobiomed.com

# FTP Upload (para upload automático de páginas SEO)
FTP_HOST=ftp.grupobiomed.com
FTP_USER=usuario@grupobiomed.com
FTP_PASS=sua-senha-aqui
FTP_PATH=/public_html/
FTP_PORT=21
```

**Substitua pelos seus valores:**
- `ftp.grupobiomed.com` → Host que você encontrou
- `usuario@grupobiomed.com` → Usuário que você encontrou
- `sua-senha-aqui` → Senha que você encontrou
- `/public_html/` → Caminho que você encontrou

#### **PASSO 3: Salvar**

1. Pressione `Ctrl + S`
2. Feche o arquivo

**✅ PRONTO!**

---

## ✅ TESTAR SE FUNCIONOU

#### **PASSO 1: Reiniciar Backend**

1. No terminal onde o backend está rodando
2. Pare (Ctrl+C)
3. Inicie de novo:
   ```bash
   cd "C:\Users\Ede Machado\MarketingSystem\backend"
   npm run dev
   ```

#### **PASSO 2: Fazer uma publicação teste**

1. Acesse o sistema: `http://localhost:3002`
2. Vá em **"Publicar"**
3. Escolha um tema (ex: "Exame Admissional")
4. Escolha palavras-chave
5. **Marque "Site"** nos canais
6. Clique em **"PUBLICAR TUDO AGORA!"**

#### **PASSO 3: Verificar logs**

No terminal do backend, você deve ver:

```
📝 Gerando conteúdo SEO para: Exame Admissional
💾 Salvando página SEO no site...
✅ Página SEO criada: exame-admissional
📤 Fazendo upload automático para o site...
📤 Conectando ao FTP: ftp.grupobiomed.com...
✅ Conectado ao FTP!
📂 Diretório: /public_html
📤 Fazendo upload de exame-admissional.html...
✅ Upload concluído: exame-admissional.html
✅ Página publicada no site: https://grupobiomed.com/exame-admissional
🔍 Submetendo ao Google automaticamente...
✅ Submetido ao Google: ...
```

**Se aparecer isso → FUNCIONOU! ✅**

#### **PASSO 4: Verificar no site**

1. Abra navegador
2. Acesse: `https://grupobiomed.com/exame-admissional`
3. **Se a página aparecer → SUCESSO! 🎉**

---

## ❓ NÃO SABE QUAL HOSPEDAGEM USA?

**Como descobrir:**

1. **Acesse:** https://www.whois.com/whois/grupobiomed.com
2. **Procure por** "Registrar" ou "Host"
3. **Ou pergunte para quem configurou o site**

**Hospedagens comuns no Brasil:**
- Hostinger
- UOL Host
- Locaweb
- KingHost
- HostGator
- GoDaddy

---

## 🎯 RESUMO ULTRA-RÁPIDO

```
1. Acesse cPanel: grupobiomed.com/cpanel
2. Clique: FTP Accounts
3. Copie: Host, Usuário, Senha
4. Execute: node configurar-ftp.js
5. Cole os dados quando perguntar
6. PRONTO! ✅
```

---

**Precisa de mais ajuda? Me diga qual hospedagem você usa!** 🚀


