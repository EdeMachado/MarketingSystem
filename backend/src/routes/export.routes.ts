import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import XLSX from 'exceljs';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Exportar relatório de campanha (Excel)
router.get('/campaign/:id/excel', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: {
          include: { contact: true },
        },
        stats: true,
      },
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const workbook = new XLSX.Workbook();
    
    // Planilha 1: Estatísticas
    const statsSheet = workbook.addWorksheet('Estatísticas');
    statsSheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];

    statsSheet.addRow({ metric: 'Total de Contatos', value: campaign.stats?.total || 0 });
    statsSheet.addRow({ metric: 'Enviados', value: campaign.stats?.sent || 0 });
    statsSheet.addRow({ metric: 'Entregues', value: campaign.stats?.delivered || 0 });
    statsSheet.addRow({ metric: 'Aberturas', value: campaign.stats?.opened || 0 });
    statsSheet.addRow({ metric: 'Cliques', value: campaign.stats?.clicked || 0 });
    statsSheet.addRow({ metric: 'Falhas', value: campaign.stats?.failed || 0 });
    statsSheet.addRow({ metric: 'Taxa de Abertura', value: `${(campaign.stats?.openRate || 0).toFixed(2)}%` });
    statsSheet.addRow({ metric: 'Taxa de Cliques', value: `${(campaign.stats?.clickRate || 0).toFixed(2)}%` });

    // Planilha 2: Detalhes dos Contatos
    const contactsSheet = workbook.addWorksheet('Contatos');
    contactsSheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Enviado em', key: 'sentAt', width: 20 },
      { header: 'Aberto em', key: 'openedAt', width: 20 },
      { header: 'Cliques', key: 'clickCount', width: 10 },
    ];

    campaign.contacts.forEach((cc) => {
      contactsSheet.addRow({
        name: cc.contact.name,
        email: cc.contact.email || '',
        phone: cc.contact.phone || '',
        status: cc.status,
        sentAt: cc.sentAt || '',
        openedAt: cc.openedAt || '',
        clickCount: cc.clickCount || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=relatorio-campanha-${campaign.name}-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Montar filtro comum para contatos
function buildContactWhere(query: any) {
  const where: any = {}
  if (query.status) where.status = query.status
  if (query.source) where.source = query.source
  if (query.hasEmail === 'true') where.email = { not: null }
  if (query.hasPhone === 'true') where.phone = { not: null }
  if (query.optOut === 'true') where.optOut = true
  if (query.optOut === 'false') where.optOut = false
  if (query.emailValid === 'true') where.emailValid = true
  if (query.emailValid === 'false') where.emailValid = false
  if (query.createdAfter || query.createdBefore) {
    where.createdAt = {}
    if (query.createdAfter) where.createdAt.gte = new Date(query.createdAfter)
    if (query.createdBefore) where.createdAt.lte = new Date(query.createdBefore)
  }
  return where
}

// Exportar contatos (Excel) com filtros
router.get('/contacts/excel', async (req, res, next) => {
  try {
    const where = buildContactWhere(req.query)
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet('Contatos');

    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 20 },
      { header: 'Empresa', key: 'company', width: 30 },
      { header: 'Origem', key: 'source', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Opt-out', key: 'optOut', width: 10 },
      { header: 'Validação Email', key: 'emailValid', width: 15 },
      { header: 'Data de Criação', key: 'createdAt', width: 20 },
    ];

    contacts.forEach((contact) => {
      worksheet.addRow({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        source: contact.source,
        status: contact.status,
        optOut: contact.optOut ? 'sim' : 'não',
        emailValid: contact.emailValid === true ? 'válido' : contact.emailValid === false ? 'inválido' : 'desconhecido',
        createdAt: contact.createdAt.toISOString().split('T')[0],
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=contatos-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Exportar empresas (Excel) com filtros
function buildCompanyWhere(query: any) {
  const where: any = {}
  if (query.city) where.city = { contains: String(query.city), mode: 'insensitive' }
  if (query.state) where.state = { equals: String(query.state) }
  if (query.hasEmail === 'true') where.email = { not: null }
  if (query.hasPhone === 'true') where.phone = { not: null }
  if (query.emailValid === 'true') where.emailValid = true
  if (query.emailValid === 'false') where.emailValid = false
  if (query.source) where.source = String(query.source)
  return where
}

router.get('/companies/excel', async (req, res, next) => {
  try {
    const where = buildCompanyWhere(req.query)
    const companies = await prisma.company.findMany({ where, orderBy: { createdAt: 'desc' } })

    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet('Empresas');

    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 20 },
      { header: 'WhatsApp', key: 'whatsapp', width: 20 },
      { header: 'Website', key: 'website', width: 35 },
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'Estado', key: 'state', width: 10 },
      { header: 'Origem', key: 'source', width: 15 },
      { header: 'Validação Email', key: 'emailValid', width: 15 },
      { header: 'Enriquecido em', key: 'enrichedAt', width: 22 },
      { header: 'Criado em', key: 'createdAt', width: 20 },
    ];

    companies.forEach((c) => {
      worksheet.addRow({
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        whatsapp: c.whatsapp || '',
        website: c.website || '',
        city: c.city || '',
        state: c.state || '',
        source: c.source,
        emailValid: c.emailValid === true ? 'válido' : c.emailValid === false ? 'inválido' : 'desconhecido',
        enrichedAt: c.enrichedAt ? new Date(c.enrichedAt as any).toISOString().split('T')[0] : '',
        createdAt: c.createdAt.toISOString().split('T')[0],
      })
    })

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=empresas-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export { router as exportRoutes };

