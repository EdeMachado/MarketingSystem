import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { biomedTemplates } from '../data/biomed-templates';
import { socialMediaTemplates } from '../data/biomed-social-templates';

const router = Router();
const prisma = new PrismaClient();

// Templates pré-definidos (genéricos + Grupo Biomed + Redes Sociais)
const defaultTemplates = [
  ...biomedTemplates,
  ...socialMediaTemplates,
  {
    name: 'Promoção Especial',
    subject: '🎉 Oferta Especial para Você!',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Olá {{name}}!</h1>
        <p>Temos uma <strong>oferta especial</strong> preparada especialmente para você!</p>
        <p style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong>Desconto de até 50% OFF</strong> em produtos selecionados!
        </p>
        <a href="https://exemplo.com/promocao" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Ver Ofertas
        </a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Esta é uma mensagem promocional enviada pela {{company}}
        </p>
      </div>
    `,
    type: 'email',
    category: 'promotional',
  },
  {
    name: 'Newsletter Semanal',
    subject: '📰 Nossa Newsletter Semanal',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Newsletter Semanal</h1>
        <p>Olá {{name}},</p>
        <p>Confira as principais novidades desta semana:</p>
        <ul>
          <li>Novo produto lançado!</li>
          <li>Dicas e tutoriais exclusivos</li>
          <li>Ofertas especiais para assinantes</li>
        </ul>
        <p style="margin-top: 30px;">
          <a href="https://exemplo.com/newsletter" style="color: #10b981;">Ler mais →</a>
        </p>
      </div>
    `,
    type: 'email',
    category: 'newsletter',
  },
  {
    name: 'Bem-vindo',
    subject: 'Bem-vindo à nossa empresa!',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Bem-vindo, {{name}}!</h1>
        <p>Estamos muito felizes em tê-lo conosco!</p>
        <p>Aqui você encontrará:</p>
        <ul>
          <li>Produtos de alta qualidade</li>
          <li>Atendimento excepcional</li>
          <li>Ofertas exclusivas</li>
        </ul>
        <p>Comece agora mesmo explorando nosso catálogo!</p>
        <a href="https://exemplo.com/catalogo" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Explorar Catálogo
        </a>
      </div>
    `,
    type: 'email',
    category: 'transactional',
  },
];

// Obter templates padrão
router.get('/default', async (req, res) => {
  res.json({ success: true, data: defaultTemplates });
});

// Criar template a partir de um padrão
router.post('/from-default/:index', async (req, res, next) => {
  try {
    const index = parseInt(req.params.index);
    if (index < 0 || index >= defaultTemplates.length) {
      throw new AppError('Índice de template inválido', 400);
    }

    const defaultTemplate = defaultTemplates[index];
    
    // Para templates de redes sociais, usar caption ou message no body
    const body = defaultTemplate.body || defaultTemplate.caption || defaultTemplate.message || '';
    
    const template = await prisma.emailTemplate.create({
      data: {
        name: defaultTemplate.name,
        subject: defaultTemplate.subject || defaultTemplate.name,
        body: body,
        textBody: body,
        type: defaultTemplate.type,
      },
    });

    res.json({ success: true, data: template });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Listar templates
router.get('/', async (req, res, next) => {
  try {
    const { type, category } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: templates });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Resto das rotas existentes (manter código original)
export { router as templateLibraryRoutes };

