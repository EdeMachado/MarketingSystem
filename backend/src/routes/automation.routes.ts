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
        status: 'scheduled',
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

    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Cancelar automação
router.post('/:campaignId/cancel', async (req, res, next) => {
  try {
    const result = await schedulerService.cancelSchedule(req.params.campaignId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Executar disparo manual multi-canal
router.post('/dispatch-now', async (req, res, next) => {
  try {
    const { campaignId, channels } = req.body;

    if (!campaignId || !channels || !Array.isArray(channels)) {
      throw new AppError('Campanha e canais são obrigatórios', 400);
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
    next(new AppError(error.message, 500));
  }
});

export { router as automationRoutes };

