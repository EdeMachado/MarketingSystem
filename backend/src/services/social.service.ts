import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Facebook/Instagram API
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || '';
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '';
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || '';

// Verificar conexão Facebook
export const verifyFacebookConnection = async () => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/me?access_token=${FACEBOOK_ACCESS_TOKEN}`
    );

    return {
      success: true,
      connected: true,
      pageInfo: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao verificar Facebook: ${error.response?.data?.error?.message || error.message}`,
    };
  }
};

// Criar post no Facebook
export const createFacebookPost = async (message: string, mediaUrl?: string) => {
  try {
    const payload: any = {
      message,
      access_token: FACEBOOK_ACCESS_TOKEN,
    };

    if (mediaUrl) {
      payload.url = mediaUrl;
    }

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`,
      payload
    );

    return {
      success: true,
      postId: response.data.id,
    };
  } catch (error: any) {
    throw new Error(
      `Erro ao criar post no Facebook: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

// Criar post no Instagram
export const createInstagramPost = async (imageUrl: string, caption: string) => {
  try {
    // Primeiro, criar container de mídia
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_ACCOUNT_ID}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: FACEBOOK_ACCESS_TOKEN,
      }
    );

    const containerId = containerResponse.data.id;

    // Depois, publicar o container
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`,
      {
        creation_id: containerId,
        access_token: FACEBOOK_ACCESS_TOKEN,
      }
    );

    return {
      success: true,
      mediaId: publishResponse.data.id,
    };
  } catch (error: any) {
    throw new Error(
      `Erro ao criar post no Instagram: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

// Enviar mensagem direta no Instagram (limitado - precisa de permissões especiais)
export const sendInstagramDM = async (userId: string, message: string) => {
  try {
    // Nota: Envio de DM em massa não é permitido oficialmente pela API do Instagram
    // Esta função só funciona para casos específicos com permissões especiais
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_ACCOUNT_ID}/messages`,
      {
        recipient: { id: userId },
        message: { text: message },
        access_token: FACEBOOK_ACCESS_TOKEN,
      }
    );

    return {
      success: true,
      messageId: response.data.message_id,
    };
  } catch (error: any) {
    throw new Error(
      `Erro ao enviar DM no Instagram: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

// Enviar postagem em múltiplas redes sociais
export const postToMultiplePlatforms = async (
  platforms: string[],
  message: string,
  mediaUrl?: string
) => {
  const results: any[] = [];

  for (const platform of platforms) {
    try {
      if (platform === 'facebook') {
        const result = await createFacebookPost(message, mediaUrl);
        results.push({ platform, success: true, ...result });
      } else if (platform === 'instagram' && mediaUrl) {
        const result = await createInstagramPost(mediaUrl, message);
        results.push({ platform, success: true, ...result });
      }
    } catch (error: any) {
      results.push({
        platform,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

