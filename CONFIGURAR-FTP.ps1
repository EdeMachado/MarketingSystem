# Script PowerShell para configurar FTP
# Execute: .\CONFIGURAR-FTP.ps1

Write-Host ""
Write-Host "🔧 CONFIGURAR FTP - Upload Automático" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script vai configurar o FTP para upload automático de páginas SEO." -ForegroundColor Yellow
Write-Host ""

# Caminho do arquivo .env
$envPath = Join-Path $PSScriptRoot "backend\.env"

# Verificar se .env existe
$envContent = ""
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    Write-Host "✅ Arquivo .env encontrado!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Arquivo .env não encontrado. Será criado novo." -ForegroundColor Yellow
}

# Função para ler valor existente do .env
function Get-EnvValue {
    param($key)
    $pattern = '^' + [regex]::Escape($key) + '=(.+)$'
    $match = [regex]::Match($envContent, $pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
    if ($match.Success) {
        $value = $match.Groups[1].Value.Trim()
        $value = $value -replace '^"', '' -replace '"$', ''
        $value = $value -replace "^'", '' -replace "'$", ''
        return $value
    }
    return ""
}

$existingHost = Get-EnvValue "FTP_HOST"
$existingUser = Get-EnvValue "FTP_USER"
$existingPath = Get-EnvValue "FTP_PATH"

Write-Host ""
Write-Host "📋 Por favor, forneça as informações do FTP:" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 ONDE ENCONTRAR:" -ForegroundColor Yellow
Write-Host "   1. Acesse: grupobiomed.com/cpanel" -ForegroundColor White
Write-Host "   2. Clique em 'FTP Accounts'" -ForegroundColor White
Write-Host "   3. Copie: Host, Usuário, Senha" -ForegroundColor White
Write-Host "   4. Ou veja: PASSO-A-PASSO-CONFIGURAR-FTP.md" -ForegroundColor White
Write-Host ""

# Host FTP
$ftpHostPrompt = "Host FTP"
if ($existingHost) {
    $ftpHostPrompt += " [$existingHost]"
}
$ftpHost = Read-Host $ftpHostPrompt
if ([string]::IsNullOrWhiteSpace($ftpHost)) {
    $ftpHost = $existingHost
}
if ([string]::IsNullOrWhiteSpace($ftpHost)) {
    Write-Host ""
    Write-Host "❌ Host FTP é obrigatório. Cancelando..." -ForegroundColor Red
    exit 1
}

# Usuário FTP
$userPrompt = "Usuário FTP"
if ($existingUser) {
    $userPrompt += " [$existingUser]"
}
$user = Read-Host $userPrompt
if ([string]::IsNullOrWhiteSpace($user)) {
    $user = $existingUser
}
if ([string]::IsNullOrWhiteSpace($user)) {
    Write-Host ""
    Write-Host "❌ Usuário FTP é obrigatório. Cancelando..." -ForegroundColor Red
    exit 1
}

# Senha FTP
$password = Read-Host "Senha FTP" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
    Write-Host ""
    Write-Host "❌ Senha FTP é obrigatória. Cancelando..." -ForegroundColor Red
    exit 1
}

# Porta FTP
$port = Read-Host "Porta FTP [21]"
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "21"
}

# Caminho no servidor
$pathPrompt = "Caminho no servidor (ex: /public_html/)"
if ($existingPath) {
    $pathPrompt += " [$existingPath]"
} else {
    $pathPrompt += " [/public_html/]"
}
$ftpPath = Read-Host $pathPrompt
if ([string]::IsNullOrWhiteSpace($ftpPath)) {
    if ($existingPath) {
        $ftpPath = $existingPath
    } else {
        $ftpPath = "/public_html/"
    }
}

# Site URL
$siteUrl = Read-Host "URL do site [https://grupobiomed.com]"
if ([string]::IsNullOrWhiteSpace($siteUrl)) {
    $siteUrl = "https://grupobiomed.com"
}

Write-Host ""
Write-Host "📝 Configurando..." -ForegroundColor Yellow
Write-Host ""

# Processar linhas do .env
$envLines = $envContent -split "`n"
$newEnvLines = @()
$foundSiteUrl = $false
$foundFTP = $false

