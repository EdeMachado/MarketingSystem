import { Router } from 'express';
import { getUsageStats, getAlerts } from '../services/api-usage-tracker.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Obter estatísticas de uso
router.get('/stats', async (req, res, next) => {
  try {
    const stats = getUsageStats();
    const alerts = getAlerts();
    
    res.json({
      success: true,
      data: {
        ...stats,
        alerts,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter apenas alertas
router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = getAlerts();
    
    res.json({
      success: true,
      data: {
        alerts,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export default router;


