// Templates personalizados para Grupo Biomed
export const biomedTemplates = [
  {
    name: 'Medicina do Trabalho - Apresentação',
    subject: 'Grupo Biomed - Sua saúde ocupacional em boas mãos',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1e40af; margin-bottom: 10px;">Grupo Biomed</h1>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">Soluções completas em Saúde Ocupacional</p>
          
          <p>Olá {{name}},</p>
          
          <p>Somos especializados em <strong>Medicina do Trabalho</strong> e oferecemos soluções completas para garantir a saúde e bem-estar dos seus colaboradores.</p>
          
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Nossos Serviços:</h3>
            <ul style="color: #374151; line-height: 1.8;">
              <li>Medicina do Trabalho</li>
              <li>Medicina de Família</li>
              <li>Perícia Judicial</li>
              <li>Higiene Ocupacional</li>
              <li>Treinamentos Personalizados</li>
              <li>Programa de Saúde Mental</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px;">Quer saber como podemos ajudar sua empresa?</p>
          
          <a href="https://grupobiomed.com" style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold;">
            Conheça Nossos Serviços
          </a>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <strong>Grupo Biomed</strong><br>
            Email: contato@grupobiomed.com<br>
            Site: <a href="https://grupobiomed.com" style="color: #3b82f6;">www.grupobiomed.com</a>
          </p>
        </div>
      </div>
    `,
    type: 'email',
    category: 'promotional',
  },
  {
    name: 'Medicina de Família - Oferta',
    subject: 'Medicina de Família: Cuidados Personalizados para sua Empresa',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 30px;">
          <h2 style="color: #059669;">Medicina de Família - Grupo Biomed</h2>
          
          <p>Olá {{name}},</p>
          
          <p>Oferecemos <strong>atendimento médico personalizado</strong> para funcionários e seus familiares, garantindo cuidados de qualidade no ambiente corporativo.</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Benefícios:</h3>
            <ul style="color: #064e3b;">
              <li>Atendimento no local de trabalho</li>
              <li>Suporte para toda a família</li>
              <li>Prevenção e acompanhamento contínuo</li>
              <li>Redução de absenteísmo</li>
            </ul>
          </div>
          
          <a href="https://grupobiomed.com" style="background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Solicite uma Proposta
          </a>
        </div>
      </div>
    `,
    type: 'email',
    category: 'promotional',
  },
  {
    name: 'Perícia Judicial - Especialização',
    subject: 'Perícia Judicial: Expertise em Avaliações Médicas',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Perícia Judicial - Grupo Biomed</h2>
        <p>Olá {{name}},</p>
        <p>Nossa equipe especializada oferece <strong>avaliações médicas periciais</strong> com precisão e credibilidade para processos judiciais.</p>
        <p>Confiança, expertise e qualidade em cada avaliação.</p>
        <a href="https://grupobiomed.com">Saiba Mais</a>
      </div>
    `,
    type: 'email',
    category: 'professional',
  },
  {
    name: 'Newsletter Saúde Ocupacional',
    subject: 'Newsletter Grupo Biomed - Dicas de Saúde Ocupacional',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #1e40af;">Newsletter Grupo Biomed</h1>
          <p style="color: #6b7280;">Sua fonte de informações sobre Saúde Ocupacional</p>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #374151;">📰 Nesta edição:</h3>
            <ul style="line-height: 1.8;">
              <li>Dicas de ergonomia no ambiente de trabalho</li>
              <li>Como prevenir doenças ocupacionais</li>
              <li>Importância da Medicina do Trabalho</li>
              <li>Novidades em treinamentos de segurança</li>
            </ul>
          </div>
          
          <p>Continue cuidando da saúde dos seus colaboradores!</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            Grupo Biomed - Saúde Ocupacional de Excelência<br>
            <a href="https://grupobiomed.com">www.grupobiomed.com</a>
          </p>
        </div>
      </div>
    `,
    type: 'email',
    category: 'newsletter',
  },
  {
    name: 'Treinamentos - Oferta',
    subject: 'Treinamentos Personalizados em Saúde e Segurança',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Treinamentos Grupo Biomed</h2>
        <p>Olá {{name}},</p>
        <p>Oferecemos <strong>capacitações personalizadas</strong> nas áreas de saúde e segurança do trabalho, adaptadas às necessidades da sua empresa.</p>
        <p>Treinamentos que fazem a diferença na sua organização.</p>
        <a href="https://grupobiomed.com">Conheça Nossos Treinamentos</a>
      </div>
    `,
    type: 'email',
    category: 'promotional',
  },
];

