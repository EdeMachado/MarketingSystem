import { Router } from 'express';
import { autoPublish } from '../services/auto-publisher.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Publicação automática completa
router.post('/publish', async (req, res, next) => {
  try {
    const {
      topic,
      keywords,
      contentType,
      channels,
      targetContacts,
      segmentId,
      saveToSite,
    } = req.body;

    // Validações
    if (!topic || typeof topic !== 'string') {
      throw new AppError('Tópico é obrigatório', 400);
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new AppError('Palavras-chave são obrigatórias', 400);
    }

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      throw new AppError('Selecione pelo menos um canal', 400);
    }

    // Validar canais permitidos
    const allowedChannels = ['email', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'telegram', 'site'];
    const invalidChannels = channels.filter((c: string) => !allowedChannels.includes(c));
    if (invalidChannels.length > 0) {
      throw new AppError(`Canais inválidos: ${invalidChannels.join(', ')}`, 400);
    }

    // Executar publicação automática
    const result = await autoPublish({
      topic,
      keywords,
      contentType: contentType || 'article',
      channels,
      targetContacts: targetContacts || 'all',
      segmentId,
      saveToSite: saveToSite !== false, // Default true
    });

    res.json({
      success: true,
      data: result,
      message: `Publicação concluída! ${result.summary.successfulChannels}/${result.summary.totalChannels} canais com sucesso`,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export default router;


