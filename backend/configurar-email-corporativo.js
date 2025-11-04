#!/usr/bin/env node

/**
 * Script Interativo para Configurar Email Corporativo grupobiomed.com
 * Execute: node configurar-email-corporativo.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function configurarEmailCorporativo() {
  console.log('\n📧 CONFIGURADOR DE EMAIL CORPORATIVO - grupobiomed.com\n');
  console.log('Este script vai ajudar você a configurar o SMTP corporativo.\n');
  
  // Email corporativo
  const emailCorporativo = await question('📧 Email corporativo (ex: contato@grupobiomed.com): ');
  
  if (!emailCorporativo.includes('@grupobiomed.com')) {
    console.log('\n⚠️  Aviso: Email deve ser do domínio @grupobiomed.com');
    const continuar = await question('Continuar mesmo assim? (s/n): ');
    if (continuar.toLowerCase() !== 's' && continuar.toLowerCase() !== 'sim') {
      rl.close();
      return;
    }
  }

  // Identificar provedor
  console.log('\n🔍 Qual provedor de email você usa?');
  console.log('   1. Google Workspace (Gmail Empresarial)');
  console.log('   2. Microsoft 365 / Outlook');
  console.log('   3. Outro (cPanel, Zimbra, etc)');
  
  const provedor = await question('\nEscolha uma opção (1, 2 ou 3): ');
  
  let smtpHost, smtpPort, smtpUser, smtpPass, precisaSenhaApp = false;

  if (provedor === '1') {
    // Google Workspace
    console.log('\n📋 Google Workspace detectado!');
    console.log('\n⚠️  IMPORTANTE: Você precisa de uma SENHA DE APP (não a senha normal)');
    console.log('\n📝 Como gerar senha de app:');
    console.log('   1. Acesse: https://myaccount.google.com/apppasswords');
    console.log('   2. Ou: https://admin.google.com → Conta → Segurança → Senhas de app');
    console.log('   3. Selecione "Email" e "Outro (personalizado)"');
    console.log('   4. Digite "Marketing System"');
    console.log('   5. Gere e COPIE a senha (16 caracteres)\n');
    
    smtpHost = 'smtp.gmail.com';
    smtpPort = 587;
    smtpUser = emailCorporativo;
    precisaSenhaApp = true;
    
    const temSenhaApp = await question('Já tem a senha de app pronta? (s/n): ');
    if (temSenhaApp.toLowerCase() !== 's' && temSenhaApp.toLowerCase() !== 'sim') {
      console.log('\n⚠️  Gere a senha de app primeiro e execute o script novamente!');
      rl.close();
      return;
    }
    
    const senhaApp = await question('🔑 Senha de app (16 caracteres): ');
    smtpPass = senhaApp.replace(/\s/g, ''); // Remove espaços
    
  } else if (provedor === '2') {
    // Microsoft 365 / Outlook
    console.log('\n📋 Microsoft 365 / Outlook detectado!');
    
    smtpHost = 'smtp.office365.com';
    smtpPort = 587;
    smtpUser = emailCorporativo;
    
    const senha = await question('🔑 Senha do email corporativo: ');
    smtpPass = senha;
    
    console.log('\n💡 Se não funcionar, tente:');
    console.log('   - smtp-mail.outlook.com:587');
    console.log('   - Verificar se precisa autenticação moderna');
    
  } else {
    // Outro provedor
    console.log('\n📋 Provedor personalizado');
    
    const hostCustom = await question('🌐 Servidor SMTP (ex: mail.grupobiomed.com ou smtp.grupobiomed.com): ');
    const portCustom = await question('🔌 Porta SMTP [587 padrão]: ') || '587';
    
    smtpHost = hostCustom;
    smtpPort = parseInt(portCustom);
    smtpUser = emailCorporativo;
    
    const senha = await question('🔑 Senha do email corporativo: ');
    smtpPass = senha;
  }

  const nomeExibicao = await question('👤 Nome para exibir [padrão: Grupo Biomed]: ') || 'Grupo Biomed';

  // Criar conteúdo do .env
  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  // Ler .env existente ou usar exemplo
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    const examplePath = path.join(__dirname, 'env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf8');
    }
  }

  // Atualizar configurações SMTP
  envContent = envContent.replace(/SMTP_HOST=.*/g, `SMTP_HOST=${smtpHost}`);
  envContent = envContent.replace(/SMTP_PORT=.*/g, `SMTP_PORT=${smtpPort}`);
  envContent = envContent.replace(/SMTP_USER=.*/g, `SMTP_USER=${smtpUser}`);
  envContent = envContent.replace(/SMTP_PASS=.*/g, `SMTP_PASS=${smtpPass}`);
  envContent = envContent.replace(/SMTP_FROM=.*/g, `SMTP_FROM="${nomeExibicao} <${emailCorporativo}>"`);

  // Garantir que existe
  if (!envContent.includes('SMTP_HOST=')) {
    envContent += '\n# Email Configuration (SMTP)\n';
    envContent += `SMTP_HOST=${smtpHost}\n`;
    envContent += `SMTP_PORT=${smtpPort}\n`;
    envContent += `SMTP_USER=${smtpUser}\n`;
    envContent += `SMTP_PASS=${smtpPass}\n`;
    envContent += `SMTP_FROM="${nomeExibicao} <${emailCorporativo}>"\n`;
  }

  try {
    // Backup
    if (fs.existsSync(envPath)) {
      const backupPath = path.join(__dirname, `.env.backup.${Date.now()}`);
      fs.copyFileSync(envPath, backupPath);
      console.log(`\n✅ Backup do .env anterior criado: ${path.basename(backupPath)}`);
    }

    // Salvar
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ SUCESSO! Arquivo .env configurado!');
    console.log('\n📋 Configurações aplicadas:');
    console.log(`   📧 Email: ${emailCorporativo}`);
    console.log(`   👤 Remetente: ${nomeExibicao} <${emailCorporativo}>`);
    console.log(`   🌐 SMTP: ${smtpHost}:${smtpPort}`);
    if (precisaSenhaApp) {
      console.log(`   🔑 Senha de app: ${smtpPass.substring(0, 4)}****${smtpPass.substring(smtpPass.length - 4)}`);
    }
    console.log('\n🔄 PRÓXIMOS PASSOS:');
    console.log('   1. Reinicie o backend (Ctrl+C e depois npm run dev)');
    console.log('   2. Acesse: http://localhost:3002/configuracoes');
    console.log('   3. Clique em "🔄 Testar Conexão SMTP"');
    console.log('   4. Se aparecer ✅, está pronto para enviar emails!');
    
    if (provedor === '1') {
      console.log('\n💡 Dica: Se der erro, verifique se a senha de app está correta');
      console.log('   e se a verificação em duas etapas está ativada.');
    } else if (provedor === '2') {
      console.log('\n💡 Dica: Microsoft 365 pode precisar de autenticação moderna.');
      console.log('   Se não funcionar, entre em contato com o administrador do sistema.');
    }
    
    console.log('\n🚀 Boa sorte!\n');

  } catch (error) {
    console.error('\n❌ Erro ao criar arquivo .env:', error.message);
  }

  rl.close();
}

configurarEmailCorporativo().catch(console.error);

