import { Router } from 'express';
import { searchAndImportCompanies, searchCompaniesByRegion } from '../services/company-search.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Buscar empresas por região
router.post('/search', async (req, res, next) => {
  try {
    const { query, location, radius, maxResults, niche } = req.body;

    if (!query) {
      throw new AppError('Query de busca é obrigatória', 400);
    }

    const results = await searchCompaniesByRegion({
      query,
      location,
      radius: radius || 5000,
      maxResults: maxResults || 50,
      niche,
    });

    res.json({
      success: true,
      data: {
        companies: results,
        total: results.length,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Buscar e importar empresas automaticamente
router.post('/search-and-import', async (req, res, next) => {
  try {
    const { query, location, radius, maxResults, niche } = req.body;

    if (!query) {
      throw new AppError('Query de busca é obrigatória', 400);
    }

    const result = await searchAndImportCompanies({
      query,
      location,
      radius: radius || 5000,
      maxResults: maxResults || 50,
      niche,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as companySearchRoutes };

