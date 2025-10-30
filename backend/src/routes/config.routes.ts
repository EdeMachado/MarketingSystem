import { Router } from 'express';
import { verifyEmailConnection } from '../services/email.service';
import { AppError } from '../middlewares/errorHandler';
import dns from 'dns/promises'

const router = Router();

// Verificar configuração SMTP
router.get('/smtp/check', async (req, res, next) => {
  try {
    const hasConfig = !!(
      process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS
    );

    if (!hasConfig) {
      return res.json({
        success: false,
        configured: false,
        message: 'SMTP não configurado. Configure no arquivo .env',
        instructions: {
          file: 'marketing-system/backend/.env',
          variables: [
            'SMTP_HOST=smtp.gmail.com',
            'SMTP_PORT=587',
            'SMTP_USER=seu-email@gmail.com',
            'SMTP_PASS=sua-senha-de-app',
            'SMTP_FROM="Grupo Biomed <seu-email@gmail.com>"',
          ],
        },
      });
    }

    const testResult = await verifyEmailConnection();
    
    res.json({
      success: testResult.success,
      configured: true,
      message: testResult.message,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Checklist de entregabilidade (SPF/DMARC)
router.get('/deliverability', async (req, res, next) => {
  try {
    const domainParam = (req.query.domain as string) || (process.env.SMTP_USER?.split('@')[1])
    if (!domainParam) return res.json({ success: false, message: 'Informe ?domain=seu-dominio.com' })

    const domain = domainParam.toLowerCase()
    let spf: any = { exists: false }
    let dmarc: any = { exists: false }

    try {
      const txt = await dns.resolveTxt(domain)
      const flattened = txt.map(r => r.join('')).join(' ')
      const spfTxt = flattened.match(/v=spf1[^\"]*/i)
      if (spfTxt) spf = { exists: true, record: spfTxt[0] }
    } catch {}

    try {
      const dmarcDomain = `_dmarc.${domain}`
      const txt = await dns.resolveTxt(dmarcDomain)
      const flattened = txt.map(r => r.join('')).join(' ')
      const tag = /v=DMARC1;[^\"]*/i.exec(flattened)?.[0]
      if (tag) {
        const pMatch = /p=([a-zA-Z]+)/.exec(tag)
        dmarc = { exists: true, policy: pMatch ? pMatch[1] : 'unknown', record: tag }
      }
    } catch {}

    res.json({ success: true, data: { domain, spf, dmarc } })
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
})

// Listar variáveis de ambiente (sem valores sensíveis)
router.get('/env', async (req, res) => {
  res.json({
    success: true,
    data: {
      smtpConfigured: !!(
        process.env.SMTP_HOST && 
        process.env.SMTP_USER && 
        process.env.SMTP_PASS
      ),
      smtpHost: process.env.SMTP_HOST || 'Não configurado',
      smtpPort: process.env.SMTP_PORT || 'Não configurado',
      smtpUser: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'Não configurado',
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '3001',
    },
  });
});

export { router as configRoutes };

