import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Gerar token de tracking
export const generateTrackingToken = (campaignId: string, contactId: string): string => {
  return uuidv4();
};

// Processar template com tracking
export const processTemplateWithTracking = (
  template: string,
  campaignId: string,
  contactId: string,
  trackingToken: string
): string => {
  // Adicionar pixel de tracking
  const trackingPixel = `<img src="${process.env.API_URL || 'http://localhost:3001'}/api/tracking/open/${trackingToken}" width="1" height="1" style="display:none;" />`;
  
  // Processar links com tracking
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;
  let processed = template.replace(linkRegex, (match, url) => {
    if (url.startsWith('mailto:') || url.startsWith('#')) {
      return match;
    }
    const trackedUrl = `${process.env.API_URL || 'http://localhost:3001'}/api/tracking/click/${trackingToken}?url=${encodeURIComponent(url)}`;
    return match.replace(url, trackedUrl);
  });

  // Adicionar pixel no final do body
  processed = processed.replace('</body>', `${trackingPixel}</body>`);
  if (!processed.includes('</body>')) {
    processed += trackingPixel;
  }

  return processed;
};

// Registrar abertura
export const trackOpen = async (trackingToken: string, ipAddress?: string, userAgent?: string) => {
  try {
    const campaignContact = await prisma.campaignContact.findFirst({
      where: { trackingToken },
    });

    if (!campaignContact) {
      return { success: false, message: 'Token não encontrado' };
    }

    // Verificar se já foi aberto
    if (!campaignContact.openedAt) {
      await prisma.campaignContact.update({
        where: { id: campaignContact.id },
        data: {
          openedAt: new Date(),
          openCount: { increment: 1 },
          status: campaignContact.status === 'sent' ? 'opened' : campaignContact.status,
        },
      });

      // Registrar evento
      await prisma.openEvent.create({
        data: {
          campaignId: campaignContact.campaignId,
          contactId: campaignContact.contactId,
          trackingToken,
          ipAddress,
          userAgent,
        },
      });

      // Atualizar stats da campanha
      await updateCampaignStats(campaignContact.campaignId);
    } else {
      // Incrementar contador mesmo se já foi aberto
      await prisma.campaignContact.update({
        where: { id: campaignContact.id },
        data: {
          openCount: { increment: 1 },
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao rastrear abertura:', error);
    return { success: false, message: error.message };
  }
};

// Registrar clique
export const trackClick = async (trackingToken: string, url: string) => {
  try {
    const campaignContact = await prisma.campaignContact.findFirst({
      where: { trackingToken },
    });

    if (!campaignContact) {
      return { success: false, message: 'Token não encontrado' };
    }

    // Atualizar status e contador
    const wasFirstClick = !campaignContact.clickedAt;
    
    await prisma.campaignContact.update({
      where: { id: campaignContact.id },
      data: {
        clickedAt: wasFirstClick ? new Date() : campaignContact.clickedAt,
        clickCount: { increment: 1 },
        status: campaignContact.status === 'opened' || campaignContact.status === 'sent' ? 'clicked' : campaignContact.status,
      },
    });

    // Registrar evento
    await prisma.clickEvent.create({
      data: {
        campaignId: campaignContact.campaignId,
        contactId: campaignContact.contactId,
        trackingToken,
        url,
      },
    });

    // Atualizar stats
    if (wasFirstClick) {
      await updateCampaignStats(campaignContact.campaignId);
    }

    return { success: true, redirectUrl: url };
  } catch (error: any) {
    console.error('Erro ao rastrear clique:', error);
    return { success: false, message: error.message };
  }
};

// Atualizar estatísticas da campanha
async function updateCampaignStats(campaignId: string) {
  const [total, sent, delivered, opened, clicked, failed] = await Promise.all([
    prisma.campaignContact.count({ where: { campaignId } }),
    prisma.campaignContact.count({ where: { campaignId, status: { in: ['sent', 'delivered', 'opened', 'clicked'] } } }),
    prisma.campaignContact.count({ where: { campaignId, status: { in: ['delivered', 'opened', 'clicked'] } } }),
    prisma.campaignContact.count({ where: { campaignId, openedAt: { not: null } } }),
    prisma.campaignContact.count({ where: { campaignId, clickedAt: { not: null } } }),
    prisma.campaignContact.count({ where: { campaignId, status: 'failed' } }),
  ]);

  const openRate = sent > 0 ? (opened / sent) * 100 : 0;
  const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
  const bounceRate = sent > 0 ? (failed / sent) * 100 : 0;

  await prisma.campaignStats.upsert({
    where: { campaignId },
    update: {
      total,
      sent,
      delivered,
      opened,
      clicked,
      failed,
      openRate,
      clickRate,
      bounceRate,
    },
    create: {
      campaignId,
      total,
      sent,
      delivered,
      opened,
      clicked,
      failed,
      openRate,
      clickRate,
      bounceRate,
    },
  });
}

