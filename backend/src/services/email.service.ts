import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { generateTrackingToken, processTemplateWithTracking } from './tracking.service';
import { trackEmailSent } from './channel-cost-tracker.service';

const prisma = new PrismaClient();

// Configuração do transporter de email
let transporter: nodemailer.Transporter | null = null;

// Limites por domínio (por minuto)
const domainWindowMs = 60 * 1000
const domainLimitMap: Map<string, { windowStart: number; count: number; limit: number }> = new Map()

function getDomain(email: string): string {
	const parts = email.split('@')
	return parts[1]?.toLowerCase() || 'unknown'
}

function canSendToDomain(domain: string): boolean {
	const now = Date.now()
	const entry = domainLimitMap.get(domain)
	const limit = parseInt(process.env.EMAIL_PER_DOMAIN_PER_MINUTE || '60')
	if (!entry || now - entry.windowStart > domainWindowMs) {
		domainLimitMap.set(domain, { windowStart: now, count: 0, limit })
		return true
	}
	return entry.count < entry.limit
}

function markDomainSend(domain: string) {
	const entry = domainLimitMap.get(domain)
	if (entry) entry.count += 1
}

export const initializeEmailService = () => {
  // Verificar se SMTP está configurado
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP não configurado! Configure as variáveis SMTP_HOST, SMTP_USER e SMTP_PASS no arquivo .env');
    return null;
  }

  const isOffice365 = process.env.SMTP_HOST.includes('office365.com') || process.env.SMTP_HOST.includes('outlook.com');
  const isSendGrid = process.env.SMTP_HOST.includes('sendgrid.net');
  
  // Configuração base do transporter
  const transporterConfig: any = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outras portas
    requireTLS: true, // Força uso de TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Configurações específicas para SendGrid
  if (isSendGrid) {
    // SendGrid usa TLS na porta 587
    transporterConfig.secure = false;
    transporterConfig.requireTLS = true;
    transporterConfig.tls = {
      rejectUnauthorized: true, // SendGrid usa certificados válidos
    };
    transporterConfig.connectionTimeout = 10000; // 10 segundos
    transporterConfig.greetingTimeout = 5000; // 5 segundos
    transporterConfig.socketTimeout = 30000; // 30 segundos
  }

  // Configurações adicionais para Office 365
  if (isOffice365) {
    transporterConfig.tls = {
      ciphers: 'SSLv3',
      rejectUnauthorized: false, // Para ambientes corporativos
    };
    transporterConfig.connectionTimeout = 60000; // 60 segundos
    transporterConfig.greetingTimeout = 30000; // 30 segundos
    transporterConfig.socketTimeout = 60000; // 60 segundos
  }

  transporter = nodemailer.createTransport(transporterConfig);

  return transporter;
};

// Verificar conexão
export const verifyEmailConnection = async () => {
  // Verificar se está configurado
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { 
      success: false, 
      message: 'SMTP não configurado. Configure SMTP_HOST, SMTP_USER e SMTP_PASS no arquivo .env' 
    };
  }

  if (!transporter) {
    transporter = initializeEmailService();
  }

  if (!transporter) {
    return { 
      success: false, 
      message: 'SMTP não configurado. Configure SMTP_HOST, SMTP_USER e SMTP_PASS no arquivo .env' 
    };
  }
  
  try {
    await transporter.verify();
    return { success: true, message: 'Conexão SMTP verificada com sucesso' };
  } catch (error: any) {
    return { success: false, message: `Erro na conexão SMTP: ${error.message}` };
  }
};

// Enviar email único
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  if (!transporter) {
    transporter = initializeEmailService();
  }

  if (!transporter) {
    throw new Error('SMTP não configurado. Configure SMTP_HOST, SMTP_USER e SMTP_PASS no arquivo .env');
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error: any) {
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }
};

// Processar variáveis no template
export const processTemplate = (template: string, variables: Record<string, string>) => {
  let processed = template;
  
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, variables[key] || '');
  });

  return processed;
};

