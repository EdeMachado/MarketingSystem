import { Router } from 'express';
import { scheduleDailyMultiChannel, dispatchMultiChannel } from '../services/multi-channel-dispatcher.service';
import { schedulerService } from '../services/scheduler.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Agendar disparo diário multi-canal
router.post('/schedule-daily', async (req, res, next) => {
  try {
    const { campaignId, channels, time, onlyNewContacts } = req.body;

    if (!campaignId || !channels || !Array.isArray(channels) || channels.length === 0) {
      throw new AppError('Campanha, canais e horário são obrigatórios', 400);
    }

    if (!time || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new AppError('Formato de horário inválido. Use HH:MM (ex: 09:00)', 400);
    }

    // Validar campanha existe
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const result = await scheduleDailyMultiChannel(
      campaignId,
      channels,
      time,
      { onlyNewContacts: onlyNewContacts || false }
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Listar automações ativas
router.get('/active', async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: { in: ['scheduled', 'running'] },
        isRecurring: true,
      },
      include: {
        stats: true,
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enriquecer com informações dos canais agendados do metadata
    const enrichedCampaigns = campaigns.map((campaign) => {
      let scheduledChannels: string[] = [];
      if (campaign.metadata) {
        try {
          const metadata = JSON.parse(campaign.metadata);
          scheduledChannels = metadata.scheduledChannels || [];
        } catch {
          // Ignorar erro de parse
        }
      }

      return {
        ...campaign,
        scheduledChannels,
      };
    });

    res.json({ success: true, data: enrichedCampaigns });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Cancelar automação
router.post('/:campaignId/cancel', async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    
    // Verificar se campanha existe
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Cancelar agendamento
    const result = await schedulerService.cancelSchedule(campaignId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
});

// Executar disparo manual multi-canal
router.post('/dispatch-now', async (req, res, next) => {
  try {
    const { campaignId, channels } = req.body;

    if (!campaignId) {
      throw new AppError('Campanha é obrigatória', 400);
    }

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      throw new AppError('Pelo menos um canal deve ser selecionado', 400);
    }

    // Validar canais permitidos
    const allowedChannels = ['email', 'whatsapp', 'instagram', 'facebook', 'linkedin'];
    const invalidChannels = channels.filter((c: string) => !allowedChannels.includes(c));
    if (invalidChannels.length > 0) {
      throw new AppError(`Canais inválidos: ${invalidChannels.join(', ')}`, 400);
    }

    // Verificar se campanha existe
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const result = await dispatchMultiChannel({
      campaignId,
      channels,
      options: {
        staggerDelay: 2000,
        rateLimit: true,
      },
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
});

export { router as automationRoutes };