foreach ($line in $envLines) {
    if ($line -match "^SITE_URL=") {
        $newEnvLines += "SITE_URL=$siteUrl"
        $foundSiteUrl = $true
    } elseif ($line -match "^FTP_HOST=") {
        $newEnvLines += "FTP_HOST=$ftpHost"
        $foundFTP = $true
    } elseif ($line -match "^FTP_USER=") {
        $newEnvLines += "FTP_USER=$user"
    } elseif ($line -match "^FTP_PASS=") {
        $newEnvLines += "FTP_PASS=$passwordPlain"
    } elseif ($line -match "^FTP_PATH=") {
        $newEnvLines += "FTP_PATH=$ftpPath"
    } elseif ($line -match "^FTP_PORT=") {
        $newEnvLines += "FTP_PORT=$port"
    } else {
        $newEnvLines += $line
    }
}

# Adicionar se não existir
if (-not $foundSiteUrl) {
    if ($newEnvLines.Count -gt 0 -and $newEnvLines[-1] -ne "") {
        $newEnvLines += ""
    }
    $newEnvLines += "# Site Configuration"
    $newEnvLines += "SITE_URL=$siteUrl"
}

if (-not $foundFTP) {
    if ($newEnvLines.Count -gt 0 -and $newEnvLines[-1] -ne "") {
        $newEnvLines += ""
    }
    $newEnvLines += "# FTP Upload (para upload automático de páginas SEO)"
    $newEnvLines += "FTP_HOST=$ftpHost"
    $newEnvLines += "FTP_USER=$user"
    $newEnvLines += "FTP_PASS=$passwordPlain"
    $newEnvLines += "FTP_PATH=$ftpPath"
    $newEnvLines += "FTP_PORT=$port"
} else {
    # Garantir que todas as linhas FTP estejam presentes
    $hasUser = $envLines | Where-Object { $_ -match "^FTP_USER=" }
    $hasPass = $envLines | Where-Object { $_ -match "^FTP_PASS=" }
    $hasPath = $envLines | Where-Object { $_ -match "^FTP_PATH=" }
    $hasPort = $envLines | Where-Object { $_ -match "^FTP_PORT=" }

    if (-not $hasUser -or -not $hasPass -or -not $hasPath -or -not $hasPort) {
        $ftpIndex = -1
        for ($i = 0; $i -lt $newEnvLines.Count; $i++) {
            if ($newEnvLines[$i] -match "^FTP_HOST=") {
                $ftpIndex = $i
                break
            }
        }
        if ($ftpIndex -ne -1) {
            $insertIndex = $ftpIndex + 1
            if (-not $hasUser) {
                $newEnvLines = @($newEnvLines[0..($insertIndex-1)]) + @("FTP_USER=$user") + @($newEnvLines[$insertIndex..($newEnvLines.Count-1)])
                $insertIndex++
            }
            if (-not $hasPass) {
                $newEnvLines = @($newEnvLines[0..($insertIndex-1)]) + @("FTP_PASS=$passwordPlain") + @($newEnvLines[$insertIndex..($newEnvLines.Count-1)])
                $insertIndex++
            }
            if (-not $hasPath) {
                $newEnvLines = @($newEnvLines[0..($insertIndex-1)]) + @("FTP_PATH=$ftpPath") + @($newEnvLines[$insertIndex..($newEnvLines.Count-1)])
                $insertIndex++
            }
            if (-not $hasPort) {
                $newEnvLines = @($newEnvLines[0..($insertIndex-1)]) + @("FTP_PORT=$port") + @($newEnvLines[$insertIndex..($newEnvLines.Count-1)])
            }
        }
    }
}

# Escrever arquivo
$newEnvContent = $newEnvLines -join "`n"
$newEnvContent | Set-Content $envPath -Encoding UTF8

Write-Host ""
Write-Host "✅ FTP configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuração salva:" -ForegroundColor Cyan
Write-Host "   Host: $ftpHost" -ForegroundColor White
Write-Host "   Usuário: $user" -ForegroundColor White
Write-Host "   Porta: $port" -ForegroundColor White
Write-Host "   Caminho: $ftpPath" -ForegroundColor White
Write-Host "   Site: $siteUrl" -ForegroundColor White
Write-Host ""
Write-Host "💡 Agora quando você clicar 'PUBLICAR', o sistema fará upload automático!" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 Reinicie o backend para aplicar as mudanças:" -ForegroundColor Cyan
Write-Host "   cd backend && npm run dev" -ForegroundColor White
Write-Host ""

