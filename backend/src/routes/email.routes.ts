import { Router } from 'express';
import { sendEmail, sendBulkEmails, verifyEmailConnection } from '../services/email.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Verificar conexão
router.get('/verify', async (req, res, next) => {
  try {
    const result = await verifyEmailConnection();
    res.json(result);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Enviar email único
router.post('/send', async (req, res, next) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      throw new AppError('Campos obrigatórios: to, subject, html', 400);
    }

    const result = await sendEmail(to, subject, html, text);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Enviar emails em massa
router.post('/bulk', async (req, res, next) => {
  try {
    const { contacts, subject, template, campaignId } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new AppError('Lista de contatos é obrigatória', 400);
    }

    if (!subject || !template) {
      throw new AppError('Assunto e template são obrigatórios', 400);
    }

    const result = await sendBulkEmails(contacts, subject, template, campaignId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as emailRoutes };

