import { PrismaClient } from '@prisma/client';
import { sendBulkEmails } from './email.service';
import { sendBulkWhatsApp } from './whatsapp.service';
import { createFacebookPost, createInstagramPost } from './social.service';
import { generateMultiChannelTemplates } from './template-generator.service';
import { schedulerService } from './scheduler.service';

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
  
  // Buscar campanha (otimizado - apenas campos necessários)
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      contacts: {
        include: {
          contact: {
            select: {
              id: true,
              email: true,
              phone: true,
              name: true,
              status: true,
              optOut: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new Error('Campanha não encontrada');
  }

  // Preparar contatos (suprimir opt-out e inativos)
  const contacts = campaign.contacts
    .filter((cc) => cc.contact.status === 'active' && !cc.contact.optOut)
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
  // Validar horário
  const timeMatch = time.match(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/);
  if (!timeMatch) {
    throw new Error('Formato de horário inválido. Use HH:MM (ex: 09:00)');
  }

  const [, hoursStr, minutesStr] = timeMatch;
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const cronExpression = `${minutes} ${hours} * * *`; // Diário no horário especificado

  // Verificar se campanha existe
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error('Campanha não encontrada');
  }

  // Salvar configuração de canais no metadata da campanha
  const metadata = campaign.metadata ? JSON.parse(campaign.metadata) : {};
  metadata.scheduledChannels = channels;
  metadata.onlyNewContacts = options?.onlyNewContacts || false;

  // Importar cron
  const cron = await import('node-cron');
  
  // Criar função de execução
  const executeTask = async () => {
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
      
      // Atualizar status da campanha em caso de erro
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'failed',
        },
      });
    }
  };

  // Agendar tarefa cron
  const task = cron.default.schedule(cronExpression, executeTask);

  // Registrar tarefa no scheduler service para permitir cancelamento
  schedulerService.registerTask(campaignId, task);

  // Atualizar campanha
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'scheduled',
      isRecurring: true,
      recurrenceType: 'daily',
      recurrenceValue: hours, // Salvar horário
      scheduledAt: new Date(), // Próxima execução
      metadata: JSON.stringify(metadata),
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
    select: {
      id: true,
      contacts: {
        select: {
          contactId: true,
        },
      },
    },
  });

  if (!campaign) return;

  // Buscar contatos que não estão na campanha (otimizado)
  const existingContactIds = campaign.contacts.map((cc) => cc.contactId);

  // Se não há contatos existentes, buscar apenas os mais recentes
  const whereClause: any = {
    status: 'active',
    optOut: false,
  };

  if (existingContactIds.length > 0) {
    whereClause.id = { notIn: existingContactIds };
  }

  const newContacts = await prisma.contact.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    take: 100, // Limitar para não sobrecarregar
    select: {
      id: true,
    },
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

