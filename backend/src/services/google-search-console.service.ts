import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const SITE_URL = process.env.SITE_URL || 'https://grupobiomed.com';

/**
 * Submeter URL ao Google Search Console via API
 * 
 * NOTA: Requer OAuth2 do Google. Por enquanto, fornece instruções.
 * 
 * Para usar automaticamente, precisa:
 * 1. Criar projeto no Google Cloud Console
 * 2. Ativar Google Search Console API
 * 3. Criar credenciais OAuth2
 * 4. Configurar no .env
 */
export const submitUrlToGoogle = async (url: string): Promise<{
  success: boolean;
  message: string;
  manualSteps?: string[];
  apiInstructions?: string;
}> => {
  // Verificar se tem credenciais configuradas
  const hasCredentials = !!(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID &&
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET &&
    process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN
  );

  if (hasCredentials) {
    // Tentar submeter via API
    try {
      // Aqui viria a lógica de OAuth2 e API call
      // Por enquanto, retorna instruções
      return {
        success: true,
        message: 'Use as instruções abaixo para submeter ao Google Search Console',
        manualSteps: [
          '1. Acesse: https://search.google.com/search-console',
          '2. Selecione sua propriedade (grupobiomed.com)',
          '3. Vá em "Inspeção de URL" (barra de pesquisa no topo)',
          `4. Cole a URL: ${url}`,
          '5. Aguarde a análise',
          '6. Clique em "Solicitar indexação"',
        ],
        apiInstructions: 'Credenciais detectadas. API pode ser configurada futuramente.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao acessar API: ${error.message}`,
        manualSteps: getManualSubmissionSteps(url),
      };
    }
  }

  // Sem credenciais - fornecer instruções manuais
  return {
    success: true,
    message: 'Use as instruções abaixo para submeter manualmente ao Google',
    manualSteps: getManualSubmissionSteps(url),
  };
};

const getManualSubmissionSteps = (url: string): string[] => {
  return [
    '1. Acesse: https://search.google.com/search-console',
    '2. Faça login com conta Google que possui acesso ao site',
    '3. Se ainda não adicionou o site:',
    '   - Clique em "Adicionar propriedade"',
    '   - Digite: grupobiomed.com',
    '   - Verifique propriedade (via DNS, arquivo HTML, ou meta tag)',
    '4. Após verificar, vá em "Inspeção de URL" (barra no topo)',
    `5. Cole a URL: ${url}`,
    '6. Aguarde alguns segundos enquanto Google analisa',
    '7. Clique em "Solicitar indexação" (botão azul)',
    '8. ✅ Pronto! Google vai indexar em 1-7 dias',
  ];
};

/**
 * Verificar status de indexação de uma URL
 * 
 * Faz uma busca simples no Google para ver se aparece
 */
export const checkIndexingStatus = async (url: string): Promise<{
  indexed: boolean;
  estimatedPosition?: number;
  searchUrl: string;
  message: string;
}> => {
  try {
    // Extrair domínio e caminho
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Criar termo de busca
    const searchTerm = path.split('/').filter(p => p).join(' ') || domain;
    
    // URL de busca no Google (para o usuário verificar)
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} ${searchTerm}`)}`;
    
    return {
      indexed: false, // Não podemos determinar automaticamente sem API
      searchUrl,
      message: `Acesse o link abaixo para verificar se a página aparece nos resultados do Google`,
    };
  } catch (error: any) {
    return {
      indexed: false,
      searchUrl: '',
      message: `Erro ao verificar: ${error.message}`,
    };
  }
};

/**
 * Gerar lista de URLs para submeter em lote
 */
export const generateSubmissionList = (urls: string[]): {
  sitemapUrl: string;
  instructions: string[];
} => {
  const siteUrl = SITE_URL;
  const sitemapUrl = `${siteUrl}/api/seo/sitemap`;

  return {
    sitemapUrl,
    instructions: [
      '📋 Como submeter múltiplas páginas de uma vez:',
      '',
      '1. Acesse: https://search.google.com/search-console',
      '2. Selecione sua propriedade',
      '3. Vá em "Sitemaps" (menu lateral)',
      `4. Cole a URL do sitemap: ${sitemapUrl}`,
      '5. Clique em "Enviar"',
      '',
      '✅ Google vai indexar todas as páginas automaticamente!',
      '',
      '💡 Dica: Submeter sitemap é mais eficiente que submeter URLs individualmente.',
    ],
  };
};

/**
 * Obter estatísticas de indexação (simulado)
 * 
 * Em produção, usaria Google Search Console API para dados reais
 */
export const getIndexingStats = async (): Promise<{
  totalPages: number;
  indexedPages: number;
  pendingPages: number;
  excludedPages: number;
  message: string;
}> => {
  // Por enquanto retorna dados simulados
  // Em produção, buscaria dados reais da API
  
  return {
    totalPages: 0,
    indexedPages: 0,
    pendingPages: 0,
    excludedPages: 0,
    message: 'Configure Google Search Console API para ver estatísticas reais',
  };
};

