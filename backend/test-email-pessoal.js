require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 TESTE DE ENVIO DE EMAIL - SENDGRID\n');

// Ler email do usuário
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Digite seu email para receber o teste: ', async (email) => {
  console.log(`\n📬 Enviando email de teste para: ${email}\n`);

  // Verificar configuração
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERRO: SMTP não configurado no .env');
    console.error('   Configure SMTP_HOST, SMTP_USER e SMTP_PASS');
    rl.close();
    process.exit(1);
  }

  // Criar transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
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

  // Verificar conexão
  console.log('🔌 Verificando conexão...');
  try {
    await transporter.verify();
    console.log('✅ Conexão OK!\n');
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    rl.close();
    process.exit(1);
  }

  // Enviar email de teste
  const testEmail = {
    from: process.env.SMTP_FROM || 'GRUPO BIOMED <contato@grupobiomed.com>',
    to: email,
    subject: '🎉 Teste do Marketing System - SendGrid',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #10b981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .info { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Marketing System</h1>
            <p>Teste de Envio de Email</p>
          </div>
          <div class="content">
            <div class="success">
              ✅ <strong>Email enviado com sucesso!</strong>
            </div>
            
            <p>Olá!</p>
            <p>Este é um <strong>email de teste</strong> do sistema de marketing usando <strong>SendGrid</strong>.</p>
            
            <div class="info">
              <h3>📋 Informações do Teste:</h3>
              <ul>
                <li><strong>Servidor SMTP:</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>Porta:</strong> ${process.env.SMTP_PORT || '587'}</li>
                <li><strong>Remetente:</strong> ${process.env.SMTP_FROM || 'contato@grupobiomed.com'}</li>
                <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              </ul>
            </div>
            
            <p>Se você recebeu este email, significa que:</p>
            <ul>
              <li>✅ SendGrid está configurado corretamente</li>
              <li>✅ A API Key está funcionando</li>
              <li>✅ O remetente está verificado</li>
              <li>✅ O sistema está pronto para enviar campanhas!</li>
            </ul>
            
            <div class="info">
              <h3>🚀 Próximos Passos:</h3>
              <p>Agora você pode:</p>
              <ul>
                <li>Criar campanhas de email</li>
                <li>Enviar para múltiplos contatos</li>
                <li>Acompanhar estatísticas</li>
                <li>Monitorar a quota do SendGrid</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Este é um email automático do Marketing System</p>
              <p>GRUPO BIOMED - Sistema de Marketing</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🎉 Marketing System - Teste de Envio de Email

✅ Email enviado com sucesso!

Olá!

Este é um email de teste do sistema de marketing usando SendGrid.

Se você recebeu este email, significa que:
✅ SendGrid está configurado corretamente
✅ A API Key está funcionando
✅ O remetente está verificado
✅ O sistema está pronto para enviar campanhas!

Informações do Teste:
- Servidor SMTP: ${process.env.SMTP_HOST}
- Porta: ${process.env.SMTP_PORT || '587'}
- Remetente: ${process.env.SMTP_FROM || 'contato@grupobiomed.com'}
- Data/Hora: ${new Date().toLocaleString('pt-BR')}

Próximos Passos:
- Criar campanhas de email
- Enviar para múltiplos contatos
- Acompanhar estatísticas
- Monitorar a quota do SendGrid

---
Este é um email automático do Marketing System
GRUPO BIOMED - Sistema de Marketing
    `,
  };

  console.log('📤 Enviando email...');
  try {
    const info = await transporter.sendMail(testEmail);
    console.log('\n✅ Email enviado com sucesso!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Enviado para: ${email}\n`);
    console.log('📬 Verifique sua caixa de entrada (e spam)!\n');
    console.log('💡 Dica: Se não chegou, verifique:');
    console.log('   1. Caixa de spam/lixo eletrônico');
    console.log('   2. Aguarde alguns minutos (pode demorar)');
    console.log('   3. Verifique se o email está correto\n');
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO ao enviar email:');
    console.error(`   ${error.message}\n`);
    
    if (error.response) {
      console.error('Resposta do servidor:');
      console.error(`   ${error.response}\n`);
    }
    
    rl.close();
    process.exit(1);
  }
});

