import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateSeoPageData {
  title: string;
  metaDescription?: string;
  slug: string;
  h1: string;
  h2s?: string[];
  content: string;
  keywords?: string[];
  contentType?: 'article' | 'landing' | 'blog';
  wordCount?: number;
  readabilityScore?: number;
}

interface UpdateSeoPageData {
  title?: string;
  metaDescription?: string;
  slug?: string;
  h1?: string;
  h2s?: string[];
  content?: string;
  keywords?: string[];
  contentType?: 'article' | 'landing' | 'blog';
  status?: 'draft' | 'ready' | 'published';
  wordCount?: number;
  readabilityScore?: number;
}

// Gerar slug a partir de uma string
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui espaços e caracteres especiais por hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
};

// Criar página SEO
export const createSeoPage = async (data: CreateSeoPageData) => {
  // Garantir que o slug seja único
  let slug = data.slug || generateSlug(data.title);
  let slugCounter = 1;
  
  // @ts-ignore - Prisma Client será gerado após restart
  while (await prisma.seoPage.findUnique({ where: { slug } })) {
    slug = `${data.slug || generateSlug(data.title)}-${slugCounter}`;
    slugCounter++;
  }

  // @ts-ignore - Prisma Client será gerado após restart
  return prisma.seoPage.create({
    data: {
      title: data.title,
      metaDescription: data.metaDescription,
      slug,
      h1: data.h1,
      h2s: data.h2s ? JSON.stringify(data.h2s) : null,
      content: data.content,
      keywords: data.keywords ? JSON.stringify(data.keywords) : null,
      contentType: data.contentType || 'article',
      wordCount: data.wordCount,
      readabilityScore: data.readabilityScore,
    },
  });
};

// Listar todas as páginas
export const listSeoPages = async (filters?: {
  status?: string;
  contentType?: string;
  search?: string;
}) => {
  const where: any = {};
  
  if (filters?.status) {
    where.status = filters.status;
  }
  
  if (filters?.contentType) {
    where.contentType = filters.contentType;
  }
  
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
      { h1: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // @ts-ignore - Prisma Client será gerado após restart
  const pages = await prisma.seoPage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Parse JSON fields
  return pages.map(page => ({
    ...page,
    h2s: page.h2s ? JSON.parse(page.h2s) : [],
    keywords: page.keywords ? JSON.parse(page.keywords) : [],
  }));
};

// Buscar página por ID
export const getSeoPageById = async (id: string) => {
  // @ts-ignore - Prisma Client será gerado após restart
  const page = await prisma.seoPage.findUnique({
    where: { id },
  });

  if (!page) return null;

  return {
    ...page,
    h2s: page.h2s ? JSON.parse(page.h2s) : [],
    keywords: page.keywords ? JSON.parse(page.keywords) : [],
  };
};

// Buscar página por slug
export const getSeoPageBySlug = async (slug: string) => {
  // @ts-ignore - Prisma Client será gerado após restart
  const page = await prisma.seoPage.findUnique({
    where: { slug },
  });

  if (!page) return null;

  return {
    ...page,
    h2s: page.h2s ? JSON.parse(page.h2s) : [],
    keywords: page.keywords ? JSON.parse(page.keywords) : [],
  };
};

// Atualizar página
export const updateSeoPage = async (id: string, data: UpdateSeoPageData) => {
  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.h1 !== undefined) updateData.h1 = data.h1;
  if (data.h2s !== undefined) updateData.h2s = JSON.stringify(data.h2s);
  if (data.content !== undefined) updateData.content = data.content;
  if (data.keywords !== undefined) updateData.keywords = JSON.stringify(data.keywords);
  if (data.contentType !== undefined) updateData.contentType = data.contentType;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.wordCount !== undefined) updateData.wordCount = data.wordCount;
  if (data.readabilityScore !== undefined) updateData.readabilityScore = data.readabilityScore;

  // @ts-ignore - Prisma Client será gerado após restart
  return prisma.seoPage.update({
    where: { id },
    data: updateData,
  });
};

// Deletar página
export const deleteSeoPage = async (id: string) => {
  // @ts-ignore - Prisma Client será gerado após restart
  return prisma.seoPage.delete({
    where: { id },
  });
};

// Gerar HTML completo exportável
export const generateExportableHTML = (page: {
  title: string;
  metaDescription?: string | null;
  h1: string;
  h2s?: string | null;
  keywords?: string | null;
  content: string;
  slug: string;
}): string => {
  const h2s = Array.isArray(page.h2s) ? page.h2s : (page.h2s ? JSON.parse(page.h2s) : []);
  
  // Converter Markdown básico para HTML
  let htmlContent = page.content
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>');

  // Corrigir parágrafos duplicados
  htmlContent = htmlContent.replace(/<p><p>/g, '<p>').replace(/<\/p><\/p>/g, '</p>');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.metaDescription || ''}">
  ${page.keywords ? `<meta name="keywords" content="${Array.isArray(page.keywords) ? page.keywords.join(', ') : JSON.parse(page.keywords).join(', ')}">` : ''}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 { color: #2563eb; margin-top: 2em; }
    h2 { color: #1e40af; margin-top: 1.5em; }
    h3 { color: #3b82f6; margin-top: 1em; }
    ul { margin-left: 20px; }
    p { margin: 1em 0; }
  </style>
</head>
<body>
  <h1>${page.h1}</h1>
  ${htmlContent}
</body>
</html>`;
};

// Gerar conteúdo em texto simples para copiar
export const generatePlainText = (page: {
  title: string;
  metaDescription?: string | null;
  h1: string;
  h2s?: string | null;
  keywords?: string | null;
  content: string;
}): string => {
  const h2s = Array.isArray(page.h2s) ? page.h2s : (page.h2s ? JSON.parse(page.h2s) : []);
  const keywords = Array.isArray(page.keywords) ? page.keywords : (page.keywords ? JSON.parse(page.keywords) : []);
  
  let text = `TÍTULO (Meta Title):\n${page.title}\n\n`;
  text += `META DESCRIPTION:\n${page.metaDescription || ''}\n\n`;
  text += `H1:\n${page.h1}\n\n`;
  
  if (h2s.length > 0) {
    text += `H2s (Estrutura):\n${h2s.map((h2: string, i: number) => `${i + 1}. ${h2}`).join('\n')}\n\n`;
  }
  
  if (keywords.length > 0) {
    text += `PALAVRAS-CHAVE:\n${keywords.join(', ')}\n\n`;
  }
  
  text += `CONTEÚDO COMPLETO:\n${page.content}\n`;
  
  return text;
};

