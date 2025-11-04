#!/usr/bin/env node

/**
 * Script para atualizar SMTP no .env
 * Uso: node atualizar-smtp.js <email> <senha-app> <nome-exibicao>
 * Exemplo: node atualizar-smtp.js joao@gmail.com abcd efgh ijkl mnop "Grupo Biomed"
 */

const fs = require('fs');
const path = require('path');

const email = process.argv[2];
const senhaApp = process.argv[3];
const nomeExibicao = process.argv[4] || 'Grupo Biomed';

if (!email || !senhaApp) {
  console.log('\n❌ ERRO: Faltam parâmetros!');
  console.log('\n📋 Uso:');
  console.log('   node atualizar-smtp.js <email> <senha-app> [nome-exibicao]');
  console.log('\n💡 Exemplo:');
  console.log('   node atualizar-smtp.js joao@gmail.com "abcd efgh ijkl mnop" "Grupo Biomed"');
  console.log('\n⚠️  Nota: Se a senha tiver espaços, use aspas!\n');
  process.exit(1);
}

// Limpar senha (remover espaços)
const senhaLimpa = senhaApp.replace(/\s/g, '');

// Ler .env atual
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  // Se não existe, criar baseado no env.example
  const examplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(examplePath)) {
    envContent = fs.readFileSync(examplePath, 'utf8');
  }
}

// Atualizar linhas SMTP
envContent = envContent.replace(/SMTP_USER=.*/g, `SMTP_USER=${email}`);
envContent = envContent.replace(/SMTP_PASS=.*/g, `SMTP_PASS=${senhaLimpa}`);
envContent = envContent.replace(/SMTP_FROM=.*/g, `SMTP_FROM="${nomeExibicao} <${email}>"`);

// Garantir que SMTP_HOST e SMTP_PORT existam
if (!envContent.includes('SMTP_HOST=')) {
  envContent += '\n# Email Configuration (SMTP)\n';
  envContent += 'SMTP_HOST=smtp.gmail.com\n';
  envContent += 'SMTP_PORT=587\n';
} else {
  // Atualizar se necessário
  envContent = envContent.replace(/SMTP_HOST=.*/g, 'SMTP_HOST=smtp.gmail.com');
  envContent = envContent.replace(/SMTP_PORT=.*/g, 'SMTP_PORT=587');
}

// Backup
if (fs.existsSync(envPath)) {
  const backupPath = path.join(__dirname, `.env.backup.${Date.now()}`);
  fs.copyFileSync(envPath, backupPath);
  console.log(`✅ Backup criado: ${path.basename(backupPath)}`);
}

// Salvar
try {
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ SUCESSO! Arquivo .env atualizado!');
  console.log('\n📋 Configurações aplicadas:');
  console.log(`   📧 Email: ${email}`);
  console.log(`   👤 Remetente: ${nomeExibicao} <${email}>`);
  console.log(`   🔑 Senha de app: ${senhaLimpa.substring(0, 4)}****${senhaLimpa.substring(senhaLimpa.length - 4)}`);
  console.log(`   🌐 SMTP: smtp.gmail.com:587`);
  console.log('\n🔄 PRÓXIMOS PASSOS:');
  console.log('   1. Reinicie o backend (Ctrl+C e depois npm run dev)');
  console.log('   2. Acesse: http://localhost:3002/configuracoes');
  console.log('   3. Clique em "🔄 Testar Conexão SMTP"');
  console.log('   4. Se aparecer ✅, está pronto para enviar emails!');
  console.log('\n🚀 Boa sorte!\n');
  
} catch (error) {
  console.error('\n❌ Erro ao atualizar arquivo .env:', error.message);
  process.exit(1);
}

