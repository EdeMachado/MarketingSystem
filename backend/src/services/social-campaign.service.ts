import { PrismaClient } from '@prisma/client';
import { createFacebookPost, createInstagramPost, postToMultiplePlatforms } from './social.service';

const prisma = new PrismaClient();

// Executar campanha em redes sociais
export const executeSocialCampaign = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error('Campanha não encontrada');
  }

  if (campaign.type !== 'instagram' && campaign.type !== 'facebook') {
    throw new Error('Campanha não é para redes sociais');
  }

  // Parse metadata para obter mediaUrl se houver
  let mediaUrl: string | undefined;
  if (campaign.metadata) {
    try {
      const metadata = JSON.parse(campaign.metadata);
      mediaUrl = metadata.mediaUrl;
    } catch {
      // Ignora erro de parse
    }
  }

  try {
    if (campaign.type === 'facebook') {
      // Post no Facebook
      const result = await createFacebookPost(campaign.template, mediaUrl);
      
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      return { success: true, platform: 'facebook', ...result };
    } else if (campaign.type === 'instagram') {
      // Post no Instagram (requer imagem)
      if (!mediaUrl) {
        throw new Error('Instagram requer uma imagem. Forneça mediaUrl.');
      }

      const result = await createInstagramPost(mediaUrl, campaign.template);
      
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      return { success: true, platform: 'instagram', ...result };
    }
  } catch (error: any) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'failed',
      },
    });
    throw error;
  }
};

// Postar em múltiplas redes sociais
export const executeMultiSocialCampaign = async (
  campaignId: string,
  platforms: string[],
  message: string,
  mediaUrl?: string
) => {
  const results = await postToMultiplePlatforms(platforms, message, mediaUrl);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  return results;
};

