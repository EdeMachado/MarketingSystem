import { Router } from 'express';
import { verifyWhatsAppConnection } from '../services/whatsapp.service';
import { verifyFacebookConnection } from '../services/social.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Verificar status de todas as APIs
router.get('/status', async (req, res, next) => {
  try {
    const status: Record<string, any> = {};

    // SMTP/Email
    const hasSMTP = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );
    status.email = {
      configured: hasSMTP,
      message: hasSMTP ? 'Configurado' : 'Não configurado',
    };

    // WhatsApp
    try {
      const whatsappStatus = await verifyWhatsAppConnection();
      status.whatsapp = {
        configured: !!process.env.WHATSAPP_API_URL && !!process.env.WHATSAPP_API_KEY,
        connected: whatsappStatus.success && whatsappStatus.connected,
        message: whatsappStatus.message || 'Não configurado',
      };
    } catch {
      status.whatsapp = {
        configured: false,
        connected: false,
        message: 'Não configurado',
      };
    }

    // Facebook
    try {
      const fbStatus = await verifyFacebookConnection();
      status.facebook = {
        configured: !!process.env.FACEBOOK_ACCESS_TOKEN,
        connected: fbStatus.success && fbStatus.connected,
        message: fbStatus.success ? 'Conectado' : 'Não configurado',
      };
    } catch {
      status.facebook = {
        configured: false,
        connected: false,
        message: 'Não configurado',
      };
    }

    // Instagram
    status.instagram = {
      configured: !!(
      process.env.INSTAGRAM_ACCESS_TOKEN &&
      process.env.INSTAGRAM_ACCOUNT_ID &&
      process.env.FACEBOOK_ACCESS_TOKEN
      ),
      connected: false,
      message: process.env.INSTAGRAM_ACCESS_TOKEN ? 'Token configurado' : 'Não configurado',
    };

    // LinkedIn
    status.linkedin = {
      configured: !!(
        process.env.LINKEDIN_CLIENT_ID &&
        process.env.LINKEDIN_CLIENT_SECRET
      ),
      connected: false,
      message: process.env.LINKEDIN_CLIENT_ID ? 'Credenciais configuradas' : 'Não configurado',
    };

    // Google Places
    status.googlePlaces = {
      configured: !!process.env.GOOGLE_PLACES_API_KEY,
      connected: false,
      message: process.env.GOOGLE_PLACES_API_KEY ? 'API Key configurada' : 'Não configurado',
    };

    res.json({ success: true, data: status });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as apiConfigRoutes };

