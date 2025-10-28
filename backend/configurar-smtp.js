#!/usr/bin/env node

/**
 * Script Interativo para Configurar SMTP
 * Execute: node configurar-smtp.js
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

async function configurarSMTP() {
  console.log('\n🚀 CONFIGURADOR DE SMTP - Marketing System\n');
  console.log('Este script vai ajudar você a configurar o SMTP do Gmail.\n');
  
  console.log('📋 PASSO 1: Gerar Senha de App no Google');
  console.log('   1. Acesse: https://myaccount.google.com/security');
  console.log('   2. Ative "Verificação em duas etapas" (se não tiver)');
  console.log('   3. Vá em "Senhas de app"');
  console.log('   4. Selecione "Email" → "Outro (personalizado)"');
  console.log('   5. Digite "Marketing System"');
  console.log('   6. Gere e COPIE a senha (16 caracteres)\n');
  
  const continuar = await question('Já tem a senha de app pronta? (s/n): ');
  if (continuar.toLowerCase() !== 's' && continuar.toLowerCase() !== 'sim') {
    console.log('\n⚠️  Configure a senha de app primeiro e execute o script novamente!');
    rl.close();
    return;
  }

  const email = await question('\n📧 Seu email Gmail (ex: joao@gmail.com): ');
  const senhaApp = await question('🔑 Senha de app (16 caracteres): ');
  const nomeExibicao = await question('👤 Nome para exibir (ex: Grupo Biomed) [padrão: Grupo Biomed]: ') || 'Grupo Biomed';

  // Validar email
  if (!email.includes('@gmail.com')) {
    console.log('\n⚠️  Aviso: Email deve ser do Gmail (@gmail.com)');
  }

  // Limpar senha (remover espaços)
  const senhaLimpa = senhaApp.replace(/\s/g, '');

  // Criar conteúdo do .env
  const envContent = `# Marketing System - Configurações
# Configurado automaticamente em ${new Date().toLocaleString('pt-BR')}

PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# ==============================================
# CONFIGURAÇÃO DE EMAIL (GMAIL)
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${email}
SMTP_PASS=${senhaLimpa}
SMTP_FROM="${nomeExibicao} <${email}>"

# Limite de envio (emails por minuto)
EMAIL_RATE_LIMIT=10

# ==============================================
# REDES SOCIAIS (OPCIONAL)
# ==============================================
FACEBOOK_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_ACCOUNT_ID=
`;

  // Caminho do arquivo .env
  const envPath = path.join(__dirname, '.env');

  try {
    // Backup do arquivo existente se houver
    if (fs.existsSync(envPath)) {
      const backupPath = path.join(__dirname, `.env.backup.${Date.now()}`);
      fs.copyFileSync(envPath, backupPath);
      console.log(`\n✅ Backup do .env anterior criado: ${path.basename(backupPath)}`);
    }

    // Escrever novo arquivo
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ SUCESSO! Arquivo .env configurado!');
    console.log('\n📋 Configurações aplicadas:');
    console.log(`   Email: ${email}`);
    console.log(`   Remetente: ${nomeExibicao} <${email}>`);
    console.log(`   SMTP: smtp.gmail.com:587`);
    console.log('\n🔄 PRÓXIMOS PASSOS:');
    console.log('   1. Reinicie o backend (Ctrl+C e depois npm run dev)');
    console.log('   2. Vá em "Configurações SMTP" no sistema');
    console.log('   3. Clique em "Testar Conexão"');
    console.log('   4. Se aparecer ✅, está pronto para enviar emails!');
    console.log('\n🚀 Boa sorte!\n');

  } catch (error) {
    console.error('\n❌ Erro ao criar arquivo .env:', error.message);
    console.log('\n💡 Crie manualmente o arquivo .env com o seguinte conteúdo:\n');
    console.log(envContent);
  }

  rl.close();
}

configurarSMTP().catch(console.error);

