import { PrismaClient } from '@prisma/client';
import { sendBulkEmails } from './email.service';
import { sendBulkWhatsApp } from './whatsapp.service';
import { createFacebookPost, createInstagramPost } from './social.service';
import { generateMultiChannelTemplates } from './template-generator.service';

const prisma = new PrismaClient();

interface DispatcherConfig {
  campaignId: string;
  channels: ('email' | 'whatsapp' | 'instagram' | 'facebook' | 'linkedin')[];
  options?: {
    staggerDelay?: number; // Delay entre canais em ms
    rateLimit?: boolean; // Aplicar rate limiting
  };
}

// Disparar campanha em múltiplos canais simultaneamente
export const dispatchMultiChannel = async (config: DispatcherConfig) => {
  const { campaignId, channels, options = {} } = config;
  
  // Buscar campanha
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      contacts: {
        include: { contact: true },
      },
    },
  });

  if (!campaign) {
    throw new Error('Campanha não encontrada');
  }

  // Preparar contatos
  const contacts = campaign.contacts
    .map((cc) => ({
      email: cc.contact.email || '',
      phone: cc.contact.phone || '',
      name: cc.contact.name,
      variables: cc.metadata ? JSON.parse(cc.metadata) : {},
    }))
    .filter((c) => c.email || c.phone); // Filtrar contatos válidos

  const results: Record<string, any> = {
    campaignId,
    channels: {},
    totalContacts: contacts.length,
    startedAt: new Date(),
  };

  // Processar cada canal
  const dispatchPromises = channels.map(async (channel, index) => {
    // Delay escalonado se configurado
    if (options?.staggerDelay && index > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.staggerDelay! * index));
    }

    try {
      switch (channel) {
        case 'email':
          const emailContacts = contacts.filter((c) => c.email);
          const emailResult = await sendBulkEmails(
            emailContacts,
            campaign.subject || 'Sem assunto',
            campaign.template,
            campaign.id
          );
          results.channels.email = {
            success: true,
            sent: emailResult.success,
            failed: emailResult.failed,
          };
          break;

        case 'whatsapp':
          const whatsappContacts = contacts.filter((c) => c.phone);
          const whatsappResult = await sendBulkWhatsApp(
            whatsappContacts,
            campaign.template,
            campaign.id
          );
          results.channels.whatsapp = {
            success: true,
            sent: whatsappResult.success,
            failed: whatsappResult.failed,
          };
          break;

        case 'facebook':
          // Facebook post único (não por contato)
          const fbMediaUrl = campaign.metadata ? JSON.parse(campaign.metadata).mediaUrl : undefined;
          const fbPost = await createFacebookPost(
            campaign.template,
            fbMediaUrl
          );
          results.channels.facebook = {
            success: fbPost.success,
            postId: fbPost.postId,
          };
          break;

        case 'instagram':
          // Instagram post único (requer imagem)
          const mediaUrl = campaign.metadata ? JSON.parse(campaign.metadata).mediaUrl : undefined;
          if (mediaUrl) {
            const igPost = await createInstagramPost(mediaUrl, campaign.template);
            results.channels.instagram = {
              success: igPost.success,
              mediaId: igPost.mediaId,
            };
          } else {
            results.channels.instagram = {
              success: false,
              message: 'Instagram requer imagem (mediaUrl)',
            };
          }
          break;

        case 'linkedin':
          // LinkedIn (implementar quando tiver API)
          results.channels.linkedin = {
            success: false,
            message: 'LinkedIn ainda não implementado',
          };
          break;
      }
    } catch (error: any) {
      results.channels[channel] = {
        success: false,
        error: error.message,
      };
    }
  });

  // Executar todos os canais
  await Promise.allSettled(dispatchPromises);

  results.completedAt = new Date();
  results.duration = results.completedAt.getTime() - results.startedAt.getTime();

  // Atualizar status da campanha
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  return results;
};

// Agendar disparo diário em múltiplos canais
export const scheduleDailyMultiChannel = async (
  campaignId: string,
  channels: ('email' | 'whatsapp' | 'instagram' | 'facebook' | 'linkedin')[],
  time: string, // Formato "HH:MM" (ex: "09:00")
  options?: {
    onlyNewContacts?: boolean; // Disparar apenas para contatos novos
  }
) => {
  const [hours, minutes] = time.split(':').map(Number);
  const cronExpression = `${minutes} ${hours} * * *`; // Diário no horário especificado

  // Importar cron
  const cron = await import('node-cron');
  
  const task = cron.default.schedule(cronExpression, async () => {
    try {
      // Se configurado, adicionar apenas contatos novos
      if (options?.onlyNewContacts) {
        await addNewContactsToCampaign(campaignId);
      }

      // Disparar em todos os canais
      await dispatchMultiChannel({
        campaignId,
        channels,
        options: {
          staggerDelay: 2000, // 2 segundos entre canais
          rateLimit: true,
        },
      });
    } catch (error: any) {
      console.error(`Erro ao executar disparo diário da campanha ${campaignId}:`, error.message);
    }
  });

  // Atualizar campanha
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'scheduled',
      isRecurring: true,
      recurrenceType: 'daily',
      scheduledAt: new Date(), // Próxima execução
    },
  });

  return {
    success: true,
    cronExpression,
    channels,
    time,
    taskId: campaignId,
  };
};

// Adicionar contatos novos à campanha
const addNewContactsToCampaign = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { contacts: true },
  });

  if (!campaign) return;

  // Buscar contatos que não estão na campanha
  const existingContactIds = campaign.contacts.map((cc) => cc.contactId);

  const newContacts = await prisma.contact.findMany({
    where: {
      id: { notIn: existingContactIds },
      status: 'active',
    },
    take: 100, // Limitar para não sobrecarregar
  });

  // Adicionar à campanha
  if (newContacts.length > 0) {
    await prisma.campaignContact.createMany({
      data: newContacts.map((contact) => ({
        campaignId,
        contactId: contact.id,
        status: 'pending',
      })),
    });

    // Atualizar stats
    await prisma.campaignStats.update({
      where: { campaignId },
      data: {
        total: { increment: newContacts.length },
      },
    });
  }
};