// Enviar email em massa (com rate limiting e controle de quota)
export const sendBulkEmails = async (
  contacts: Array<{ email: string; name: string; variables?: Record<string, string> }>,
  subject: string,
  template: string,
  campaignId?: string
) => {
  // Verificar limite diário ANTES de enviar
  const { trackEmailSent, getUsageStats } = await import('./channel-cost-tracker.service');
  const emailStats = getUsageStats();
  
  // Filtrar apenas contatos válidos primeiro
  const allowedEmails = new Set<string>()
  const dbContacts = await prisma.contact.findMany({
    where: {
      email: { in: contacts.map(c => c.email) },
      status: 'active',
      optOut: false,
    },
    select: { email: true, emailValid: true },
  })
  for (const c of dbContacts) {
    if (c.email && (c.emailValid !== false)) {
      allowedEmails.add(c.email)
    }
  }
  
  const validContacts = contacts.filter(c => allowedEmails.has(c.email));
  const totalToSend = validContacts.length;
  
  // Verificar se ultrapassa o limite
  if (emailStats.email.sent + totalToSend > emailStats.email.limit) {
    const remaining = Math.max(0, emailStats.email.limit - emailStats.email.sent);
    const errorMessage = `⚠️ LIMITE DIÁRIO DO SENDGRID ATINGIDO! 
    
Você já enviou ${emailStats.email.sent} de ${emailStats.email.limit} emails hoje.
Tentando enviar mais ${totalToSend} emails, mas só restam ${remaining} disponíveis.

Limite reseta em: ${new Date(emailStats.email.resetAt).toLocaleString('pt-BR')}

Para aumentar o limite, faça upgrade do plano SendGrid ou aguarde até amanhã.`;

    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  // Alerta se estiver perto do limite
  if (emailStats.email.percentageUsed >= 70) {
    console.warn(`⚠️ ATENÇÃO: ${Math.round(emailStats.email.percentageUsed)}% do limite diário usado (${emailStats.email.sent}/${emailStats.email.limit})`);
  }

  const results = [];
  const rateLimit = parseInt(process.env.EMAIL_RATE_LIMIT || '100');
  const delay = (60 * 1000) / rateLimit; // Delay entre emails em ms

  // Contatos válidos já foram filtrados acima
  for (let i = 0; i < validContacts.length; i++) {
    const contact = validContacts[i];
    
    // Verificar limite durante o envio (caso outro processo tenha usado)
    const currentStats = getUsageStats();
    if (currentStats.email.sent >= currentStats.email.limit) {
      console.error(`⚠️ LIMITE ATINGIDO durante envio. Parando...`);
      results.push({
        email: contact.email,
        success: false,
        error: 'Limite diário do SendGrid atingido',
        quotaExceeded: true,
      });
      // Continuar adicionando os restantes como falha
      for (let j = i + 1; j < validContacts.length; j++) {
        results.push({
          email: validContacts[j].email,
          success: false,
          error: 'Limite diário do SendGrid atingido',
          quotaExceeded: true,
        });
      }
      break;
    }

    // Limite por domínio
    const domain = getDomain(contact.email)
    if (!canSendToDomain(domain)) {
      results.push({ email: contact.email, success: false, throttled: true, domain })
      continue
    }
    markDomainSend(domain)
    
    try {
      // Processar template com variáveis do contato
      const variables = {
        name: contact.name,
        email: contact.email,
        ...contact.variables,
      };
      
      const processedSubject = processTemplate(subject, variables);
      let processedBody = processTemplate(template, variables);

      // Gerar token de tracking e processar template com tracking
      let trackingToken: string | null = null;
      if (campaignId) {
        const dbContact = await prisma.contact.findFirst({
          where: { email: contact.email },
        });

        if (dbContact) {
          trackingToken = generateTrackingToken(campaignId, dbContact.id);
          processedBody = processTemplateWithTracking(processedBody, campaignId, dbContact.id, trackingToken);
        }
      }

      // Enviar email
      const result = await sendEmail(
        contact.email,
        processedSubject,
        processedBody
      );

      // Salvar no banco se houver campaignId
      if (campaignId && trackingToken) {
        const dbContact = await prisma.contact.findFirst({
          where: { email: contact.email },
        });

        if (dbContact) {
          await prisma.campaignContact.upsert({
            where: {
              campaignId_contactId: {
                campaignId,
                contactId: dbContact.id,
              },
            },
            update: {
              status: 'sent',
              sentAt: new Date(),
              trackingToken,
            },
            create: {
              campaignId,
              contactId: dbContact.id,
              status: 'sent',
              sentAt: new Date(),
              trackingToken,
            },
          });
        }
      } else if (campaignId) {
        // Fallback sem tracking
        const dbContact = await prisma.contact.findFirst({
          where: { email: contact.email },
        });

        if (dbContact) {
          await prisma.campaignContact.upsert({
            where: {
              campaignId_contactId: {
                campaignId,
                contactId: dbContact.id,
              },
            },
            update: {
              status: 'sent',
              sentAt: new Date(),
            },
            create: {
              campaignId,
              contactId: dbContact.id,
              status: 'sent',
              sentAt: new Date(),
            },
          });
        }
      }

      results.push({
        email: contact.email,
        success: true,
        messageId: (result as any).messageId,
      });

      // Rate limiting
      if (i < validContacts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error: any) {
      results.push({
        email: contact.email,
        success: false,
        error: error.message,
      });

      // Bounce handling básico
      const dbContact = await prisma.contact.findFirst({ where: { email: contact.email } });
      if (dbContact) {
        const isBounce = /550|user unknown|mailbox unavailable|bounce/i.test(error.message || '');
        await prisma.contact.update({
          where: { id: dbContact.id },
          data: {
            status: isBounce ? 'bounced' : dbContact.status,
            emailValid: isBounce ? false : dbContact.emailValid,
            validationReason: isBounce ? 'bounce' : dbContact.validationReason,
            bounceCount: { increment: 1 } as any,
          },
        });
        if (campaignId) {
          await prisma.campaignContact.upsert({
            where: { campaignId_contactId: { campaignId, contactId: dbContact.id } },
            update: { status: 'failed', error: error.message },
            create: { campaignId, contactId: dbContact.id, status: 'failed', error: error.message },
          });
        }
      }
    }
  }

  // Contar emails enviados com sucesso e registrar no tracker
  const successCount = results.filter((r: any) => r.success).length;
  if (successCount > 0) {
    trackEmailSent(successCount);
  }

  return {
    success: successCount,
    failed: results.length - successCount,
    results,
  };
};

