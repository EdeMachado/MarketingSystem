# 🔧 Solução: Erro ao Instalar Exchange Online Management

## ❌ PROBLEMA IDENTIFICADO:

O módulo não foi instalado porque há um conflito com o PackageManagement.

---

## ✅ SOLUÇÃO PASSO A PASSO:

### **OPÇÃO 1: Usar o Script Automático** (Mais Fácil)

1. Abra PowerShell como **Administrador**
2. Navegue até a pasta:
   ```powershell
   cd "C:\Users\Ede Machado\MarketingSystem\backend"
   ```
3. Se pedir permissão, execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
4. Execute o script:
   ```powershell
   .\INSTALAR-EXCHANGE-ONLINE.ps1
   ```

---

### **OPÇÃO 2: Comandos Manuais** (Se preferir)

Cole estes comandos **UM POR VEZ** no PowerShell como Administrador:

#### 1. Instalar NuGet Provider:
```powershell
Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser
```
**Se perguntar, digite `S` (Sim)**

#### 2. Instalar módulo com AllowClobber:
```powershell
Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force -AllowClobber
```

**Se ainda der erro, tente:**
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck
```

#### 3. Importar módulo:
```powershell
Import-Module ExchangeOnlineManagement
```

#### 4. Agora você pode usar:
```powershell
Connect-ExchangeOnline
Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled
```

---

### **OPÇÃO 3: Usar PowerShell 7** (Alternativa)

Se o PowerShell 5.1 continuar dando erro:

1. Instale PowerShell 7: https://aka.ms/powershell-release?tag=stable
2. Abra PowerShell 7
3. Execute:
   ```powershell
   Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser -Force
   ```

---

## 🔍 VERIFICAR SE INSTALOU:

Execute:
```powershell
Get-Module -ListAvailable -Name ExchangeOnlineManagement
```

Se retornar informações do módulo, está instalado! ✅

---

## 📋 DEPOIS DE INSTALAR:

1. **Conectar:**
   ```powershell
   Connect-ExchangeOnline
   ```
   (Vai abrir janela para login)

2. **Verificar SMTP AUTH:**
   ```powershell
   Get-CASMailbox -Identity contato@grupobiomed.com | Select-Object Name, SmtpClientAuthenticationDisabled
   ```

3. **Habilitar se necessário:**
   ```powershell
   Set-CASMailbox -Identity contato@grupobiomed.com -SmtpClientAuthenticationDisabled $false
   ```

4. **Desconectar:**
   ```powershell
   Disconnect-ExchangeOnline
   ```

---

## 🚨 SE AINDA DER ERRO:

### Alternativa: Usar Admin Center (Interface Web)

1. Acesse: https://admin.microsoft.com
2. Login com conta de administrador
3. Vá em **"Usuários"** → **"Usuários ativos"**
4. Procure: `contato@grupobiomed.com`
5. Clique no nome
6. Aba **"Email"**
7. Procure por **"SMTP AUTH"** ou **"Autenticação de cliente SMTP"**
8. Habilite manualmente

---

**Tente a OPÇÃO 1 (script) primeiro - é mais fácil!** 🚀

