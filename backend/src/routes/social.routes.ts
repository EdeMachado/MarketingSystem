import { Router } from 'express';
import {
  verifyFacebookConnection,
  createFacebookPost,
  createInstagramPost,
  postToMultiplePlatforms,
} from '../services/social.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Verificar conexão Facebook
router.get('/facebook/verify', async (req, res, next) => {
  try {
    const result = await verifyFacebookConnection();
    res.json(result);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Criar post no Facebook
router.post('/facebook/post', async (req, res, next) => {
  try {
    const { message, mediaUrl } = req.body;

    if (!message) {
      throw new AppError('Mensagem é obrigatória', 400);
    }

    const result = await createFacebookPost(message, mediaUrl);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Criar post no Instagram
router.post('/instagram/post', async (req, res, next) => {
  try {
    const { imageUrl, caption } = req.body;

    if (!imageUrl || !caption) {
      throw new AppError('URL da imagem e legenda são obrigatórios', 400);
    }

    const result = await createInstagramPost(imageUrl, caption);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Postar em múltiplas plataformas
router.post('/post-multiple', async (req, res, next) => {
  try {
    const { platforms, message, mediaUrl } = req.body;

    if (!platforms || !Array.isArray(platforms)) {
      throw new AppError('Lista de plataformas é obrigatória', 400);
    }

    if (!message) {
      throw new AppError('Mensagem é obrigatória', 400);
    }

    const result = await postToMultiplePlatforms(platforms, message, mediaUrl);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as socialRoutes };

