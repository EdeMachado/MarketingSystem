require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Verificando configuração do SendGrid...\n');

// Verificar variáveis de ambiente
const config = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? `${process.env.SMTP_PASS.substring(0, 10)}...` : 'NÃO CONFIGURADO',
  from: process.env.SMTP_FROM,
};

console.log('📋 Configuração atual:');
console.log(`   SMTP_HOST: ${config.host}`);
console.log(`   SMTP_PORT: ${config.port}`);
console.log(`   SMTP_USER: ${config.user}`);
console.log(`   SMTP_PASS: ${config.pass}`);
console.log(`   SMTP_FROM: ${config.from}`);
console.log('');

// Verificar se está tudo configurado
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ ERRO: Configuração incompleta!');
  console.error('   Verifique se todas as variáveis SMTP estão configuradas no .env');
  process.exit(1);
}

// Criar transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para outras portas
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 30000,
});

console.log('🔌 Testando conexão com SendGrid...\n');

// Testar conexão
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ ERRO na conexão:');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'EAUTH') {
      console.error('💡 Possíveis causas:');
      console.error('   1. API Key do SendGrid inválida ou expirada');
      console.error('   2. API Key não tem permissão "Mail Send"');
      console.error('   3. Verifique se copiou a API key completa');
      console.error('\n📝 Como verificar:');
      console.error('   1. Acesse https://app.sendgrid.com/settings/api_keys');
      console.error('   2. Verifique se a API key existe e está ativa');
      console.error('   3. Verifique se tem permissão "Mail Send"');
      console.error('   4. Se necessário, crie uma nova API key');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('💡 Possíveis causas:');
      console.error('   1. Problema de conexão com a internet');
      console.error('   2. Firewall bloqueando conexão SMTP');
      console.error('   3. SendGrid temporariamente indisponível');
    } else {
      console.error('💡 Erro desconhecido. Verifique a configuração.');
    }
    
    process.exit(1);
  } else {
    console.log('✅ Conexão com SendGrid estabelecida com sucesso!\n');
    
    console.log('📧 Testando envio de email...\n');
    
    // Enviar email de teste
    const testEmail = {
      from: process.env.SMTP_FROM || 'contato@grupobiomed.com',
      to: process.env.SMTP_FROM || 'contato@grupobiomed.com', // Enviar para si mesmo para teste
      subject: 'Teste de Configuração SendGrid - Marketing System',
      html: `
        <h2>✅ Teste de Configuração SendGrid</h2>
        <p>Se você recebeu este email, a configuração do SendGrid está funcionando corretamente!</p>
        <hr>
        <p><strong>Configuração:</strong></p>
        <ul>
          <li>Servidor: ${process.env.SMTP_HOST}</li>
          <li>Porta: ${process.env.SMTP_PORT}</li>
          <li>Usuário: ${process.env.SMTP_USER}</li>
        </ul>
        <p><small>Enviado em ${new Date().toLocaleString('pt-BR')}</small></p>
      `,
      text: 'Teste de Configuração SendGrid - Se você recebeu este email, a configuração está funcionando!',
    };
    
    transporter.sendMail(testEmail, function (error, info) {
      if (error) {
        console.error('❌ ERRO ao enviar email:');
        console.error(`   ${error.message}\n`);
        
        if (error.response) {
          console.error('Resposta do servidor:');
          console.error(`   ${error.response}\n`);
        }
        
        process.exit(1);
      } else {
        console.log('✅ Email de teste enviado com sucesso!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Enviado para: ${testEmail.to}\n`);
        console.log('📬 Verifique sua caixa de entrada (e spam) para confirmar o recebimento.\n');
        console.log('✅ Configuração do SendGrid está COMPLETA e FUNCIONANDO!\n');
        process.exit(0);
      }
    });
  }
});

