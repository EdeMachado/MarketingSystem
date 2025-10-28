import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Listar segmentos
router.get('/', async (req, res, next) => {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: segments });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Criar segmento
router.post('/', async (req, res, next) => {
  try {
    const { name, description, filters } = req.body;

    if (!name || !filters) {
      throw new AppError('Nome e filtros são obrigatórios', 400);
    }

    // Aplicar filtros para contar contatos
    const contacts = await applyFilters(filters);
    const contactCount = contacts.length;

    const segment = await prisma.segment.create({
      data: {
        name,
        description,
        filters: JSON.stringify(filters),
        contactCount,
      },
    });

    res.json({ success: true, data: segment });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter contatos de um segmento
router.get('/:id/contacts', async (req, res, next) => {
  try {
    const segment = await prisma.segment.findUnique({
      where: { id: req.params.id },
    });

    if (!segment) {
      throw new AppError('Segmento não encontrado', 404);
    }

    const filters = JSON.parse(segment.filters);
    const contacts = await applyFilters(filters);

    res.json({ success: true, data: contacts, count: contacts.length });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Deletar segmento
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.segment.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Segmento deletado' });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Aplicar filtros e retornar contatos
async function applyFilters(filters: any) {
  const where: any = {};

  if (filters.source) {
    where.source = filters.source;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      contains: filters.tags[0],
    };
  }

  if (filters.hasEmail === true) {
    where.email = { not: null };
  }

  if (filters.hasPhone === true) {
    where.phone = { not: null };
  }

  if (filters.createdAfter) {
    where.createdAt = {
      gte: new Date(filters.createdAfter),
    };
  }

  const contacts = await prisma.contact.findMany({ where });
  return contacts;
}

export { router as segmentRoutes };

