import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendBulkEmails } from '../services/email.service';
import { sendBulkWhatsApp } from '../services/whatsapp.service';
import { schedulerService } from '../services/scheduler.service';
import { executeSocialCampaign } from '../services/social-campaign.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Listar campanhas
router.get('/', async (req, res, next) => {
  try {
    const { company, type, status } = req.query;
    const where: any = {};
    if (company) where.company = company;
    if (type) where.type = type;
    if (status) where.status = status;
    
    const campaigns = await prisma.campaign.findMany({
      where,
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

// Obter campanha específica
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        stats: true,
        contacts: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    res.json({ success: true, data: campaign });
  } catch (error: any) {
    next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
});

// Criar campanha
router.post('/', async (req, res, next) => {
  try {
    const { name, description, type, template, scheduledAt, contactIds } = req.body;

    if (!name || !type || !template) {
      throw new AppError('Nome, tipo e template são obrigatórios', 400);
    }

    const { subject, isRecurring, recurrenceType, recurrenceValue, segmentFilters, mediaUrl, company } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description: description || null,
        company: company || 'biomed',
        type,
        template,
        subject: subject || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'scheduled' : 'draft',
        isRecurring: isRecurring || false,
        recurrenceType: recurrenceType || null,
        recurrenceValue: recurrenceValue || null,
        segmentFilters: segmentFilters ? JSON.stringify(segmentFilters) : null,
        metadata: mediaUrl ? JSON.stringify({ mediaUrl }) : null,
      },
    });

    // Agendar se necessário
    if (scheduledAt) {
      if (isRecurring && recurrenceType) {
        await schedulerService.scheduleRecurringCampaign(
          campaign.id,
          recurrenceType,
          recurrenceValue
        );
      } else {
        await schedulerService.scheduleCampaign(campaign.id, new Date(scheduledAt));
      }
    }

    // Adicionar contatos se fornecidos
    if (contactIds && Array.isArray(contactIds)) {
      await prisma.campaignContact.createMany({
        data: contactIds.map((contactId: string) => ({
          campaignId: campaign.id,
          contactId,
          status: 'pending',
        })),
      });

      // Criar stats iniciais
      await prisma.campaignStats.create({
        data: {
          campaignId: campaign.id,
          total: contactIds.length,
        },
      });
    }

    const createdCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: { stats: true },
    });

    res.json({ success: true, data: createdCampaign });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Executar campanha
router.post('/:id/execute', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Atualizar status
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });

    // Preparar contatos
    const contacts = campaign.contacts.map((cc) => ({
      email: cc.contact.email || '',
      phone: cc.contact.phone || '',
      name: cc.contact.name,
      variables: cc.metadata ? JSON.parse(cc.metadata) : {},
    }));

    let result;

    // Executar baseado no tipo
    if (campaign.type === 'email') {
      const emailContacts = contacts.filter((c) => c.email);
      result = await sendBulkEmails(
        emailContacts,
        campaign.subject || 'Oferta Especial',
        campaign.template,
        campaign.id
      );
    } else if (campaign.type === 'whatsapp') {
      const phoneContacts = contacts.filter((c) => c.phone);
      result = await sendBulkWhatsApp(phoneContacts, campaign.template, campaign.id);
    } else if (campaign.type === 'instagram' || campaign.type === 'facebook') {
      // Campanhas de redes sociais
      result = await executeSocialCampaign(campaign.id);
    } else {
      throw new AppError('Tipo de campanha não suportado para execução automática', 400);
    }

    // Atualizar stats (apenas para campanhas de email/whatsapp que retornam stats)
    if (campaign.type === 'email' || campaign.type === 'whatsapp') {
      const emailResult = result as { success: number; failed: number; results?: any[] };
      await prisma.campaignStats.update({
        where: { campaignId: campaign.id },
        data: {
          sent: emailResult.success || 0,
          failed: emailResult.failed || 0,
        },
      });
    }

    // Atualizar status para completada
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Incluir informações sobre falhas no retorno (apenas para email/whatsapp)
    let message = 'Campanha executada com sucesso!';
    let failedDetails: any[] = [];
    let quotaInfo: any = null;
    
    if ((campaign.type === 'email' || campaign.type === 'whatsapp') && result) {
      const emailResult = result as { success: number; failed: number; results?: any[]; quota?: any };
      failedDetails = emailResult.results?.filter((r: any) => !r.success && (r.email || r.phone)) || [];
      
      // Incluir info de quota se disponível
      if (emailResult.quota) {
        quotaInfo = emailResult.quota;
      }
      
      if (emailResult.failed > 0) {
        const failedItems = failedDetails.slice(0, 3).map((r: any) => r.email || r.phone).filter(Boolean);
        message = `${emailResult.success} enviados, ${emailResult.failed} falha(s)${failedItems.length > 0 ? `. Item(s) com falha: ${failedItems.join(', ')}${failedDetails.length > 3 ? '...' : ''}` : ''}`;
        
        // Adicionar alerta de quota se estiver baixa
        if (quotaInfo && quotaInfo.percentageUsed >= 70) {
          message += `\n⚠️ ATENÇÃO: ${Math.round(quotaInfo.percentageUsed)}% do limite diário usado (${quotaInfo.sent}/${quotaInfo.limit} emails restantes)`;
        }
      } else {
        message = `${emailResult.success} enviados com sucesso!`;
        if (quotaInfo) {
          message += ` (${quotaInfo.remaining} emails restantes hoje)`;
        }
      }
    }

    res.json({ 
      success: true, 
      data: result,
      message,
      failedDetails: failedDetails.slice(0, 5), // Primeiros 5 para não sobrecarregar
      quota: quotaInfo,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Atualizar campanha
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, template, scheduledAt, status } = req.body;

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        template,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status,
      },
    });

    res.json({ success: true, data: campaign });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Agendar campanha
