import { Router } from 'express';
import { trackOpen, trackClick } from '../services/tracking.service';

const router = Router();

// Pixel de tracking para abertura
router.get('/open/:token', async (req, res) => {
  const { token } = req.params;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  await trackOpen(token, String(ipAddress), userAgent);

  // Retornar pixel transparente 1x1
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length.toString(),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });

  res.send(pixel);
});

// Tracking de cliques
router.get('/click/:token', async (req, res) => {
  const { token } = req.params;
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL não fornecida');
  }

  const result = await trackClick(token, url);

  if (result.success) {
    res.redirect(url);
  } else {
    res.status(404).send('Token não encontrado');
  }
});

export { router as trackingRoutes };

