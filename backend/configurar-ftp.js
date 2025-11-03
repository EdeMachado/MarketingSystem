/**
 * Script interativo para configurar FTP
 * Executa: node configurar-ftp.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function configurarFTP() {
  console.log('\n🔧 CONFIGURAR FTP - Upload Automático\n');
  console.log('Este script vai configurar o FTP para upload automático de páginas SEO.\n');

  // Verificar se .env existe
  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Ler valores existentes
  const getEnvValue = (key) => {
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
  };

  const existingHost = getEnvValue('FTP_HOST');
  const existingUser = getEnvValue('FTP_USER');
  const existingPath = getEnvValue('FTP_PATH');

  console.log('📋 Por favor, forneça as informações do FTP:');
  console.log('\n💡 ONDE ENCONTRAR:');
  console.log('   1. Acesse: grupobiomed.com/cpanel');
  console.log('   2. Clique em "FTP Accounts"');
  console.log('   3. Copie: Host, Usuário, Senha');
  console.log('   4. Ou veja: CONFIGURAR-FTP-RAPIDO.md\n');

  // Host FTP
  const host = await question(`Host FTP${existingHost ? ` [${existingHost}]` : ''}: `) || existingHost || '';
  if (!host) {
    console.log('\n❌ Host FTP é obrigatório. Cancelando...\n');
    rl.close();
    return;
  }

  // Usuário FTP
  const user = await question(`Usuário FTP${existingUser ? ` [${existingUser}]` : ''}: `) || existingUser || '';
  if (!user) {
    console.log('\n❌ Usuário FTP é obrigatório. Cancelando...\n');
    rl.close();
    return;
  }

  // Senha FTP
  const password = await question('Senha FTP: ');
  if (!password) {
    console.log('\n❌ Senha FTP é obrigatória. Cancelando...\n');
    rl.close();
    return;
  }

  // Porta FTP
  const portInput = await question('Porta FTP [21]: ');
  const port = portInput || '21';

  // Caminho no servidor
  const ftpPath = await question(`Caminho no servidor (ex: /public_html/)${existingPath ? ` [${existingPath}]` : ''}: `) || existingPath || '/public_html/';

  // Site URL
  const siteUrl = await question('URL do site [https://grupobiomed.com]: ') || 'https://grupobiomed.com';

  console.log('\n📝 Configurando...\n');

  // Atualizar ou criar .env
  const envLines = envContent.split('\n');
  const newEnvLines = [];
  let foundSiteUrl = false;
  let foundFTP = false;

  // Processar linhas existentes
  for (let i = 0; i < envLines.length; i++) {
    const line = envLines[i];
    if (line.startsWith('SITE_URL=')) {
      newEnvLines.push(`SITE_URL=${siteUrl}`);
      foundSiteUrl = true;
    } else if (line.startsWith('FTP_HOST=')) {
      newEnvLines.push(`FTP_HOST=${host}`);
      foundFTP = true;
    } else if (line.startsWith('FTP_USER=')) {
      newEnvLines.push(`FTP_USER=${user}`);
    } else if (line.startsWith('FTP_PASS=')) {
      newEnvLines.push(`FTP_PASS=${password}`);
    } else if (line.startsWith('FTP_PATH=')) {
      newEnvLines.push(`FTP_PATH=${ftpPath}`);
    } else if (line.startsWith('FTP_PORT=')) {
      newEnvLines.push(`FTP_PORT=${port}`);
    } else {
      newEnvLines.push(line);
    }
  }

  // Adicionar se não existir
  if (!foundSiteUrl) {
    if (newEnvLines.length > 0 && newEnvLines[newEnvLines.length - 1] !== '') {
      newEnvLines.push('');
    }
    newEnvLines.push('# Site Configuration');
    newEnvLines.push(`SITE_URL=${siteUrl}`);
  }

  if (!foundFTP) {
    if (newEnvLines.length > 0 && newEnvLines[newEnvLines.length - 1] !== '') {
      newEnvLines.push('');
    }
    newEnvLines.push('# FTP Upload (para upload automático de páginas SEO)');
    newEnvLines.push(`FTP_HOST=${host}`);
    newEnvLines.push(`FTP_USER=${user}`);
    newEnvLines.push(`FTP_PASS=${password}`);
    newEnvLines.push(`FTP_PATH=${ftpPath}`);
    newEnvLines.push(`FTP_PORT=${port}`);
  } else {
    // Garantir que todas as linhas FTP estejam presentes
    let hasUser = envLines.some(l => l.startsWith('FTP_USER='));
    let hasPass = envLines.some(l => l.startsWith('FTP_PASS='));
    let hasPath = envLines.some(l => l.startsWith('FTP_PATH='));
    let hasPort = envLines.some(l => l.startsWith('FTP_PORT='));

    if (!hasUser || !hasPass || !hasPath || !hasPort) {
      // Encontrar onde está FTP_HOST e adicionar após ele
      const ftpIndex = newEnvLines.findIndex(l => l.startsWith('FTP_HOST='));
      if (ftpIndex !== -1) {
        const insertAfter = ftpIndex + 1;
        if (!hasUser) newEnvLines.splice(insertAfter, 0, `FTP_USER=${user}`);
        if (!hasPass) newEnvLines.splice(insertAfter + (hasUser ? 0 : 1), 0, `FTP_PASS=${password}`);
        if (!hasPath) newEnvLines.splice(insertAfter + (hasUser ? 0 : 1) + (hasPass ? 0 : 1), 0, `FTP_PATH=${ftpPath}`);
        if (!hasPort) newEnvLines.splice(insertAfter + (hasUser ? 0 : 1) + (hasPass ? 0 : 1) + (hasPath ? 0 : 1), 0, `FTP_PORT=${port}`);
      }
    }
  }

  // Escrever arquivo
  fs.writeFileSync(envPath, newEnvLines.join('\n'), 'utf-8');

  console.log('✅ FTP configurado com sucesso!\n');
  console.log('📋 Configuração salva:');
  console.log(`   Host: ${host}`);
  console.log(`   Usuário: ${user}`);
  console.log(`   Porta: ${port}`);
  console.log(`   Caminho: ${ftpPath}`);
  console.log(`   Site: ${siteUrl}`);
  console.log('\n💡 Agora quando você clicar "PUBLICAR", o sistema fará upload automático!\n');
  console.log('🔄 Reinicie o backend para aplicar as mudanças:\n');
  console.log('   cd backend && npm run dev\n');

  rl.close();
}

// Executar
configurarFTP().catch((error) => {
  console.error('\n❌ Erro:', error.message);
  rl.close();
  process.exit(1);
});
