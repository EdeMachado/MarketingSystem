import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || '';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || '';
const WHATSAPP_INSTANCE_ID = process.env.WHATSAPP_INSTANCE_ID || '';

// Verificar conexão WhatsApp
export const verifyWhatsAppConnection = async () => {
  try {
    const response = await axios.get(`${WHATSAPP_API_URL}/instance/connectionState/${WHATSAPP_INSTANCE_ID}`, {
      headers: {
        'apikey': WHATSAPP_API_KEY,
      },
    });

    return {
      success: true,
      connected: response.data.state === 'open',
      message: `WhatsApp ${response.data.state === 'open' ? 'conectado' : 'desconectado'}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao verificar WhatsApp: ${error.message}`,
    };
  }
};

// Processar template de mensagem
export const processMessageTemplate = (template: string, variables: Record<string, string>) => {
  let processed = template;
  
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, variables[key] || '');
  });

  return processed;
};

// Enviar mensagem WhatsApp única
export const sendWhatsAppMessage = async (
  phone: string,
  message: string,
  variables?: Record<string, string>
) => {
  try {
    // Formatar número (remover caracteres especiais, adicionar código do país)
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Processar template se houver variáveis
    const processedMessage = variables
      ? processMessageTemplate(message, variables)
      : message;

    const response = await axios.post(
      `${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE_ID}`,
      {
        number: formattedPhone,
        text: processedMessage,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': WHATSAPP_API_KEY,
        },
      }
    );

    return {
      success: true,
      messageId: response.data.key?.id,
      response: response.data,
    };
  } catch (error: any) {
    throw new Error(`Erro ao enviar WhatsApp: ${error.response?.data?.message || error.message}`);
  }
};

// Enviar WhatsApp em massa
export const sendBulkWhatsApp = async (
  contacts: Array<{ phone: string; name: string; variables?: Record<string, string> }>,
  message: string,
  campaignId?: string
) => {
  const results = [];
  const rateLimit = parseInt(process.env.WHATSAPP_RATE_LIMIT || '10');
  const delay = (60 * 1000) / rateLimit; // Delay entre mensagens

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    
    try {
      const variables = {
        name: contact.name,
        ...contact.variables,
      };

      const result = await sendWhatsAppMessage(
        contact.phone,
        message,
        variables
      );

      // Salvar no banco
      if (campaignId) {
        const dbContact = await prisma.contact.findFirst({
          where: { phone: contact.phone },
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
        phone: contact.phone,
        success: true,
        messageId: result.messageId,
      });

      // Rate limiting
      if (i < contacts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error: any) {
      results.push({
        phone: contact.phone,
        success: false,
        error: error.message,
      });

      // Salvar erro
      if (campaignId) {
        const dbContact = await prisma.contact.findFirst({
          where: { phone: contact.phone },
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
              status: 'failed',
              error: error.message,
            },
            create: {
              campaignId,
              contactId: dbContact.id,
              status: 'failed',
              error: error.message,
            },
          });
        }
      }
    }
  }

  return {
    total: contacts.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
};

