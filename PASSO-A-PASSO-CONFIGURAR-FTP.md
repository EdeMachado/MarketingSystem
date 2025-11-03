# 📋 PASSO A PASSO: CONFIGURAR FTP PARA UPLOAD AUTOMÁTICO

## 🎯 O QUE VOCÊ VAI FAZER

Encontrar as credenciais FTP da hospedagem do site **grupobiomed.com** e adicionar no sistema.

**Tempo estimado:** 5-10 minutos

---

## 📍 ONDE ENCONTRAR AS CREDENCIAIS FTP

### **OPÇÃO 1: cPanel** (Mais Comum)

A maioria dos sites usa **cPanel**. Vamos ver como acessar:

#### **PASSO 1: Acessar cPanel**

1. **Abra navegador** (Chrome, Firefox, Edge)
2. **Acesse o painel da hospedagem:**
   - Geralmente: `https://grupobiomed.com/cpanel`
   - Ou: `https://cpanel.grupobiomed.com`
   - Ou: IP fornecido pela hospedagem
   - **OU** acesse o site da sua hospedagem e faça login

#### **PASSO 2: Encontrar "FTP Accounts"**

1. **Procure por** "FTP" ou "File Manager" no cPanel
2. **Clique em** "FTP Accounts" (ou "Contas FTP")
   - Geralmente está na seção "Files" / "Arquivos"
   - Ou procure no menu lateral esquerdo

#### **PASSO 3: Ver Credenciais**

Na página "FTP Accounts", você verá uma tabela com contas FTP.

**Você vai ver:**
- **Host:** `ftp.grupobiomed.com` (ou IP)
- **Usuário:** Nome da conta FTP
- **Porta:** 21 (geralmente)

**IMPORTANTE:** Se não souber a senha:
- Procure por "Change Password" / "Alterar Senha"
- Ou crie uma nova conta FTP

---

### **OPÇÃO 2: Email de Boas-Vindas**

#### **PASSO 1: Procurar Email**

1. **Acesse seu email** (Gmail, Outlook, etc)
2. **Procure por emails** de:
   - Nome da hospedagem (Hostinger, UOL, Locaweb, etc)
   - Assunto: "Bem-vindo", "Welcome", "Credenciais", "FTP"

#### **PASSO 2: Ver Credenciais**

No email você vai encontrar:
- Host FTP
- Usuário FTP
- Senha FTP
- Porta (geralmente 21)

---

### **OPÇÃO 3: Plesk** (Outro painel comum)

#### **PASSO 1: Acessar Plesk**

1. Acesse: `https://grupobiomed.com:8443`
   - Ou o link fornecido pela hospedagem

#### **PASSO 2: Encontrar FTP**

1. Clique em **"Websites & Domains"**
2. Clique no domínio **grupobiomed.com**
3. Vá em **"FTP Settings"** ou **"FTP Access"**

---

### **OPÇÃO 4: Acesso SSH/Direto**

Se você tem acesso direto ao servidor:

**Host FTP geralmente é:**
- `ftp.grupobiomed.com`
- Ou IP do servidor
- Ou só `grupobiomed.com`

---

## 🔧 CONFIGURAR NO SISTEMA

Depois de encontrar as credenciais, você tem 2 opções:

---

### **OPÇÃO A: Script Automático** (Mais Fácil)

#### **PASSO 1: Executar Script**

Abra terminal na pasta do projeto:
```bash
cd "C:\Users\Ede Machado\MarketingSystem\backend"
node configurar-ftp.js
```

#### **PASSO 2: Responder Perguntas**

O script vai perguntar (coloque os dados que você encontrou):

```
Host FTP: [COLE O HOST AQUI]
Usuário FTP: [COLE O USUÁRIO AQUI]
Senha FTP: [COLE A SENHA AQUI]
Porta FTP [21]: [PRESSIONE ENTER ou digite a porta]
Caminho no servidor (ex: /public_html/) [/public_html/]: [PRESSIONE ENTER ou digite o caminho]
URL do site [https://grupobiomed.com]: [PRESSIONE ENTER]
```

**Exemplo:**
```
Host FTP: ftp.grupobiomed.com
Usuário FTP: grupobiomed
Senha FTP: minhaSenha123
Porta FTP [21]: [ENTER]
Caminho no servidor (ex: /public_html/) [/public_html/]: [ENTER]
URL do site [https://grupobiomed.com]: [ENTER]
```

