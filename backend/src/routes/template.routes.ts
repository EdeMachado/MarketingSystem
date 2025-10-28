import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Listar templates
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;

    const where: any = {};
    if (type) where.type = type;

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: templates });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter template específico
router.get('/:id', async (req, res, next) => {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: req.params.id },
    });

    if (!template) {
      throw new AppError('Template não encontrado', 404);
    }

    res.json({ success: true, data: template });
  } catch (error: any) {
    next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
});

// Criar template
router.post('/', async (req, res, next) => {
  try {
    const { name, subject, body, textBody, type, variables } = req.body;

    if (!name || !subject || !body) {
      throw new AppError('Nome, assunto e corpo são obrigatórios', 400);
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        textBody,
        type: type || 'email',
        variables: variables ? JSON.stringify(variables) : null,
      },
    });

    res.json({ success: true, data: template });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Atualizar template
router.put('/:id', async (req, res, next) => {
  try {
    const { name, subject, body, textBody, variables } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id: req.params.id },
      data: {
        name,
        subject,
        body,
        textBody,
        variables: variables ? JSON.stringify(variables) : undefined,
      },
    });

    res.json({ success: true, data: template });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Deletar template
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.emailTemplate.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Template deletado com sucesso' });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as templateRoutes };

