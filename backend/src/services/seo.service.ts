import axios from 'axios';

interface KeywordAnalysis {
  keyword: string;
  searchVolume?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  competition?: 'low' | 'medium' | 'high';
  suggestions: string[];
}

interface SEOContent {
  title: string;
  metaDescription: string;
  h1: string;
  h2: string[];
  content: string;
  keywords: string[];
  wordCount: number;
  readabilityScore: number;
}

interface SearchEnginePosition {
  engine: 'google' | 'bing' | 'yahoo' | 'duckduckgo';
  keyword: string;
  url: string;
  currentPosition?: number;
  lastChecked?: string;
}

// Analisar palavras-chave (estimativa baseada em padrões comuns)
export const analyzeKeyword = async (keyword: string): Promise<KeywordAnalysis> => {
  // Análise básica de palavra-chave
  const words = keyword.toLowerCase().split(' ');
  const wordCount = words.length;
  
  // Estimar dificuldade baseado em comprimento e termos comuns
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  let competition: 'low' | 'medium' | 'high' = 'low';
  
  // Palavras-chave longas (long-tail) são geralmente mais fáceis
  if (wordCount >= 4) {
    difficulty = 'easy';
    competition = 'low';
  } else if (wordCount === 3) {
    difficulty = 'medium';
    competition = 'medium';
  } else {
    // Palavras-chave curtas são mais competitivas
    difficulty = 'hard';
    competition = 'high';
  }
  
  // Termos muito genéricos são mais difíceis
  const genericTerms = ['empresa', 'serviço', 'negócio', 'comprar', 'vender'];
  if (words.some(w => genericTerms.includes(w)) && wordCount <= 2) {
    difficulty = 'hard';
    competition = 'high';
  }
  
  // Gerar sugestões relacionadas
  const suggestions = generateKeywordSuggestions(keyword);
  
  return {
    keyword,
    difficulty,
    competition,
    suggestions,
  };
};

// Gerar sugestões de palavras-chave relacionadas
const generateKeywordSuggestions = (keyword: string): string[] => {
  const baseWords = keyword.toLowerCase().split(' ');
  const suggestions: string[] = [];
  
  // Variações comuns
  const modifiers = [
    'melhor',
    'como',
    'o que é',
    'preço',
    'barato',
    'grátis',
    'online',
    'perto de mim',
    'não',
    'top',
    'melhores',
  ];
  
  const locations = [
    'brasil',
    'sp',
    'rio de janeiro',
    'são paulo',
    'minas gerais',
    'rio grande do sul',
  ];
  
  // Adicionar modificadores no início
  modifiers.slice(0, 5).forEach(mod => {
    suggestions.push(`${mod} ${keyword}`);
  });
  
  // Adicionar localizações
  locations.slice(0, 3).forEach(loc => {
    suggestions.push(`${keyword} ${loc}`);
  });
  
  // Variações de plural/singular
  if (!keyword.endsWith('s')) {
    suggestions.push(`${keyword}s`);
  }
  
  // Adicionar palavras relacionadas ao nicho
  const nicheTerms = ['saúde ocupacional', 'medicina do trabalho', 'pcmat', 'asmt'];
  nicheTerms.forEach(term => {
    if (!keyword.toLowerCase().includes(term)) {
      suggestions.push(`${keyword} ${term}`);
    }
  });
  
  return suggestions.slice(0, 10); // Limitar a 10 sugestões
};

// Analisar múltiplas palavras-chave
export const analyzeMultipleKeywords = async (keywords: string[]): Promise<KeywordAnalysis[]> => {
  const analyses = await Promise.all(
    keywords.map(keyword => analyzeKeyword(keyword))
  );
  return analyses;
};

// Gerar conteúdo otimizado para SEO
export const generateSEOContent = async (
  topic: string,
  targetKeywords: string[],
  contentType: 'article' | 'landing' | 'blog' = 'article'
): Promise<SEOContent> => {
  // Palavra-chave principal (primeira da lista)
  const mainKeyword = targetKeywords[0] || topic;
  
  // Gerar título otimizado (50-60 caracteres)
  const title = generateOptimizedTitle(topic, mainKeyword, contentType);
  
  // Gerar meta description (150-160 caracteres)
  const metaDescription = generateMetaDescription(topic, mainKeyword, targetKeywords);
  
  // Gerar H1
  const h1 = generateH1(topic, mainKeyword);
  
  // Gerar H2s
  const h2s = generateH2s(topic, targetKeywords);
  
  // Gerar conteúdo
  const content = generateContent(topic, targetKeywords, h2s);
  
  // Calcular word count
  const wordCount = content.split(/\s+/).length;
  
  // Calcular readability score (simplificado)
  const readabilityScore = calculateReadability(content);
  
  return {
    title,
    metaDescription,
    h1,
    h2: h2s,
    content,
    keywords: targetKeywords,
    wordCount,
    readabilityScore,
  };
};

