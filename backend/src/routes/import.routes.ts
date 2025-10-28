import { Router } from 'express';
import multer from 'multer';
import XLSX from 'exceljs';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { PrismaClient } from '@prisma/client';
import validator from 'validator';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB (aumentado para grandes arquivos)
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado. Use CSV ou Excel.'));
    }
  },
});

// Importar contatos via Excel/CSV (otimizado para grandes volumes)
router.post('/contacts', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Arquivo não fornecido', 400);
    }

    const contacts: any[] = [];
    const errors: string[] = [];
    let rowNumber = 0;

    console.log(`📥 Iniciando importação de arquivo: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);

    if (req.file.mimetype === 'text/csv') {
      // Processar CSV
      const buffer = req.file.buffer;
      const stream = Readable.from(buffer.toString());

      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row: any) => {
            rowNumber++;
            const processed = processContactRow(row, rowNumber);
            if (processed.error) {
              errors.push(`Linha ${rowNumber}: ${processed.error}`);
            } else {
              contacts.push(processed.data);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else {
      // Processar Excel
      const workbook = new XLSX.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      const worksheet = workbook.worksheets[0];
      
      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return; // Skip header
        
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = worksheet.getRow(1).getCell(colNumber).value?.toString() || '';
          rowData[header.toLowerCase().trim()] = cell.value?.toString() || '';
        });

        rowNumber++;
        const processed = processContactRow(rowData, rowNumber);
        if (processed.error) {
          errors.push(`Linha ${rowNumber}: ${processed.error}`);
        } else {
          contacts.push(processed.data);
        }
      });
    }

    console.log(`📊 Total de linhas processadas: ${contacts.length}`);

    // Inserir contatos no banco em lotes (otimizado para grandes volumes)
    const inserted: string[] = [];
    const skipped: string[] = [];
    const BATCH_SIZE = 1000; // Processar 1000 por vez

    // Processar em lotes
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      
      try {
        // Para grandes volumes, usar createMany (mais rápido)
        // Primeiro, buscar existentes em lote
        const emails = batch.filter(c => c.email).map(c => c.email);
        const phones = batch.filter(c => c.phone).map(c => c.phone);
        
        const existing = await prisma.contact.findMany({
          where: {
            OR: [
              { email: { in: emails } },
              { phone: { in: phones } },
            ],
          },
          select: { email: true, phone: true },
        });

        const existingEmails = new Set(existing.map(e => e.email).filter(Boolean));
        const existingPhones = new Set(existing.map(e => e.phone).filter(Boolean));

        // Separar novos e duplicados
        const toInsert = batch.filter(contact => {
          const emailExists = contact.email && existingEmails.has(contact.email);
          const phoneExists = contact.phone && existingPhones.has(contact.phone);
          
          if (emailExists || phoneExists) {
            skipped.push(contact.email || contact.phone || contact.name);
            return false;
          }
          return true;
        });

        // Inserir em lote
        if (toInsert.length > 0) {
          await prisma.contact.createMany({
            data: toInsert.map(contact => ({
              name: contact.name,
              email: contact.email || null,
              phone: contact.phone || null,
              company: contact.company || null,
              source: contact.source || 'import',
              tags: contact.tags ? JSON.stringify(contact.tags) : null,
            })),
            skipDuplicates: true, // Ignora duplicados automaticamente
          });

          inserted.push(...toInsert.map(c => c.email || c.phone || c.name));
        }
      } catch (error: any) {
        // Se createMany falhar, tentar um por um para capturar erros específicos
        for (const contact of batch) {
          try {
            const created = await prisma.contact.create({
              data: {
                name: contact.name,
                email: contact.email || null,
                phone: contact.phone || null,
                company: contact.company || null,
                source: contact.source || 'import',
                tags: contact.tags ? JSON.stringify(contact.tags) : null,
              },
            });
            inserted.push(created.email || created.phone || created.name);
          } catch (err: any) {
            if (err.code === 'P2002') {
              skipped.push(contact.email || contact.phone || contact.name);
            } else {
              errors.push(`Linha ${i + batch.indexOf(contact) + 1}: ${err.message}`);
            }
          }
        }
      }

      // Log de progresso (a cada 10k registros)
      if ((i + BATCH_SIZE) % 10000 === 0 || i + BATCH_SIZE >= contacts.length) {
        const processed = Math.min(i + BATCH_SIZE, contacts.length);
        const percentage = ((processed / contacts.length) * 100).toFixed(1);
        console.log(`⏳ Progresso: ${processed}/${contacts.length} (${percentage}%) - Inseridos: ${inserted.length}, Pulados: ${skipped.length}`);
      }
    }

    console.log(`✅ Importação concluída! Total: ${contacts.length}, Inseridos: ${inserted.length}, Pulados: ${skipped.length}, Erros: ${errors.length}`);

    res.json({
      success: true,
      data: {
        total: contacts.length,
        inserted: inserted.length,
        skipped: skipped.length,
        errors: errors.length,
        details: {
          insertedCount: inserted.length,
          skippedCount: skipped.length,
          errorsCount: errors.length,
          inserted: inserted.length > 100 ? inserted.slice(0, 100) : inserted, // Primeiros 100
          skipped: skipped.length > 100 ? skipped.slice(0, 100) : skipped, // Primeiros 100
          errors: errors.slice(0, 50), // Primeiros 50 erros
          message: contacts.length > 10000 
            ? `Importação em massa concluída! Processados ${contacts.length} registros.`
            : 'Importação concluída com sucesso!',
        },
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

function processContactRow(row: any, rowNumber: number): { data?: any; error?: string } {
  // Normalizar nomes de colunas
  const normalized: any = {};
  Object.keys(row).forEach((key) => {
    const normalizedKey = key.toLowerCase().trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    if (['nome', 'name', 'nome_completo'].includes(normalizedKey)) {
      normalized.name = String(row[key] || '').trim();
    } else if (['email', 'e_mail', 'correio'].includes(normalizedKey)) {
      normalized.email = String(row[key] || '').trim();
    } else if (['telefone', 'phone', 'celular', 'whatsapp', 'fone'].includes(normalizedKey)) {
      normalized.phone = String(row[key] || '').trim();
    } else if (['empresa', 'company', 'compania'].includes(normalizedKey)) {
      normalized.company = String(row[key] || '').trim();
    } else if (['origem', 'source', 'fonte'].includes(normalizedKey)) {
      normalized.source = String(row[key] || '').trim();
    } else if (['tags', 'tag'].includes(normalizedKey)) {
      try {
        normalized.tags = JSON.parse(row[key]);
      } catch {
        normalized.tags = String(row[key] || '').split(',').map((t: string) => t.trim());
      }
    }
  });

  // Validações
  if (!normalized.name || normalized.name.length < 2) {
    return { error: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' };
  }

  if (normalized.email && !validator.isEmail(normalized.email)) {
    return { error: `Email inválido: ${normalized.email}` };
  }

  if (normalized.phone) {
    // Limpar formatação do telefone
    normalized.phone = normalized.phone.replace(/\D/g, '');
    if (normalized.phone.length < 10) {
      return { error: `Telefone inválido: ${row.phone}` };
    }
  }

  if (!normalized.email && !normalized.phone) {
    return { error: 'Email ou telefone é obrigatório' };
  }

  return { data: normalized };
}

// Template de importação
router.get('/template', async (req, res) => {
  const workbook = new XLSX.Workbook();
  const worksheet = workbook.addWorksheet('Contatos');

  worksheet.columns = [
    { header: 'Nome', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Telefone', key: 'phone', width: 20 },
    { header: 'Empresa', key: 'company', width: 30 },
    { header: 'Origem', key: 'source', width: 20 },
  ];

  // Adicionar linha de exemplo
  worksheet.addRow({
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999',
    company: 'Empresa Exemplo',
    source: 'manual',
  });

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=template-importacao.xlsx');
  res.send(buffer);
});

export { router as importRoutes };
