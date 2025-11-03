import { Router } from 'express';
import {
  analyzeKeyword,
  analyzeMultipleKeywords,
  generateSEOContent,
  checkSearchPosition,
  analyzeCompetitors,
  generateSEOSuggestions,
} from '../services/seo.service';
import {
  createSeoPage,
  listSeoPages,
  getSeoPageById,
  getSeoPageBySlug,
  updateSeoPage,
  deleteSeoPage,
  generateExportableHTML,
  generatePlainText,
  generateSlug,
} from '../services/seo-page.service';
import {
  notifyGoogleAboutPage,
  generateSitemap,
  generateRobotsTxt,
  checkIfIndexed,
  getIndexingRecommendations,
} from '../services/search-engine-indexer.service';
import {
  submitUrlToGoogle,
  checkIndexingStatus,
  generateSubmissionList,
  getIndexingStats,
} from '../services/google-search-console.service';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

// Analisar uma palavra-chave
router.post('/analyze-keyword', async (req, res, next) => {
  try {
    const { keyword } = req.body;

    if (!keyword || typeof keyword !== 'string') {
      throw new AppError('Palavra-chave é obrigatória', 400);
    }

    const analysis = await analyzeKeyword(keyword);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Analisar múltiplas palavras-chave
router.post('/analyze-keywords', async (req, res, next) => {
  try {
    const { keywords } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new AppError('Lista de palavras-chave é obrigatória', 400);
    }

    const analyses = await analyzeMultipleKeywords(keywords);

    res.json({
      success: true,
      data: analyses,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Gerar conteúdo otimizado para SEO
router.post('/generate-content', async (req, res, next) => {
  try {
    const { topic, keywords, contentType } = req.body;

    if (!topic || typeof topic !== 'string') {
      throw new AppError('Tópico é obrigatório', 400);
    }

    const targetKeywords = keywords || [topic];
    const type = contentType || 'article';

    const content = await generateSEOContent(topic, targetKeywords, type);

    res.json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Verificar posição em buscadores
router.post('/check-position', async (req, res, next) => {
  try {
    const { keyword, url, engines } = req.body;

    if (!keyword || !url) {
      throw new AppError('Palavra-chave e URL são obrigatórios', 400);
    }

    const positions = await checkSearchPosition(
      keyword,
      url,
      engines || ['google']
    );

    res.json({
      success: true,
      data: positions,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Analisar concorrentes
router.post('/analyze-competitors', async (req, res, next) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new AppError('Lista de URLs é obrigatória', 400);
    }

    const analyses = await analyzeCompetitors(urls);

    res.json({
      success: true,
      data: analyses,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Gerar sugestões de SEO
router.post('/suggestions', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      throw new AppError('URL é obrigatória', 400);
    }

    const suggestions = await generateSEOSuggestions(url);

    res.json({
      success: true,
      data: {
        url,
        suggestions,
        total: suggestions.length,
        critical: suggestions.filter(s => s.type === 'critical').length,
        warnings: suggestions.filter(s => s.type === 'warning').length,
        info: suggestions.filter(s => s.type === 'info').length,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// ========== GERENCIAMENTO DE PÁGINAS SEO ==========

// Criar página SEO
router.post('/pages', async (req, res, next) => {
  try {
    const {
      title,
      metaDescription,
      slug,
      h1,
      h2s,
      content,
      keywords,
      contentType,
      wordCount,
      readabilityScore,
    } = req.body;

    if (!title || !h1 || !content) {
      throw new AppError('Título, H1 e conteúdo são obrigatórios', 400);
    }

    const page = await createSeoPage({
      title,
      metaDescription,
      slug: slug || generateSlug(title),
      h1,
      h2s,
      content,
      keywords,
      contentType,
      wordCount,
      readabilityScore,
    });

    res.json({
      success: true,
      data: {
        ...page,
        h2s: page.h2s ? JSON.parse(page.h2s) : [],
        keywords: page.keywords ? JSON.parse(page.keywords) : [],
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      next(new AppError('Slug já existe. Tente outro.', 400));
    } else {
      next(new AppError(error.message, 500));
    }
  }
});

// Listar páginas SEO
router.get('/pages', async (req, res, next) => {
  try {
    const { status, contentType, search } = req.query;

    const pages = await listSeoPages({
      status: status as string,
      contentType: contentType as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Buscar página por ID
router.get('/pages/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = await getSeoPageById(id);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Buscar página por slug
router.get('/pages/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const page = await getSeoPageBySlug(slug);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Atualizar página SEO
router.put('/pages/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const page = await updateSeoPage(id, data);

    res.json({
      success: true,
      data: {
        ...page,
        h2s: page.h2s ? JSON.parse(page.h2s) : [],
        keywords: page.keywords ? JSON.parse(page.keywords) : [],
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      next(new AppError('Página não encontrada', 404));
    } else {
      next(new AppError(error.message, 500));
    }
  }
});

// Deletar página SEO
router.delete('/pages/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteSeoPage(id);

    res.json({
      success: true,
      message: 'Página deletada com sucesso',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      next(new AppError('Página não encontrada', 404));
    } else {
      next(new AppError(error.message, 500));
    }
  }
});

// Exportar página como HTML
router.get('/pages/:id/export/html', async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = await getSeoPageById(id);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const html = generateExportableHTML(page);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${page.slug}.html"`);
    res.send(html);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Exportar página como texto
router.get('/pages/:id/export/text', async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = await getSeoPageById(id);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const text = generatePlainText(page);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${page.slug}.txt"`);
    res.send(text);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// ========== INDEXAÇÃO EM BUSCADORES ==========

// Notificar Google sobre nova página
router.post('/pages/:id/notify-google', async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = await getSeoPageById(id);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';
    const pageUrl = `${siteUrl}/${page.slug}`;

    const result = await submitUrlToGoogle(pageUrl);

    res.json({
      success: true,
      data: {
        url: pageUrl,
        ...result,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Verificar se página está indexada
router.get('/pages/:id/check-indexed', async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = await getSeoPageById(id);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';
    const pageUrl = `${siteUrl}/${page.slug}`;

    const result = await checkIndexingStatus(pageUrl);

    res.json({
      success: true,
      data: {
        url: pageUrl,
        ...result,
      },
    });
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Submeter sitemap ao Google (instruções)
router.get('/submit-sitemap', async (req, res, next) => {
  try {
    const pages = await listSeoPages();
    const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';
    const urls = pages.map((p: any) => `${siteUrl}/${p.slug}`);

    const result = generateSubmissionList(urls);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Estatísticas de indexação
router.get('/indexing-stats', async (req, res, next) => {
  try {
    const stats = await getIndexingStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Gerar Sitemap XML de todas as páginas
router.get('/sitemap', async (req, res, next) => {
  try {
    const pages = await listSeoPages();
    const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';

    const sitemapPages = pages.map((page: any) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const sitemap = generateSitemap(sitemapPages);

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Gerar robots.txt
router.get('/robots', async (req, res, next) => {
  try {
    const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';
    const sitemapUrl = `${siteUrl}/api/seo/sitemap`;

    const robots = generateRobotsTxt(sitemapUrl);

    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// ========== INTEGRAÇÃO COM SITE ==========

// Servir página HTML completa (para iframe ou uso direto)
router.get('/pages/slug/:slug/html', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const page = await getSeoPageBySlug(slug);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const html = generateExportableHTML(page);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Servir apenas conteúdo (sem header/footer - para integrar no seu site)
router.get('/pages/slug/:slug/content', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const page = await getSeoPageBySlug(slug);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const h2s = Array.isArray(page.h2s) ? page.h2s : (page.h2s ? JSON.parse(page.h2s) : []);
    
    // Converter Markdown básico para HTML
    let htmlContent = page.content
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br/>');

    // Apenas o conteúdo, sem estrutura HTML completa
    const content = `
      <article class="seo-page-content">
        <h1>${page.h1}</h1>
        ${htmlContent}
      </article>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Preview com iframe ready (inclui meta tags e estrutura básica)
router.get('/pages/slug/:slug/preview', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const page = await getSeoPageBySlug(slug);

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const html = generateExportableHTML(page);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    next(new AppError(error.message, error.statusCode || 500));
  }
});

// Listar todas as páginas (para sitemap dinâmico ou menu)
router.get('/pages/list', async (req, res, next) => {
  try {
    const pages = await listSeoPages();
    const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';

    const pagesList = pages.map((page: any) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      url: `${siteUrl}/${page.slug}`,
      apiUrl: `${siteUrl}/api/seo/pages/slug/${page.slug}/html`,
      status: page.status,
      contentType: page.contentType,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }));

    res.json({
      success: true,
      data: pagesList,
      count: pagesList.length,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Obter recomendações de indexação
router.get('/indexing-recommendations', async (req, res, next) => {
  try {
    const recommendations = getIndexingRecommendations();

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export default router;

