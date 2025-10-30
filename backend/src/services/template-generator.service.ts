interface TemplateOptions {
  title: string;
  content: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonUrl?: string;
  companyName?: string;
  logoUrl?: string;
}

// Gerar template HTML de email com imagem
export const generateEmailTemplate = (options: TemplateOptions): string => {
  const {
    title,
    content,
    imageUrl,
    backgroundColor = '#ffffff',
    textColor = '#333333',
    buttonText = 'Saiba Mais',
    buttonUrl = '#',
    companyName = 'Grupo Biomed',
    logoUrl,
  } = options;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${backgroundColor};
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      max-width: 150px;
      height: auto;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 20px;
      color: ${textColor};
      line-height: 1.6;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
      color: ${textColor};
    }
    .image-container {
      text-align: center;
      margin: 20px 0;
    }
    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .text {
      font-size: 16px;
      margin-bottom: 20px;
      color: ${textColor};
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 15px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      font-size: 16px;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="logo">` : ''}
      <h1 style="color: #ffffff; margin: 0;">${companyName}</h1>
    </div>
    
    <div class="content">
      <h2 class="title">${title}</h2>
      
      ${imageUrl ? `
      <div class="image-container">
        <img src="${imageUrl}" alt="${title}">
      </div>
      ` : ''}
      
      <div class="text">
        ${content.replace(/\n/g, '<br>')}
      </div>
      
      ${buttonUrl && buttonUrl !== '#' ? `
      <div class="button-container">
        <a href="${buttonUrl}" class="button">${buttonText}</a>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>Este email foi enviado por ${companyName}</p>
      <p>Se você não deseja mais receber nossos emails, pode se descadastrar a qualquer momento.</p>
      <div class="social-links">
        <a href="#">Facebook</a>
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
        <a href="#">WhatsApp</a>
      </div>
      <p style="margin-top: 15px; color: #999999;">
        © ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// Gerar template para WhatsApp
export const generateWhatsAppTemplate = (options: TemplateOptions): string => {
  const { title, content, imageUrl, buttonText, buttonUrl } = options;

  let message = `*${title}*\n\n${content}`;

  if (imageUrl) {
    message += `\n\n📸 Imagem: ${imageUrl}`;
  }

  if (buttonUrl && buttonUrl !== '#') {
    message += `\n\n🔗 ${buttonText || 'Saiba mais'}: ${buttonUrl}`;
  }

  return message;
};

// Gerar template para Instagram
export const generateInstagramTemplate = (options: TemplateOptions): string => {
  const { title, content, imageUrl, buttonUrl } = options;

  let caption = `${title}\n\n${content}`;

  if (buttonUrl && buttonUrl !== '#') {
    caption += `\n\nLink na bio 👆`;
  }

  // Hashtags comuns do Grupo Biomed
  caption += `\n\n#SaudeOcupacional #MedicinaDoTrabalho #SegurancaDoTrabalho #GrupoBiomed #PCMSO #ASO`;

  return caption;
};

// Gerar template para Facebook
export const generateFacebookTemplate = (options: TemplateOptions): string => {
  const { title, content, buttonUrl } = options;

  let message = `${title}\n\n${content}`;

  if (buttonUrl && buttonUrl !== '#') {
    message += `\n\nSaiba mais: ${buttonUrl}`;
  }

  return message;
};

// Gerar template para LinkedIn
export const generateLinkedInTemplate = (options: TemplateOptions): string => {
  const { title, content, buttonUrl } = options;

  let post = `${title}\n\n${content}`;

  if (buttonUrl && buttonUrl !== '#') {
    post += `\n\n🔗 Leia mais: ${buttonUrl}`;
  }

  // Hashtags profissionais
  post += `\n\n#SaudeOcupacional #SegurancaDoTrabalho #RH #Empresas #Brasil`;

  return post;
};

// Gerar templates para todos os canais
export const generateMultiChannelTemplates = (options: TemplateOptions) => {
  return {
    email: generateEmailTemplate(options),
    whatsapp: generateWhatsAppTemplate(options),
    instagram: generateInstagramTemplate(options),
    facebook: generateFacebookTemplate(options),
    linkedin: generateLinkedInTemplate(options),
  };
};


