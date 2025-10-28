import { Router } from 'express';
import { sendWhatsAppMessage, sendBulkWhatsApp, verifyWhatsAppConnection } from '../services/whatsapp.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Verificar conexão
router.get('/verify', async (req, res, next) => {
  try {
    const result = await verifyWhatsAppConnection();
    res.json(result);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Enviar mensagem única
router.post('/send', async (req, res, next) => {
  try {
    const { phone, message, variables } = req.body;

    if (!phone || !message) {
      throw new AppError('Telefone e mensagem são obrigatórios', 400);
    }

    const result = await sendWhatsAppMessage(phone, message, variables);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Enviar mensagens em massa
router.post('/bulk', async (req, res, next) => {
  try {
    const { contacts, message, campaignId } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new AppError('Lista de contatos é obrigatória', 400);
    }

    if (!message) {
      throw new AppError('Mensagem é obrigatória', 400);
    }

    const result = await sendBulkWhatsApp(contacts, message, campaignId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as whatsappRoutes };

