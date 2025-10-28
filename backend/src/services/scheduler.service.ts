import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendBulkEmails } from './email.service';
import { sendBulkWhatsApp } from './whatsapp.service';

const prisma = new PrismaClient();

// Serviço de agendamento de campanhas
class SchedulerService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  // Agendar campanha única
  async scheduleCampaign(campaignId: string, scheduledAt: Date) {
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

    const now = new Date();
    const scheduleDate = new Date(scheduledAt);

    if (scheduleDate <= now) {
      // Executar imediatamente
      return this.executeCampaign(campaignId);
    }

    // Calcular delay em milissegundos
    const delay = scheduleDate.getTime() - now.getTime();

    // Agendar execução
    const timeout = setTimeout(async () => {
      await this.executeCampaign(campaignId);
      this.tasks.delete(campaignId);
    }, delay);

    // Também criar tarefa cron para backup
    const cronExpression = this.dateToCron(scheduleDate);
    const task = cron.schedule(cronExpression, async () => {
      await this.executeCampaign(campaignId);
      this.tasks.delete(campaignId);
      task.stop();
    });

    this.tasks.set(campaignId, task);

    // Atualizar status da campanha
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'scheduled' },
    });

    return { success: true, scheduledAt: scheduleDate };
  }

  // Agendar campanha recorrente
  async scheduleRecurringCampaign(
    campaignId: string,
    recurrenceType: 'daily' | 'weekly' | 'monthly',
    recurrenceValue?: number
  ) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    let cronExpression: string;

    switch (recurrenceType) {
      case 'daily':
        cronExpression = `0 ${recurrenceValue || 9} * * *`; // Diário às X horas
        break;
      case 'weekly':
        const dayOfWeek = recurrenceValue || 1; // Segunda-feira
        cronExpression = `0 9 * * ${dayOfWeek}`; // Semanal no dia X às 9h
        break;
      case 'monthly':
        const dayOfMonth = recurrenceValue || 1;
        cronExpression = `0 9 ${dayOfMonth} * *`; // Mensal no dia X às 9h
        break;
      default:
        throw new Error('Tipo de recorrência inválido');
    }

    const task = cron.schedule(cronExpression, async () => {
      await this.executeCampaign(campaignId);
      // Atualizar última execução
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { startedAt: new Date() },
      });
    });

    this.tasks.set(campaignId, task);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'scheduled',
        isRecurring: true,
        recurrenceType,
        recurrenceValue,
      },
    });

    return { success: true, cronExpression };
  }

  // Cancelar agendamento
  async cancelSchedule(campaignId: string) {
    const task = this.tasks.get(campaignId);
    if (task) {
      task.stop();
      this.tasks.delete(campaignId);
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'draft' },
    });

    return { success: true };
  }

  // Executar campanha
  private async executeCampaign(campaignId: string) {
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

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });

    try {
      const contacts = campaign.contacts.map((cc) => ({
        email: cc.contact.email || '',
        phone: cc.contact.phone || '',
        name: cc.contact.name,
        variables: cc.metadata ? JSON.parse(cc.metadata) : {},
      }));

      if (campaign.type === 'email') {
        const emailContacts = contacts.filter((c) => c.email);
        await sendBulkEmails(
          emailContacts,
          campaign.subject || 'Sem assunto',
          campaign.template,
          campaign.id
        );
      } else if (campaign.type === 'whatsapp') {
        const phoneContacts = contacts.filter((c) => c.phone);
        await sendBulkWhatsApp(phoneContacts, campaign.template, campaign.id);
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    } catch (error: any) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'failed',
        },
      });
      throw error;
    }
  }

  // Converter data para expressão cron
  private dateToCron(date: Date): string {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return `${minutes} ${hours} ${day} ${month} ${dayOfWeek}`;
  }

  // Processar campanhas agendadas na inicialização
  async loadScheduledCampaigns() {
    const scheduledCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          gte: new Date(),
        },
      },
    });

    for (const campaign of scheduledCampaigns) {
      if (campaign.isRecurring && campaign.recurrenceType) {
        await this.scheduleRecurringCampaign(
          campaign.id,
          campaign.recurrenceType as 'daily' | 'weekly' | 'monthly',
          campaign.recurrenceValue || undefined
        );
      } else if (campaign.scheduledAt) {
        await this.scheduleCampaign(campaign.id, campaign.scheduledAt);
      }
    }
  }
}

export const schedulerService = new SchedulerService();