// Gerar título otimizado
const generateOptimizedTitle = (topic: string, keyword: string, type: string): string => {
  const templates = {
    article: `${keyword} - Guia Completo 2024 | Grupo Biomed`,
    landing: `${keyword} - Soluções em Saúde Ocupacional`,
    blog: `${keyword}: Tudo o que Você Precisa Saber`,
  };
  
  const template = templates[type as keyof typeof templates] || templates.article;
  
  // Garantir que não ultrapasse 60 caracteres
  let title = template.replace('${keyword}', keyword);
  if (title.length > 60) {
    title = `${keyword} - Grupo Biomed`;
    if (title.length > 60) {
      title = keyword.substring(0, 57) + '...';
    }
  }
  
  return title;
};

// Gerar meta description
const generateMetaDescription = (topic: string, keyword: string, keywords: string[]): string => {
  const variations = [
    `Descubra tudo sobre ${keyword}. Soluções completas em saúde ocupacional e medicina do trabalho. Entre em contato com o Grupo Biomed.`,
    `${keyword} - Serviços especializados em saúde ocupacional. Atendimento em todo Brasil. Solicite seu orçamento agora.`,
    `Conheça os melhores serviços de ${keyword} com o Grupo Biomed. Especialistas em saúde ocupacional há anos. Agende sua consulta.`,
  ];
  
  let description = variations[Math.floor(Math.random() * variations.length)];
  
  // Incluir outras palavras-chave se couber
  if (keywords.length > 1 && description.length < 140) {
    const extra = keywords.slice(1, 3).join(', ');
    description += ` Também trabalhamos com ${extra}.`;
  }
  
  // Garantir tamanho ideal (150-160 caracteres)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  return description;
};

// Gerar H1
const generateH1 = (topic: string, keyword: string): string => {
  return keyword.charAt(0).toUpperCase() + keyword.slice(1);
};

// Gerar H2s
const generateH2s = (topic: string, keywords: string[]): string[] => {
  const h2s: string[] = [
    `O que é ${keywords[0] || topic}?`,
    `Benefícios do ${keywords[0] || topic}`,
    `Como funciona o ${keywords[0] || topic}`,
    `Quando utilizar ${keywords[0] || topic}`,
  ];
  
  // Adicionar H2s baseados em outras palavras-chave
  if (keywords.length > 1) {
    keywords.slice(1, 4).forEach((kw, index) => {
      if (index + 4 < 8) {
        h2s.push(`Diferenças entre ${keywords[0]} e ${kw}`);
      }
    });
  }
  
  h2s.push('Como escolher o melhor serviço');
  h2s.push('Contato Grupo Biomed');
  
  return h2s.slice(0, 8);
};

