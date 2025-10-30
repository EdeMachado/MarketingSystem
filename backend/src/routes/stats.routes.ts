import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Estatísticas gerais do dashboard
router.get('/overview', async (req, res, next) => {
  try {
    const [
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      campaigns,
      totalSent,
      totalOpened,
      totalClicked,
    ] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'running' } }),
      prisma.contact.count(),
      prisma.campaign.findMany({
        include: { stats: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.campaignContact.count({ where: { status: 'sent' } }),
      prisma.campaignContact.count({ where: { status: { in: ['opened', 'clicked'] } } }),
      prisma.campaignContact.count({ where: { status: 'clicked' } }),
    ]);

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalCampaigns,
        activeCampaigns,
        totalContacts,
        totalSent,
        totalOpened,
        totalClicked,
        openRate: Number(openRate.toFixed(2)),
        clickRate: Number(clickRate.toFixed(2)),
        recentCampaigns: campaigns,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Estatísticas por período
router.get('/period', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: { stats: true },
    });

    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Top links clicados (últimos 7 dias)
router.get('/top-links', async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const clicks = await prisma.clickEvent.groupBy({
      by: ['url'],
      where: { clickedAt: { gte: since } },
      _count: { url: true },
      orderBy: { _count: { url: 'desc' } },
      take: 10,
    });

    res.json({ success: true, data: clicks.map((c) => ({ url: c.url, count: (c as any)._count.url })) });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as statsRoutes };

