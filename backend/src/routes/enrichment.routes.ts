import { Router } from 'express';
import { AppError } from '../middlewares/errorHandler';
import {
  enrichContactsBulk,
  getEnrichmentStats,
  enrichContactFromWebsite,
} from '../services/contact-enrichment.service';

const router = Router();

// Estatísticas de enriquecimento
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getEnrichmentStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Enriquecer um contato específico
router.post('/contact/:id', async (req, res, next) => {
  try {
    const result = await enrichContactFromWebsite(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Enriquecer contatos em massa
router.post('/contacts/bulk', async (req, res, next) => {
  try {
    const { missingEmail, missingPhone, hasWebsite, limit } = req.body;

    const filters = {
      missingEmail: missingEmail !== false, // Default true
      missingPhone: missingPhone !== false, // Default true
      hasWebsite: hasWebsite !== false, // Default true
      limit: limit || 100,
    };

    console.log('🚀 Iniciando enriquecimento em massa com filtros:', filters);

    const result = await enrichContactsBulk(filters);

    // Contar quantos emails e telefones foram encontrados
    const emailsFound = result.results.filter(r => r.emailFound).length;
    const phonesFound = result.results.filter(r => r.phoneFound).length;

    console.log(`✅ Enriquecimento concluído: ${emailsFound} emails, ${phonesFound} telefones encontrados`);

    let message = `Processados ${result.processed} contatos`;
    if (result.enriched > 0) {
      message += `, ${result.enriched} enriquecidos (${emailsFound} emails, ${phonesFound} telefones)`;
    } else {
      message += `. Nenhum email/telefone encontrado. Verifique se as empresas têm website e se os sites têm essas informações visíveis.`;
    }

    res.json({
      success: true,
      message,
      data: {
        ...result,
        emailsFound,
        phonesFound,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro no enriquecimento:', error);
    next(new AppError(error.message, 500));
  }
});

export { router as enrichmentRoutes };