#### **PASSO 3: Pronto!**

O script vai salvar tudo e mostrar:
```
✅ FTP configurado com sucesso!
```

---

### **OPÇÃO B: Editar Manualmente** (Se preferir)

#### **PASSO 1: Abrir Arquivo .env**

1. Abra o arquivo: `backend\.env`
   - Pode abrir com Notepad, VS Code, ou qualquer editor de texto

#### **PASSO 2: Adicionar Configuração**

Adicione estas linhas no final do arquivo:

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

**Substitua:**
- `ftp.grupobiomed.com` → pelo Host FTP que você encontrou
- `seu-usuario-ftp` → pelo Usuário FTP que você encontrou
- `sua-senha-ftp` → pela Senha FTP que você encontrou
- `/public_html/` → pelo caminho (geralmente é este, mas pode ser `/www/` ou outro)

#### **PASSO 3: Salvar Arquivo**

Salve o arquivo (Ctrl+S)

---

## ✅ VERIFICAR SE FUNCIONOU

#### **PASSO 1: Reiniciar Backend**

No terminal:
```bash
cd "C:\Users\Ede Machado\MarketingSystem\backend"
npm run dev
```

#### **PASSO 2: Testar Upload**

1. **Crie uma página SEO** no sistema (módulo SEO)
2. **Ou faça uma publicação** (módulo Publicar)
3. **Verifique os logs** do backend

**Se aparecer:**
```
📤 Conectando ao FTP: ftp.grupobiomed.com...
✅ Conectado ao FTP!
📂 Diretório: /public_html
📤 Fazendo upload de exame-admissional.html...
✅ Upload concluído: exame-admissional.html
```

**✅ Funcionou!**

**Se aparecer erro:**
- Verifique se as credenciais estão corretas
- Verifique se o caminho está correto
- Tente conectar com cliente FTP (FileZilla) para testar

---

## 🔍 TROUBLESHOOTING (Solução de Problemas)

### **Erro: "Não conseguiu conectar"**

**Soluções:**
- Verifique se o Host FTP está correto
- Verifique se a Porta está correta (geralmente 21)
- Verifique se não há firewall bloqueando

### **Erro: "Usuário ou senha inválidos"**

**Soluções:**
- Verifique se digitou corretamente (sem espaços)
- Tente resetar a senha FTP no painel
- Crie uma nova conta FTP

### **Erro: "Não conseguiu mudar para diretório"**

**Soluções:**
- Verifique o caminho (`FTP_PATH`)
- Pode ser `/public_html/`, `/www/`, `/httpdocs/`, ou outro
- Tente sem a barra final: `/public_html` ao invés de `/public_html/`

### **Não sei qual é o caminho (`FTP_PATH`)**

**Como descobrir:**
1. Conecte com cliente FTP (FileZilla) se souber usar
2. Veja onde ficam os arquivos do site (ex: `index.html`)
3. O caminho é esse diretório
4. **Ou pergunte para quem configurou o site**

**Caminhos comuns:**
- `/public_html/` (mais comum em cPanel)
- `/www/`
- `/httpdocs/`
- `/html/`

---

## 📞 PRECISA DE AJUDA?

**Se não conseguir encontrar as credenciais:**

1. **Me diga qual hospedagem você usa:**
   - Hostinger, UOL, Locaweb, KingHost, etc
   - E eu te ajudo com o passo a passo específico!

2. **Ou pergunte para quem configurou o site:**
   - Eles devem ter as credenciais FTP

---

## 🎯 RESUMO RÁPIDO

1. ✅ **Acesse painel da hospedagem** (cPanel, Plesk, etc)
2. ✅ **Encontre "FTP Accounts"** ou "Contas FTP"
3. ✅ **Anote:** Host, Usuário, Senha
4. ✅ **Execute:** `node configurar-ftp.js`
5. ✅ **Cole as credenciais** quando perguntar
6. ✅ **Pronto!** Agora é automático

---

## 🚀 DEPOIS DE CONFIGURAR

Quando você clicar **"PUBLICAR"**:
- ✅ Página aparece em: `grupobiomed.com/exame-admissional`
- ✅ Submete ao Google automaticamente
- ✅ Envia para todos os canais
- ✅ **TUDO AUTOMÁTICO!**

---

**Precisa de ajuda para encontrar as credenciais? Me diga qual hospedagem você usa!** 🚀