router.post('/:id/schedule', async (req, res, next) => {
  try {
    const { scheduledAt, isRecurring, recurrenceType, recurrenceValue } = req.body;

    if (!scheduledAt && !isRecurring) {
      throw new AppError('Data de agendamento ou recorrência é obrigatória', 400);
    }

    if (isRecurring && recurrenceType) {
      const result = await schedulerService.scheduleRecurringCampaign(
        req.params.id,
        recurrenceType,
        recurrenceValue
      );
      res.json({ success: true, data: result });
    } else if (scheduledAt) {
      const result = await schedulerService.scheduleCampaign(req.params.id, new Date(scheduledAt));
      res.json({ success: true, data: result });
    }
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Cancelar agendamento
router.post('/:id/cancel-schedule', async (req, res, next) => {
  try {
    const result = await schedulerService.cancelSchedule(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Deletar campanha
router.delete('/:id', async (req, res, next) => {
  try {
    // Cancelar agendamento se houver
    try {
      await schedulerService.cancelSchedule(req.params.id);
    } catch {
      // Ignora se não houver agendamento
    }

    await prisma.campaign.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Campanha deletada com sucesso' });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Get campaign budget/roi
router.get('/:id/budget', async (req, res, next) => {
  try {
    const c = await prisma.campaign.findUnique({ where: { id: req.params.id }, select: { budgetPlanned: true, budgetSpent: true, revenue: true, roi: true } })
    if (!c) throw new AppError('Campanha não encontrada', 404)
    res.json({ success: true, data: c })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

// Update campaign budget/roi
router.put('/:id/budget', async (req, res, next) => {
  try {
    const { budgetPlanned, budgetSpent, revenue } = req.body
    const roi = (typeof budgetSpent === 'number' && typeof revenue === 'number' && budgetSpent > 0) ? (revenue - budgetSpent) / budgetSpent : undefined
    const c = await prisma.campaign.update({ where: { id: req.params.id }, data: { budgetPlanned, budgetSpent, revenue, roi } })
    res.json({ success: true, data: { budgetPlanned: c.budgetPlanned, budgetSpent: c.budgetSpent, revenue: c.revenue, roi: c.roi } })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

export { router as campaignRoutes };

