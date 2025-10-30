import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Listar contatos
router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '50', source, status } = req.query;

    const where: any = {};
    if (source) where.source = source;
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter contato específico
router.get('/:id', async (req, res, next) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: {
        campaigns: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!contact) {
      throw new AppError('Contato não encontrado', 404);
    }

    res.json({ success: true, data: contact });
  } catch (error: any) {
    next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
});

// Criar contato
router.post('/', async (req, res, next) => {
  try {
    const { email, phone, name, company, source, tags, metadata } = req.body;

    if (!name) {
      throw new AppError('Nome é obrigatório', 400);
    }

    if (!email && !phone) {
      throw new AppError('Email ou telefone é obrigatório', 400);
    }

    const contact = await prisma.contact.create({
      data: {
        email,
        phone,
        name,
        company,
        source: source || 'manual',
        tags: tags ? JSON.stringify(tags) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    res.json({ success: true, data: contact });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Importar contatos de Excel
router.post('/import', async (req, res, next) => {
  try {
    if (!req.body.file) {
      throw new AppError('Arquivo Excel é obrigatório', 400);
    }

    // Em produção, usar multer para upload de arquivo
    // Por enquanto, assumindo dados JSON do Excel já processado
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
      throw new AppError('Dados inválidos', 400);
    }

    const contacts = [];

    for (const row of rows) {
      try {
        const contact = await prisma.contact.create({
          data: {
            email: row.email || null,
            phone: row.phone || null,
            name: row.name || 'Sem nome',
            company: row.company || null,
            source: row.source || 'import',
          },
        });
        contacts.push(contact);
      } catch (error) {
        // Continuar com próximo contato em caso de erro
        console.error('Erro ao criar contato:', error);
      }
    }

    res.json({
      success: true,
      message: `${contacts.length} contatos importados com sucesso`,
      data: contacts,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Atualizar contato
router.put('/:id', async (req, res, next) => {
  try {
    const { email, phone, name, company, source, status, tags, metadata, optOut } = req.body;

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: {
        email,
        phone,
        name,
        company,
        source,
        status,
        optOut,
        optOutAt: typeof optOut === 'boolean' ? (optOut ? new Date() : null) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    res.json({ success: true, data: contact });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Opt-out em massa por email
router.post('/optout-bulk', async (req, res, next) => {
  try {
    const { emails } = req.body as { emails: string[] };
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new AppError('Forneça uma lista de emails', 400);
    }
    const updated = await prisma.contact.updateMany({
      where: { email: { in: emails } },
      data: { optOut: true, optOutAt: new Date() },
    });
    res.json({ success: true, data: { updated: updated.count } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Remover opt-out em massa por email
router.post('/optin-bulk', async (req, res, next) => {
  try {
    const { emails } = req.body as { emails: string[] };
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new AppError('Forneça uma lista de emails', 400);
    }
    const updated = await prisma.contact.updateMany({
      where: { email: { in: emails } },
      data: { optOut: false, optOutAt: null },
    });
    res.json({ success: true, data: { updated: updated.count } });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Deletar contato
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.contact.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Contato deletado com sucesso' });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as contactRoutes };

