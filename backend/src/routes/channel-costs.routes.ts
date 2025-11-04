import { Router } from 'express';
import {
  getUsageStats,
  getChannelAlerts,
  loadCostConfig,
  saveCostConfig,
} from '../services/channel-cost-tracker.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Obter estatísticas de uso de todos os canais
router.get('/stats', async (req, res, next) => {
  try {
    const stats = getUsageStats();
    const alerts = getChannelAlerts();
    res.json({
      success: true,
      data: stats,
      alerts,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter apenas quota do SendGrid (email)
router.get('/email/quota', async (req, res, next) => {
  try {
    const stats = getUsageStats();
    res.json({ 
      success: true, 
      data: {
        sent: stats.email.sent,
        limit: stats.email.limit,
        remaining: stats.email.remaining,
        percentageUsed: Math.round(stats.email.percentageUsed),
        resetAt: stats.email.resetAt,
        status: stats.email.percentageUsed >= 90 ? 'critical' : 
               stats.email.percentageUsed >= 70 ? 'warning' : 'ok',
      }
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter alertas de custos
router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = getChannelAlerts();
    res.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter configuração de custos
router.get('/config', async (req, res, next) => {
  try {
    const config = loadCostConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Atualizar configuração de custos
router.put('/config', async (req, res, next) => {
  try {
    const { whatsapp, email } = req.body;

    const currentConfig = loadCostConfig();

    if (whatsapp) {
      if (whatsapp.costPerMessage !== undefined) {
        currentConfig.whatsapp.costPerMessage = parseFloat(whatsapp.costPerMessage);
      }
      if (whatsapp.monthlyLimit !== undefined) {
        currentConfig.whatsapp.monthlyLimit = parseFloat(whatsapp.monthlyLimit);
      }
    }

    if (email) {
      if (email.limitPerDay !== undefined) {
        currentConfig.email.limitPerDay = parseInt(email.limitPerDay);
      }
    }

    saveCostConfig(currentConfig);

    res.json({
      success: true,
      data: currentConfig,
      message: 'Configuração atualizada com sucesso',
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export default router;


