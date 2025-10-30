import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { searchCompaniesByRegion, searchAndImportCompanies, importCompaniesAsContacts } from '../services/company-search.service';

const router = Router();
const prisma = new PrismaClient();

// Similaridade simples (Jaro-Winkler aproximado leve)
function stringSimilarity(a: string, b: string): number {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (a === b) return 1;
  const al = a.length;
  const bl = b.length;
  const maxDist = Math.floor(Math.max(al, bl) / 2) - 1;
  const aMatches = Array(al).fill(false);
  const bMatches = Array(bl).fill(false);
  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < al; i++) {
    const start = Math.max(0, i - maxDist);
    const end = Math.min(i + maxDist + 1, bl);
    for (let j = start; j < end; j++) {
      if (bMatches[j]) continue;
      if (a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let k = 0;
  for (let i = 0; i < al; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  const m = matches;
  let jaro = (m / al + m / bl + (m - transpositions / 2) / m) / 3;
  // Winkler adjustment for common prefix up to 4 chars
  let prefix = 0;
  for (let i = 0; i < Math.min(4, al, bl); i++) {
    if (a[i] === b[i]) prefix++; else break;
  }
  jaro += prefix * 0.1 * (1 - jaro);
  return jaro;
}

// Listar empresas
router.get('/', async (req, res, next) => {
  try {
    const { q, city, state, take, skip } = req.query as any;

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { website: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };

    const data = await prisma.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take ? Number(take) : 50,
      skip: skip ? Number(skip) : 0,
    });

    const total = await prisma.company.count({ where });

    res.json({ success: true, data: { items: data, total } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Duplicados (fuzzy)
router.get('/duplicates', async (req, res, next) => {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 0.88
    const take = req.query.take ? Number(req.query.take) : 2000
    // Carregar últimas N empresas para comparação
    const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' }, take })
    const pairs: Array<{ a: any; b: any; score: number } > = []
    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        const a = companies[i]
        const b = companies[j]
        const nameScore = stringSimilarity(a.name, b.name)
        const addrScore = a.address && b.address ? stringSimilarity(a.address, b.address) : 0
        const websiteExact = a.website && b.website && a.website === b.website ? 1 : 0
        const score = Math.max(nameScore * 0.7 + addrScore * 0.3, websiteExact)
        if (score >= threshold) {
          pairs.push({ a, b, score: Number(score.toFixed(3)) })
        }
      }
    }
    // Ordenar por score desc
    pairs.sort((x, y) => y.score - x.score)
    res.json({ success: true, data: pairs.slice(0, 200) })
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter empresa
router.get('/:id', async (req, res, next) => {
  try {
    const item = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!item) throw new AppError('Empresa não encontrada', 404);
    res.json({ success: true, data: item });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Criar empresa manualmente
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.name) throw new AppError('Nome é obrigatório', 400);

    const created = await prisma.company.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        source: data.source || 'manual',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    res.json({ success: true, data: created });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Atualizar empresa
router.put('/:id', async (req, res, next) => {
  try {
    const data = req.body;
    const updated = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        source: data.source || 'manual',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Deletar empresa
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Empresa deletada com sucesso' });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Importar automaticamente a partir da busca (Google Places)
router.post('/import-from-search', async (req, res, next) => {
  try {
    const { query, location, radius, maxResults } = req.body || {};
    if (!query) throw new AppError('Query de busca é obrigatória', 400);

    const result = await searchAndImportCompanies({
      query,
      location,
      radius: radius || 5000,
      maxResults: maxResults || 50,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as companyRoutes };

// Importar empresas selecionadas (payload direto)
router.post('/bulk-import', async (req, res, next) => {
  try {
    const { companies } = req.body || {};
    if (!Array.isArray(companies) || companies.length === 0) {
      throw new AppError('Lista de empresas é obrigatória', 400);
    }

    // Importa para Contacts e Companies com deduplicação
    const result = await importCompaniesAsContacts(
      companies.map((c: any) => ({
        name: c.name,
        email: c.email,
        phone: c.phone,
        whatsapp: c.whatsapp,
        website: c.website,
        address: c.address,
        city: c.city,
        state: c.state,
        zipCode: c.zipCode,
        source: c.source || 'google',
        metadata: c.metadata,
      })),
      'email'
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Exclusão em massa
router.post('/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Lista de ids é obrigatória', 400);
    }

    const deleted = await prisma.company.deleteMany({ where: { id: { in: ids } } });
    res.json({ success: true, data: { deleted: deleted.count } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});
