import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { emailRoutes } from './routes/email.routes';
import { whatsappRoutes } from './routes/whatsapp.routes';
import { socialRoutes } from './routes/social.routes';
import { campaignRoutes } from './routes/campaign.routes';
import { contactRoutes } from './routes/contact.routes';
import { templateRoutes } from './routes/template.routes';
import { statsRoutes } from './routes/stats.routes';
import { importRoutes } from './routes/import.routes';
import { trackingRoutes } from './routes/tracking.routes';
import { segmentRoutes } from './routes/segment.routes';
import { exportRoutes } from './routes/export.routes';
import { templateLibraryRoutes } from './routes/templates.routes';
import { configRoutes } from './routes/config.routes';
import { companySearchRoutes } from './routes/company-search.routes';
import { templateGeneratorRoutes } from './routes/template-generator.routes';
import { automationRoutes } from './routes/automation.routes';
import { apiConfigRoutes } from './routes/api-config.routes';
import { schedulerService } from './services/scheduler.service';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/templates-library', templateLibraryRoutes);
app.use('/api/campaigns/stats', statsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/config', configRoutes);
app.use('/api/company-search', companySearchRoutes);
app.use('/api/template-generator', templateGeneratorRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/api-config', apiConfigRoutes);

// Carregar campanhas agendadas na inicialização
schedulerService.loadScheduledCampaigns().catch(console.error);

// Verificar SMTP na inicialização
const checkSMTP = async () => {
  const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!hasSMTP) {
    console.warn('\n⚠️  ATENÇÃO: SMTP não configurado!');
    console.warn('📧 Para enviar emails, configure no arquivo .env:');
    console.warn('   SMTP_HOST=smtp.gmail.com');
    console.warn('   SMTP_PORT=587');
    console.warn('   SMTP_USER=seu-email@gmail.com');
    console.warn('   SMTP_PASS=sua-senha-de-app\n');
  } else {
    console.log('✅ SMTP configurado');
  }
};
checkSMTP();

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Marketing System API rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

