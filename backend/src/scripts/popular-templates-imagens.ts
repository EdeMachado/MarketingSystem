import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Templates profissionais com imagens para Grupo Biomed
const templatesComImagens = [
  {
    name: 'Promoção - Saúde Ocupacional',
    subject: '🎯 Exames de Saúde Ocupacional - Oferta Especial',
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; }
    .header img { max-width: 200px; height: auto; }
    .content { padding: 30px; }
    .title { font-size: 24px; color: #1e40af; font-weight: bold; margin-bottom: 20px; }
    .image-banner { width: 100%; max-width: 540px; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0; }
    .text { color: #333; line-height: 1.6; margin-bottom: 20px; }
    .highlight { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: white; margin: 0;">GRUPO BIOMED</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0;">Saúde Ocupacional</p>
    </div>
    <div class="content">
      <h2 class="title">Olá {{name}}! 👋</h2>
      <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop" alt="Saúde Ocupacional" class="image-banner">
      <p class="text">
        Temos uma <strong>oferta especial</strong> em exames de saúde ocupacional para sua empresa!
      </p>
      <div class="highlight">
        <h3 style="margin-top: 0; color: #1e40af;">✨ Oferta Especial</h3>
        <p style="margin-bottom: 0;">
          <strong>Desconto de até 30%</strong> em pacotes completos de exames admissionais, periódicos e demissionais.
        </p>
      </div>
      <p class="text">
        Nossos serviços incluem:
      </p>
      <ul style="color: #333; line-height: 2;">
        <li>✅ Exames admissionais</li>
        <li>✅ Exames periódicos</li>
        <li>✅ Exames demissionais</li>
        <li>✅ Atestados de saúde ocupacional</li>
        <li>✅ Consultas médicas</li>
      </ul>
      <div style="text-align: center;">
        <a href="https://grupobiomed.com/contato" class="button">Solicitar Orçamento</a>
      </div>
    </div>
    <div class="footer">
      <p>GRUPO BIOMED - Saúde Ocupacional</p>
      <p>contato@grupobiomed.com | (11) 1234-5678</p>
      <p style="margin-top: 10px;">
        <a href="#" style="color: #1e40af;">Descadastrar</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    textBody: `Olá {{name}}!\n\nTemos uma oferta especial em exames de saúde ocupacional para sua empresa!\n\nDesconto de até 30% em pacotes completos.\n\nSolicite seu orçamento: https://grupobiomed.com/contato\n\nGRUPO BIOMED`,
    type: 'email',
    category: 'promotional',
    variables: JSON.stringify(['name', 'company']),
    preview: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
  },
  {
    name: 'Newsletter - Dicas de Saúde',
    subject: '📰 Newsletter Grupo Biomed - Dicas de Saúde no Trabalho',
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #10b981; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .content { padding: 30px; }
    .article { margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
    .article:last-child { border-bottom: none; }
    .article img { width: 100%; max-width: 540px; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
    .article-title { font-size: 20px; color: #10b981; font-weight: bold; margin-bottom: 10px; }
    .article-text { color: #333; line-height: 1.6; }
    .read-more { color: #10b981; text-decoration: none; font-weight: bold; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 Newsletter Grupo Biomed</h1>
      <p style="color: #d1fae5; margin: 10px 0 0 0;">Dicas de Saúde no Trabalho</p>
    </div>
    <div class="content">
      <h2 style="color: #10b981;">Olá {{name}}!</h2>
      <p style="color: #666; margin-bottom: 30px;">Confira as principais dicas de saúde ocupacional desta semana:</p>
      
      <div class="article">
        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop" alt="Ergonomia no Trabalho">
        <div class="article-title">💺 Ergonomia no Trabalho</div>
        <div class="article-text">
          Ajuste sua cadeira e mesa para manter uma postura adequada. Mantenha os pés apoiados no chão e os cotovelos em 90 graus.
        </div>
        <a href="https://grupobiomed.com/blog/ergonomia" class="read-more">Ler mais →</a>
      </div>
      
      <div class="article">
        <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop" alt="Pausas Ativas">
        <div class="article-title">⏸️ Importância das Pausas Ativas</div>
        <div class="article-text">
          Faça pausas de 5 minutos a cada hora para se alongar e movimentar. Isso previne lesões e melhora a produtividade.
        </div>
        <a href="https://grupobiomed.com/blog/pausas-ativas" class="read-more">Ler mais →</a>
      </div>
      
      <div class="article">
        <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop" alt="Exames Periódicos">
        <div class="article-title">🏥 Exames Periódicos: Por que são importantes?</div>
        <div class="article-text">
          Os exames periódicos ajudam a identificar problemas de saúde precocemente, garantindo bem-estar e segurança no trabalho.
        </div>
        <a href="https://grupobiomed.com/blog/exames-periodicos" class="read-more">Ler mais →</a>
      </div>
    </div>
    <div class="footer">
      <p>GRUPO BIOMED - Sua saúde em primeiro lugar</p>
      <p>contato@grupobiomed.com | (11) 1234-5678</p>
      <p style="margin-top: 10px;">
        <a href="#" style="color: #10b981;">Descadastrar</a> | 
        <a href="https://grupobiomed.com" style="color: #10b981;">Visite nosso site</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    textBody: `Newsletter Grupo Biomed\n\nDicas de Saúde no Trabalho:\n\n1. Ergonomia no Trabalho\n2. Importância das Pausas Ativas\n3. Exames Periódicos\n\nAcesse: https://grupobiomed.com/blog\n\nGRUPO BIOMED`,
    type: 'email',
    category: 'newsletter',
    variables: JSON.stringify(['name']),
    preview: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop',
  },
  {
    name: 'Email de Boas-Vindas',
    subject: '🎉 Bem-vindo ao Grupo Biomed!',
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 32px; }
    .content { padding: 40px 30px; text-align: center; }
    .welcome-image { width: 100%; max-width: 500px; height: 300px; object-fit: cover; border-radius: 12px; margin: 20px auto; display: block; }
    .title { font-size: 28px; color: #7c3aed; font-weight: bold; margin-bottom: 20px; }
    .text { color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 30px; }
    .features { display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap; }
    .feature { flex: 1; min-width: 150px; margin: 10px; text-align: center; }
    .feature-icon { font-size: 40px; margin-bottom: 10px; }
    .feature-text { color: #666; font-size: 14px; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo, {{name}}!</h1>
    </div>
    <div class="content">
      <img src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop" alt="Bem-vindo" class="welcome-image">
      <h2 class="title">É um prazer ter você conosco!</h2>
      <p class="text">
        Obrigado por se cadastrar no <strong>Grupo Biomed</strong>! Estamos comprometidos em oferecer os melhores serviços de saúde ocupacional para você e sua empresa.
      </p>
      <div class="features">
        <div class="feature">
          <div class="feature-icon">🏥</div>
          <div class="feature-text">Exames<br>Completos</div>
        </div>
        <div class="feature">
          <div class="feature-icon">👨‍⚕️</div>
          <div class="feature-text">Profissionais<br>Qualificados</div>
        </div>
        <div class="feature">
          <div class="feature-icon">⚡</div>
          <div class="feature-text">Agilidade<br>e Qualidade</div>
        </div>
      </div>
      <a href="https://grupobiomed.com/sobre" class="button">Conheça Nossos Serviços</a>
    </div>
    <div class="footer">
      <p><strong>GRUPO BIOMED</strong></p>
      <p>Saúde Ocupacional | Exames Médicos | Consultas</p>
      <p>contato@grupobiomed.com | (11) 1234-5678</p>
      <p style="margin-top: 15px;">
        <a href="https://grupobiomed.com" style="color: #7c3aed;">Visite nosso site</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    textBody: `Bem-vindo, {{name}}!\n\nÉ um prazer ter você conosco no Grupo Biomed!\n\nEstamos comprometidos em oferecer os melhores serviços de saúde ocupacional.\n\nConheça nossos serviços: https://grupobiomed.com/sobre\n\nGRUPO BIOMED`,
    type: 'email',
    category: 'transactional',
    variables: JSON.stringify(['name']),
    preview: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
  },
  {
    name: 'Lembrete - Exame Agendado',
    subject: '📅 Lembrete: Seu exame está agendado para {{data}}',
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #f59e0b; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .content { padding: 30px; }
    .calendar-icon { font-size: 60px; text-align: center; margin: 20px 0; }
    .title { font-size: 24px; color: #f59e0b; font-weight: bold; margin-bottom: 20px; text-align: center; }
    .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #fde68a; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; color: #92400e; }
    .info-value { color: #333; }
    .text { color: #333; line-height: 1.6; margin-bottom: 20px; }
    .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .warning-text { color: #991b1b; margin: 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Lembrete de Exame</h1>
    </div>
    <div class="content">
      <div class="calendar-icon">📅</div>
      <h2 class="title">Olá {{name}}!</h2>
      <p class="text">
        Este é um lembrete sobre seu exame agendado no <strong>Grupo Biomed</strong>.
      </p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">📅 Data:</span>
          <span class="info-value">{{data}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Horário:</span>
          <span class="info-value">{{hora}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 Local:</span>
          <span class="info-value">{{local}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🏥 Tipo de Exame:</span>
          <span class="info-value">{{tipoExame}}</span>
        </div>
      </div>
      <div class="warning">
        <p class="warning-text">
          <strong>⚠️ Importante:</strong> Chegue com 15 minutos de antecedência. Traga documento de identidade e encaminhamento médico (se houver).
        </p>
      </div>
      <p class="text">
        Caso precise reagendar ou tenha dúvidas, entre em contato conosco:
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <strong>📞 (11) 1234-5678</strong><br>
        <strong>📧 contato@grupobiomed.com</strong>
      </p>
    </div>
    <div class="footer">
      <p><strong>GRUPO BIOMED</strong></p>
      <p>contato@grupobiomed.com | (11) 1234-5678</p>
    </div>
  </div>
</body>
</html>
    `,
    textBody: `Lembrete de Exame\n\nOlá {{name}}!\n\nSeu exame está agendado para:\nData: {{data}}\nHorário: {{hora}}\nLocal: {{local}}\nTipo: {{tipoExame}}\n\nChegue com 15 minutos de antecedência.\n\nGRUPO BIOMED`,
    type: 'email',
    category: 'transactional',
    variables: JSON.stringify(['name', 'data', 'hora', 'local', 'tipoExame']),
    preview: null,
  },
  {
    name: 'Promoção - Pacote Completo',
    subject: '🎁 Pacote Completo de Saúde Ocupacional - Oferta Especial',
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .content { padding: 30px; }
    .banner-image { width: 100%; max-width: 540px; height: 250px; object-fit: cover; border-radius: 8px; margin: 20px 0; }
    .title { font-size: 26px; color: #dc2626; font-weight: bold; margin-bottom: 20px; text-align: center; }
    .discount-badge { background: #dc2626; color: white; padding: 10px 20px; border-radius: 50px; display: inline-block; font-size: 24px; font-weight: bold; margin: 20px 0; }
    .package-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .package-list { list-style: none; padding: 0; margin: 20px 0; }
    .package-list li { padding: 10px 0; border-bottom: 1px solid #fecaca; }
    .package-list li:last-child { border-bottom: none; }
    .package-list li:before { content: "✅ "; color: #dc2626; font-weight: bold; }
    .price-box { background: #dc2626; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
    .price-old { text-decoration: line-through; font-size: 18px; opacity: 0.8; }
    .price-new { font-size: 32px; font-weight: bold; margin: 10px 0; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 Pacote Completo</h1>
      <p style="color: #fee2e2; margin: 10px 0 0 0;">Saúde Ocupacional</p>
    </div>
    <div class="content">
      <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=400&fit=crop" alt="Pacote Completo" class="banner-image">
      <h2 class="title">Olá {{name}}!</h2>
      <div style="text-align: center;">
        <div class="discount-badge">🔥 40% OFF</div>
      </div>
      <p style="color: #333; line-height: 1.6; text-align: center; font-size: 18px;">
        <strong>Pacote Completo de Saúde Ocupacional</strong><br>
        Para empresas que se preocupam com a saúde dos colaboradores
      </p>
      <div class="package-box">
        <h3 style="color: #dc2626; margin-top: 0;">O que está incluído:</h3>
        <ul class="package-list">
          <li>Exames admissionais ilimitados</li>
          <li>Exames periódicos anuais</li>
          <li>Exames demissionais</li>
          <li>Consultas médicas ocupacionais</li>
          <li>Atestados de saúde ocupacional</li>
          <li>PCMSO completo</li>
          <li>Suporte técnico especializado</li>
          <li>Relatórios personalizados</li>
        </ul>
      </div>
      <div class="price-box">
        <div class="price-old">De R$ 10.000,00</div>
        <div class="price-new">Por R$ 6.000,00</div>
        <div style="font-size: 14px; margin-top: 10px;">Economia de R$ 4.000,00</div>
      </div>
      <div style="text-align: center;">
        <a href="https://grupobiomed.com/contato" class="button">Solicitar Proposta</a>
      </div>
      <p style="color: #666; text-align: center; font-size: 14px; margin-top: 20px;">
        ⏰ Oferta válida até {{dataLimite}}
      </p>
    </div>
    <div class="footer">
      <p><strong>GRUPO BIOMED</strong></p>
      <p>contato@grupobiomed.com | (11) 1234-5678</p>
      <p style="margin-top: 10px;">
        <a href="#" style="color: #dc2626;">Descadastrar</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    textBody: `Pacote Completo de Saúde Ocupacional\n\nOlá {{name}}!\n\n🔥 40% OFF - Oferta Especial!\n\nPacote completo incluindo:\n- Exames admissionais, periódicos e demissionais\n- Consultas médicas\n- PCMSO completo\n- Suporte técnico\n\nDe R$ 10.000,00 por R$ 6.000,00\n\nSolicite sua proposta: https://grupobiomed.com/contato\n\nOferta válida até {{dataLimite}}\n\nGRUPO BIOMED`,
    type: 'email',
    category: 'promotional',
    variables: JSON.stringify(['name', 'dataLimite']),
    preview: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=400&fit=crop',
  },
  {
    name: 'WhatsApp - Promoção Rápida',
    subject: null,
    body: `🎉 *PROMOÇÃO ESPECIAL GRUPO BIOMED* 🎉

Olá {{name}}! 👋

Temos uma *oferta imperdível* para você:

🏥 *Pacote Completo de Saúde Ocupacional*
🔥 *40% OFF*

✅ Exames admissionais
✅ Exames periódicos
✅ Consultas médicas
✅ PCMSO completo

💰 *De R$ 10.000,00*
💰 *Por apenas R$ 6.000,00*

⏰ Oferta válida até {{dataLimite}}

📞 *Solicite seu orçamento:*
WhatsApp: (11) 98765-4321
Email: contato@grupobiomed.com

_GRUPO BIOMED - Sua saúde em primeiro lugar_`,
    textBody: `🎉 PROMOÇÃO ESPECIAL GRUPO BIOMED 🎉\n\nOlá {{name}}!\n\nPacote Completo de Saúde Ocupacional - 40% OFF\n\nDe R$ 10.000,00 por R$ 6.000,00\n\nOferta válida até {{dataLimite}}\n\nSolicite: (11) 98765-4321\n\nGRUPO BIOMED`,
    type: 'whatsapp',
    category: 'promotional',
    variables: JSON.stringify(['name', 'dataLimite']),
    preview: null,
  },
  {
    name: 'WhatsApp - Lembrete Exame',
    subject: null,
    body: `📅 *LEMBRETE DE EXAME*

Olá {{name}}! 👋

Este é um lembrete sobre seu exame agendado:

📅 *Data:* {{data}}
🕐 *Horário:* {{hora}}
📍 *Local:* {{local}}
🏥 *Tipo:* {{tipoExame}}

⚠️ *Importante:*
• Chegue com 15 minutos de antecedência
• Traga documento de identidade
• Traga encaminhamento médico (se houver)

📞 *Dúvidas?*
WhatsApp: (11) 98765-4321

_GRUPO BIOMED_`,
    textBody: `LEMBRETE DE EXAME\n\nOlá {{name}}!\n\nData: {{data}}\nHorário: {{hora}}\nLocal: {{local}}\nTipo: {{tipoExame}}\n\nChegue com 15 minutos de antecedência.\n\nGRUPO BIOMED`,
    type: 'whatsapp',
    category: 'transactional',
    variables: JSON.stringify(['name', 'data', 'hora', 'local', 'tipoExame']),
    preview: null,
  },
];

async function popularTemplates() {
  try {
    console.log('🚀 Iniciando popularização de templates com imagens...\n');

    // Verificar se já existem templates
    const existingTemplates = await prisma.emailTemplate.findMany();
    console.log(`📊 Templates existentes: ${existingTemplates.length}`);

    let created = 0;
    let skipped = 0;

    for (const template of templatesComImagens) {
      // Verificar se já existe template com mesmo nome
      const exists = await prisma.emailTemplate.findFirst({
        where: { name: template.name },
      });

      if (exists) {
        console.log(`⏭️  Template "${template.name}" já existe, pulando...`);
        skipped++;
        continue;
      }

      await prisma.emailTemplate.create({
        data: {
          name: template.name,
          subject: template.subject || '',
          body: template.body,
          textBody: template.textBody || null,
          type: template.type,
          category: template.category || null,
          variables: template.variables || null,
          preview: template.preview || null,
        },
      });

      console.log(`✅ Template "${template.name}" criado com sucesso!`);
      created++;
    }

    console.log('\n✨ Processo concluído!');
    console.log(`✅ Criados: ${created}`);
    console.log(`⏭️  Pulados: ${skipped}`);
    console.log(`📊 Total no banco: ${existingTemplates.length + created}`);
  } catch (error) {
    console.error('❌ Erro ao popular templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
popularTemplates()
  .then(() => {
    console.log('\n🎉 Templates populados com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });

