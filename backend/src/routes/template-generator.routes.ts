import { Router } from 'express';
import {
  generateEmailTemplate,
  generateWhatsAppTemplate,
  generateInstagramTemplate,
  generateFacebookTemplate,
  generateLinkedInTemplate,
  generateMultiChannelTemplates,
} from '../services/template-generator.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Gerar template de email
router.post('/email', (req, res, next) => {
  try {
    const { title, content, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, companyName, logoUrl } = req.body;

    if (!title || !content) {
      throw new AppError('Título e conteúdo são obrigatórios', 400);
    }

    const template = generateEmailTemplate({
      title,
      content,
      imageUrl,
      backgroundColor,
      textColor,
      buttonText,
      buttonUrl,
      companyName,
      logoUrl,
    });

    res.json({ success: true, data: { template } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Gerar template para todos os canais
router.post('/multi-channel', (req, res, next) => {
  try {
    const { title, content, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, companyName, logoUrl } = req.body;

    if (!title || !content) {
      throw new AppError('Título e conteúdo são obrigatórios', 400);
    }

    const templates = generateMultiChannelTemplates({
      title,
      content,
      imageUrl,
      backgroundColor,
      textColor,
      buttonText,
      buttonUrl,
      companyName,
      logoUrl,
    });

    res.json({ success: true, data: templates });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Gerar templates individuais por canal
router.post('/whatsapp', (req, res, next) => {
  try {
    const { title, content, imageUrl, buttonText, buttonUrl } = req.body;
    if (!title || !content) throw new AppError('Título e conteúdo são obrigatórios', 400);
    const template = generateWhatsAppTemplate({ title, content, imageUrl, buttonText, buttonUrl });
    res.json({ success: true, data: { template } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

router.post('/instagram', (req, res, next) => {
  try {
    const { title, content, imageUrl, buttonUrl } = req.body;
    if (!title || !content) throw new AppError('Título e conteúdo são obrigatórios', 400);
    const template = generateInstagramTemplate({ title, content, imageUrl, buttonUrl });
    res.json({ success: true, data: { template } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

router.post('/facebook', (req, res, next) => {
  try {
    const { title, content, buttonUrl } = req.body;
    if (!title || !content) throw new AppError('Título e conteúdo são obrigatórios', 400);
    const template = generateFacebookTemplate({ title, content, buttonUrl });
    res.json({ success: true, data: { template } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

router.post('/linkedin', (req, res, next) => {
  try {
    const { title, content, buttonUrl } = req.body;
    if (!title || !content) throw new AppError('Título e conteúdo são obrigatórios', 400);
    const template = generateLinkedInTemplate({ title, content, buttonUrl });
    res.json({ success: true, data: { template } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as templateGeneratorRoutes };