// Gerar conteúdo otimizado
const generateContent = (topic: string, keywords: string[], h2s: string[]): string => {
  const mainKeyword = keywords[0] || topic;
  
  let content = `# ${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)}\n\n`;
  content += `Neste guia completo, você vai descobrir tudo sobre ${mainKeyword} e como o Grupo Biomed pode ajudar sua empresa com soluções em saúde ocupacional e medicina do trabalho.\n\n`;
  
  // Conteúdo para cada H2
  h2s.forEach((h2, index) => {
    content += `## ${h2}\n\n`;
    
    if (h2.includes('O que é')) {
      content += `${mainKeyword} é uma área essencial da saúde ocupacional que visa proteger e promover a saúde dos trabalhadores. No Grupo Biomed, oferecemos serviços especializados em ${mainKeyword}, atendendo empresas de todos os portes.\n\n`;
    } else if (h2.includes('Benefícios')) {
      content += `Os principais benefícios de investir em ${mainKeyword} incluem:\n\n`;
      content += `- Melhoria na saúde e segurança dos colaboradores\n`;
      content += `- Redução de afastamentos e custos trabalhistas\n`;
      content += `- Conformidade com a legislação trabalhista\n`;
      content += `- Aumento da produtividade e bem-estar\n`;
      content += `- Prevenção de doenças ocupacionais\n\n`;
    } else if (h2.includes('Como funciona')) {
      content += `Nosso processo de ${mainKeyword} no Grupo Biomed segue um protocolo estruturado:\n\n`;
      content += `1. **Análise inicial**: Avaliamos as necessidades específicas da sua empresa\n`;
      content += `2. **Planejamento**: Desenvolvemos um plano personalizado de ${mainKeyword}\n`;
      content += `3. **Execução**: Implementamos as soluções com profissionais qualificados\n`;
      content += `4. **Monitoramento**: Acompanhamos os resultados e fazemos ajustes necessários\n`;
      content += `5. **Relatórios**: Fornecemos documentação completa e atualizada\n\n`;
    } else if (h2.includes('Quando utilizar')) {
      content += `${mainKeyword} é indicado para empresas que:\n\n`;
      content += `- Precisam cumprir exigências legais de saúde ocupacional\n`;
      content += `- Desejam melhorar a saúde dos colaboradores\n`;
      content += `- Querem reduzir custos com afastamentos\n`;
      content += `- Buscam prevenir doenças ocupacionais\n`;
      content += `- Necessitam de assessoria especializada\n\n`;
    } else if (h2.includes('escolher')) {
      content += `Ao escolher um serviço de ${mainKeyword}, considere:\n\n`;
      content += `- Experiência e credibilidade da empresa\n`;
      content += `- Certificações e credenciais profissionais\n`;
      content += `- Atendimento personalizado\n`;
      content += `- Cobertura geográfica\n`;
      content += `- Relatório de custo-benefício\n\n`;
      content += `O Grupo Biomed possui anos de experiência no mercado, atendendo empresas de diversos segmentos com excelência e comprometimento.\n\n`;
    } else if (h2.includes('Contato')) {
      content += `Está procurando serviços de ${mainKeyword}? Entre em contato com o Grupo Biomed!\n\n`;
      content += `- 📧 Email: contato@grupobiomed.com\n`;
      content += `- 📱 Telefone: (11) 94003-1033\n`;
      content += `- 🌐 Website: www.grupobiomed.com\n`;
      content += `- 📍 Atendemos em todo Brasil\n\n`;
      content += `Nossos especialistas estão prontos para entender suas necessidades e oferecer a melhor solução em saúde ocupacional.\n\n`;
    } else {
      content += `${h2} é um aspecto importante no contexto de ${mainKeyword}. No Grupo Biomed, trabalhamos com profissionais qualificados e metodologias comprovadas para garantir os melhores resultados.\n\n`;
    }
    
    // Incluir palavras-chave secundárias naturalmente
    if (keywords.length > index + 1 && index < keywords.length - 1) {
      const secondaryKeyword = keywords[index + 1];
      content += `Também trabalhamos com ${secondaryKeyword} e outras soluções relacionadas a saúde ocupacional.\n\n`;
    }
  });
  
  // Incluir call-to-action
  content += `## Entre em Contato\n\n`;
  content += `Não perca tempo! Solicite agora mesmo um orçamento para serviços de ${mainKeyword} e descubra como o Grupo Biomed pode transformar a saúde ocupacional da sua empresa.\n\n`;
  
  return content;
};

// Calcular legibilidade (Flesch Reading Ease simplificado)
const calculateReadability = (text: string): number => {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const syllables = text.toLowerCase().match(/[aeiouáéíóúâêôãõ]+/g)?.length || words;
  
  if (sentences === 0 || words === 0) return 50;
  
  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;
  
  // Fórmula simplificada (escala 0-100, onde 100 = muito fácil)
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Verificar posição em buscadores (simulação - em produção, usaria APIs reais)
export const checkSearchPosition = async (
  keyword: string,
  url: string,
  engines: Array<'google' | 'bing' | 'yahoo' | 'duckduckgo'> = ['google']
): Promise<SearchEnginePosition[]> => {
  const positions: SearchEnginePosition[] = [];
  
  for (const engine of engines) {
    // Nota: Em produção, isso precisaria usar APIs de SEO ou web scraping
    // Por enquanto, retornamos uma estrutura que pode ser preenchida manualmente
    positions.push({
      engine,
      keyword,
      url,
      currentPosition: undefined, // Seria preenchido por API real ou scraping
      lastChecked: new Date().toISOString(),
    });
  }
  
  return positions;
};

// Analisar concorrentes (análise básica de URLs)
export const analyzeCompetitors = async (urls: string[]): Promise<Array<{
  url: string;
  title?: string;
  description?: string;
  h1?: string;
  keywords?: string[];
}>> => {
  const analyses = [];
  
  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      const html = response.data;
      
      // Extrair título
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : undefined;
      
      // Extrair meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1].trim() : undefined;
      
      // Extrair H1
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const h1 = h1Match ? h1Match[1].trim() : undefined;
      
      // Extrair keywords (se existir meta tag)
      const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
      const keywords = keywordsMatch ? keywordsMatch[1].split(',').map((k: string) => k.trim()) : undefined;
      
      analyses.push({
        url,
        title,
        description,
        h1,
        keywords,
      });
    } catch (error) {
      // Se não conseguir acessar, adicionar apenas a URL
      analyses.push({ url });
    }
  }
  
  return analyses;
};

