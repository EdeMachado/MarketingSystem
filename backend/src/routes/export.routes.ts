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

// Exportar contatos (Excel)
router.get('/contacts/excel', async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
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

export { router as exportRoutes };