// Gerar sugestões de SEO
export const generateSEOSuggestions = async (url: string): Promise<Array<{
  type: 'critical' | 'warning' | 'info';
  category: string;
  issue: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}>> => {
  const suggestions: Array<{
    type: 'critical' | 'warning' | 'info';
    category: string;
    issue: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }> = [];
  
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const html = response.data;
    
    // Verificar título
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) {
      suggestions.push({
        type: 'critical',
        category: 'Meta Tags',
        issue: 'Título não encontrado',
        suggestion: 'Adicione uma tag <title> com 50-60 caracteres incluindo sua palavra-chave principal',
        impact: 'high',
      });
    } else {
      const title = titleMatch[1].trim();
      if (title.length < 30) {
        suggestions.push({
          type: 'warning',
          category: 'Meta Tags',
          issue: 'Título muito curto',
          suggestion: `Aumente o título para 50-60 caracteres. Atual: ${title.length} caracteres`,
          impact: 'medium',
        });
      } else if (title.length > 60) {
        suggestions.push({
          type: 'warning',
          category: 'Meta Tags',
          issue: 'Título muito longo',
          suggestion: `Reduza o título para 50-60 caracteres. Atual: ${title.length} caracteres`,
          impact: 'medium',
        });
      }
    }
    
    // Verificar meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (!descMatch) {
      suggestions.push({
        type: 'critical',
        category: 'Meta Tags',
        issue: 'Meta description não encontrada',
        suggestion: 'Adicione uma meta description com 150-160 caracteres descrevendo seu conteúdo',
        impact: 'high',
      });
    } else {
      const desc = descMatch[1].trim();
      if (desc.length < 120) {
        suggestions.push({
          type: 'warning',
          category: 'Meta Tags',
          issue: 'Meta description muito curta',
          suggestion: `Aumente a meta description para 150-160 caracteres. Atual: ${desc.length} caracteres`,
          impact: 'medium',
        });
      } else if (desc.length > 160) {
        suggestions.push({
          type: 'warning',
          category: 'Meta Tags',
          issue: 'Meta description muito longa',
          suggestion: `Reduza a meta description para 150-160 caracteres. Atual: ${desc.length} caracteres`,
          impact: 'medium',
        });
      }
    }
    
    // Verificar H1
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    if (!h1Matches || h1Matches.length === 0) {
      suggestions.push({
        type: 'critical',
        category: 'Estrutura',
        issue: 'Nenhum H1 encontrado',
        suggestion: 'Adicione um H1 com sua palavra-chave principal',
        impact: 'high',
      });
    } else if (h1Matches.length > 1) {
      suggestions.push({
        type: 'warning',
        category: 'Estrutura',
        issue: 'Múltiplos H1s encontrados',
        suggestion: 'Use apenas um H1 por página. Converta os outros em H2 ou H3',
        impact: 'medium',
      });
    }
    
    // Verificar imagens sem alt
    const imagesWithoutAlt = (html.match(/<img[^>]*>(?!.*alt=["'][^"']+["'])/gi) || []).length;
    if (imagesWithoutAlt > 0) {
      suggestions.push({
        type: 'warning',
        category: 'Acessibilidade',
        issue: `${imagesWithoutAlt} imagem(ns) sem atributo alt`,
        suggestion: 'Adicione atributos alt descritivos em todas as imagens',
        impact: 'medium',
      });
    }
    
    // Verificar se é HTTPS
    if (!url.startsWith('https://')) {
      suggestions.push({
        type: 'warning',
        category: 'Segurança',
        issue: 'Site não usa HTTPS',
        suggestion: 'Configure SSL/HTTPS para melhorar segurança e ranking',
        impact: 'medium',
      });
    }
    
    // Verificar estrutura de headings
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    if (h2Count === 0) {
      suggestions.push({
        type: 'info',
        category: 'Estrutura',
        issue: 'Nenhum H2 encontrado',
        suggestion: 'Use H2s para organizar o conteúdo em seções',
        impact: 'low',
      });
    }
    
  } catch (error) {
    suggestions.push({
      type: 'warning',
      category: 'Acesso',
      issue: 'Não foi possível analisar a URL',
      suggestion: 'Verifique se a URL está acessível e tente novamente',
      impact: 'medium',
    });
  }
  
  return suggestions;
};

