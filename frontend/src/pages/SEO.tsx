import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

interface KeywordAnalysis {
  keyword: string;
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

interface SeoPage {
  id: string;
  title: string;
  metaDescription?: string;
  slug: string;
  h1: string;
  h2s: string[];
  content: string;
  keywords: string[];
  contentType: string;
  status: string;
  wordCount?: number;
  readabilityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export default function SEO() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [topic, setTopic] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [contentType, setContentType] = useState<'article' | 'landing' | 'blog'>('article');
  const [url, setUrl] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [activeTab, setActiveTab] = useState<'tools' | 'pages'>('tools');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [slugInput, setSlugInput] = useState('');

  const [analysisResult, setAnalysisResult] = useState<KeywordAnalysis | null>(null);
  const [contentResult, setContentResult] = useState<SEOContent | null>(null);
  const [suggestionsResult, setSuggestionsResult] = useState<any>(null);

  // Análise de palavra-chave
  const analyzeKeywordMutation = useMutation(
    async (keyword: string) => {
      const res = await api.post('/seo/analyze-keyword', { keyword });
      return res.data.data;
    },
    {
      onSuccess: (data) => {
        setAnalysisResult(data);
        toast.success('Análise concluída!');
      },
      onError: () => {
        toast.error('Erro ao analisar palavra-chave');
      },
    }
  );

  // Gerar conteúdo SEO
  const generateContentMutation = useMutation(
    async () => {
      const keywords = targetKeywords.split(',').map(k => k.trim()).filter(k => k);
      const res = await api.post('/seo/generate-content', {
        topic,
        keywords: keywords.length > 0 ? keywords : [topic],
        contentType,
      });
      return res.data.data;
    },
    {
      onSuccess: (data) => {
        setContentResult(data);
        toast.success('Conteúdo gerado com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao gerar conteúdo');
      },
    }
  );

  // Analisar URL e gerar sugestões
  const analyzeUrlMutation = useMutation(
    async (url: string) => {
      const res = await api.post('/seo/suggestions', { url });
      return res.data.data;
    },
    {
      onSuccess: (data) => {
        setSuggestionsResult(data);
        toast.success('Análise de URL concluída!');
      },
      onError: () => {
        toast.error('Erro ao analisar URL');
      },
    }
  );

  // Analisar concorrentes
  const analyzeCompetitorsMutation = useMutation(
    async (urls: string[]) => {
      const res = await api.post('/seo/analyze-competitors', { urls });
      return res.data.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Análise de ${data.length} concorrente(s) concluída!`);
      },
      onError: () => {
        toast.error('Erro ao analisar concorrentes');
      },
    }
  );

  // Listar páginas SEO
  const { data: seoPages = [], refetch: refetchPages } = useQuery<SeoPage[]>(
    'seo-pages',
    async () => {
      const res = await api.get('/seo/pages');
      return res.data.data;
    }
  );

  // Salvar conteúdo gerado como página
  const savePageMutation = useMutation(
    async (data: any) => {
      const res = await api.post('/seo/pages', data);
      return res.data.data;
    },
    {
      onSuccess: () => {
        toast.success('Página salva com sucesso!');
        setShowSaveModal(false);
        setSlugInput('');
        refetchPages();
        queryClient.invalidateQueries('seo-pages');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao salvar página');
      },
    }
  );

  // Deletar página
  const deletePageMutation = useMutation(
    async (id: string) => {
      await api.delete(`/seo/pages/${id}`);
    },
    {
      onSuccess: () => {
        toast.success('Página deletada!');
        refetchPages();
        queryClient.invalidateQueries('seo-pages');
      },
      onError: () => {
        toast.error('Erro ao deletar página');
      },
    }
  );

  // Gerar slug a partir do título
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Salvar conteúdo gerado
  const handleSaveContent = () => {
    if (!contentResult) {
      toast.error('Gere um conteúdo primeiro');
      return;
    }

    const slug = slugInput || generateSlug(contentResult.title);
    setSlugInput(slug);
    setShowSaveModal(true);
  };

  // Confirmar salvamento
  const handleConfirmSave = () => {
    if (!contentResult) return;

    savePageMutation.mutate({
      title: contentResult.title,
      metaDescription: contentResult.metaDescription,
      slug: slugInput || generateSlug(contentResult.title),
      h1: contentResult.h1,
      h2s: contentResult.h2,
      content: contentResult.content,
      keywords: contentResult.keywords,
      contentType,
      wordCount: contentResult.wordCount,
      readabilityScore: contentResult.readabilityScore,
    });
  };

  // Exportar HTML
  const handleExportHTML = async (pageId: string) => {
    try {
      const response = await api.get(`/seo/pages/${pageId}/export/html`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${seoPages.find(p => p.id === pageId)?.slug || 'page'}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('HTML exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar HTML');
    }
  };

  // Exportar texto
  const handleExportText = async (pageId: string) => {
    try {
      const response = await api.get(`/seo/pages/${pageId}/export/text`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${seoPages.find(p => p.id === pageId)?.slug || 'page'}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Texto exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar texto');
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (difficulty === 'easy') return 'text-green-600 bg-green-50';
    if (difficulty === 'medium') return 'text-yellow-600 bg-yellow-50';
    if (difficulty === 'hard') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getDifficultyLabel = (difficulty?: string) => {
    if (difficulty === 'easy') return 'Fácil';
    if (difficulty === 'medium') return 'Médio';
    if (difficulty === 'hard') return 'Difícil';
    return 'N/A';
  };

  const getCompetitionColor = (competition?: string) => {
    if (competition === 'low') return 'text-green-600 bg-green-50';
    if (competition === 'medium') return 'text-yellow-600 bg-yellow-50';
    if (competition === 'high') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getCompetitionLabel = (competition?: string) => {
    if (competition === 'low') return 'Baixa';
    if (competition === 'medium') return 'Média';
    if (competition === 'high') return 'Alta';
    return 'N/A';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🔍 SEO - Otimização para Buscadores</h2>
          <p className="text-gray-600">
            Ferramentas gratuitas para melhorar seu posicionamento em Google, Bing, Yahoo e outros
          </p>
        </div>

        {/* Abas */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🔧 Ferramentas SEO
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                activeTab === 'pages'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📄 Minhas Páginas ({seoPages.length})
            </button>
          </div>
        </div>

        {/* Informação sobre Buscadores */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">✅ SEO é 100% GRATUITO!</h4>
              <p className="text-sm text-blue-800 mb-2">
                Quando você clica em <strong>"PUBLICAR"</strong>, o sistema já cria páginas otimizadas que aparecem automaticamente em:
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white rounded border border-blue-200">🔍 Google</span>
                <span className="px-2 py-1 bg-white rounded border border-blue-200">🌐 Bing</span>
                <span className="px-2 py-1 bg-white rounded border border-blue-200">📱 Yahoo</span>
                <span className="px-2 py-1 bg-white rounded border border-blue-200">🦆 DuckDuckGo</span>
                <span className="px-2 py-1 bg-white rounded border border-blue-200">+ Outros</span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                <strong>Chrome, Firefox, Safari</strong> são navegadores - todos usam o Google como buscador padrão.
                <br />
                <strong>Sem custo</strong> - SEO orgânico é totalmente gratuito! ⏱️ Resultados aparecem em 3-6 meses.
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'tools' && (
          <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Análise de Palavra-chave */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Análise de Palavra-chave</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digite a palavra-chave:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ex: saúde ocupacional"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && keyword) {
                      analyzeKeywordMutation.mutate(keyword);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (keyword) {
                      analyzeKeywordMutation.mutate(keyword);
                    } else {
                      toast.error('Digite uma palavra-chave');
                    }
                  }}
                  disabled={analyzeKeywordMutation.isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  Analisar
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Palavra-chave:</span>
                    <span className="text-lg font-bold text-indigo-600">{analysisResult.keyword}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Dificuldade:</div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(analysisResult.difficulty)}`}>
                        {getDifficultyLabel(analysisResult.difficulty)}
                      </span>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Competição:</div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompetitionColor(analysisResult.competition)}`}>
                        {getCompetitionLabel(analysisResult.competition)}
                      </span>
                    </div>
                  </div>
                </div>

                {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">💡 Sugestões de Palavras-chave:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm cursor-pointer hover:bg-indigo-100"
                          onClick={() => {
                            setKeyword(suggestion);
                            analyzeKeywordMutation.mutate(suggestion);
                          }}
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gerar Conteúdo SEO */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">✍️ Gerar Conteúdo Otimizado</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tópico principal:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: saúde ocupacional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palavras-chave (separadas por vírgula):
                </label>
                <input
                  type="text"
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  placeholder="saúde ocupacional, medicina do trabalho, PCMAT"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de conteúdo:
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as 'article' | 'landing' | 'blog')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="article">Artigo</option>
                  <option value="landing">Landing Page</option>
                  <option value="blog">Post de Blog</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (topic) {
                    generateContentMutation.mutate();
                  } else {
                    toast.error('Digite um tópico');
                  }
                }}
                disabled={generateContentMutation.isLoading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
              >
                {generateContentMutation.isLoading ? 'Gerando...' : 'Gerar Conteúdo'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultado do Conteúdo Gerado */}
        {contentResult && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Conteúdo Gerado</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Palavras:</div>
                <div className="text-2xl font-bold text-gray-900">{contentResult.wordCount}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Legibilidade:</div>
                <div className="text-2xl font-bold text-gray-900">{contentResult.readabilityScore}/100</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título (Meta Title):</label>
                <textarea
                  readOnly
                  value={contentResult.title}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  rows={2}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {contentResult.title.length} caracteres (ideal: 50-60)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description:</label>
                <textarea
                  readOnly
                  value={contentResult.metaDescription}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {contentResult.metaDescription.length} caracteres (ideal: 150-160)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">H1:</label>
                <input
                  type="text"
                  readOnly
                  value={contentResult.h1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">H2s (Estrutura):</label>
                <div className="space-y-2">
                  {contentResult.h2.map((h2, index) => (
                    <div key={index} className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {h2}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo Completo:</label>
                <textarea
                  readOnly
                  value={contentResult.content}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  rows={20}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contentResult.content);
                      toast.success('Conteúdo copiado!');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    📋 Copiar Conteúdo
                  </button>
                  <button
                    onClick={() => {
                      const fullContent = `Title: ${contentResult.title}\n\nMeta Description: ${contentResult.metaDescription}\n\nH1: ${contentResult.h1}\n\n${contentResult.content}`;
                      navigator.clipboard.writeText(fullContent);
                      toast.success('Tudo copiado!');
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    📋 Copiar Tudo
                  </button>
                  <button
                    onClick={handleSaveContent}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    💾 Salvar como Página
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analisar URL e Sugestões */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🔍 Analisar URL do Site</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL para analisar:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.grupobiomed.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (url) {
                      analyzeUrlMutation.mutate(url);
                    } else {
                      toast.error('Digite uma URL');
                    }
                  }}
                  disabled={analyzeUrlMutation.isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  Analisar
                </button>
              </div>
            </div>

            {suggestionsResult && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total de Sugestões:</span>
                  <span className="text-lg font-bold text-indigo-600">{suggestionsResult.total}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-red-50 text-red-700 px-2 py-1 rounded text-center">
                    <div className="font-bold">{suggestionsResult.critical}</div>
                    <div className="text-xs">Críticas</div>
                  </div>
                  <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-center">
                    <div className="font-bold">{suggestionsResult.warnings}</div>
                    <div className="text-xs">Avisos</div>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-center">
                    <div className="font-bold">{suggestionsResult.info}</div>
                    <div className="text-xs">Info</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {suggestionsResult.suggestions.map((suggestion: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        suggestion.type === 'critical'
                          ? 'bg-red-50 border-red-200'
                          : suggestion.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {suggestion.type === 'critical' ? '🚨' : suggestion.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 mb-1">{suggestion.category}</div>
                          <div className="font-semibold text-gray-900 text-sm mb-1">
                            {suggestion.issue}
                          </div>
                          <div className="text-sm text-gray-700">{suggestion.suggestion}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Impacto: {suggestion.impact === 'high' ? 'Alto' : suggestion.impact === 'medium' ? 'Médio' : 'Baixo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Analisar Concorrentes */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏆 Analisar Concorrentes</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs dos concorrentes (uma por linha):
              </label>
              <textarea
                value={competitorUrls}
                onChange={(e) => setCompetitorUrls(e.target.value)}
                placeholder="https://concorrente1.com.br&#10;https://concorrente2.com.br"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={5}
              />
            </div>

            <button
              onClick={() => {
                const urls = competitorUrls.split('\n').map(u => u.trim()).filter(u => u);
                if (urls.length > 0) {
                  analyzeCompetitorsMutation.mutate(urls);
                } else {
                  toast.error('Digite pelo menos uma URL');
                }
              }}
              disabled={analyzeCompetitorsMutation.isLoading}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {analyzeCompetitorsMutation.isLoading ? 'Analisando...' : 'Analisar Concorrentes'}
            </button>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>💡 Dica:</strong> Analise seus principais concorrentes para descobrir quais palavras-chave eles usam e como otimizam seus sites.
              </p>
            </div>
          </div>
        </div>

        {/* Informações sobre SEO */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ Sobre SEO</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✅ Boas Práticas:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use palavras-chave naturalmente no conteúdo</li>
                <li>• Crie títulos descritivos e únicos</li>
                <li>• Otimize meta descriptions atrativas</li>
                <li>• Use H1, H2, H3 para estruturar o conteúdo</li>
                <li>• Adicione alt text em todas as imagens</li>
                <li>• Mantenha o site rápido e responsivo</li>
                <li>• Use HTTPS (SSL)</li>
                <li>• Publique conteúdo regularmente</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🔍 Funciona para:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Google (maior buscador)</li>
                <li>✓ Bing</li>
                <li>✓ Yahoo</li>
                <li>✓ DuckDuckGo</li>
                <li>✓ Outros buscadores</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Importante:</strong> SEO orgânico é gratuito, mas leva tempo (3-6 meses) para ver resultados. Seja paciente e consistente!
                </p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={async () => {
                    try {
                      const res = await api.get('/seo/submit-sitemap');
                      const sitemapUrl = res.data.data.sitemapUrl;
                      const instructions = res.data.data.instructions || [];
                      
                      const message = `📋 SUBMETER SITEMAP AO GOOGLE\n\n${instructions.join('\n')}\n\n🔗 URL do Sitemap:\n${sitemapUrl}`;
                      navigator.clipboard.writeText(message);
                      toast.success('✅ Instruções copiadas! Abrindo Google Search Console...');
                      
                      setTimeout(() => {
                        window.open('https://search.google.com/search-console', '_blank');
                      }, 500);
                    } catch (error) {
                      toast.error('Erro ao obter instruções do sitemap');
                    }
                  }}
                  className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🗺️</span>
                    <div>
                      <div className="font-semibold">Submeter Sitemap ao Google</div>
                      <div className="text-sm text-purple-100">Indexa todas as páginas de uma vez</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    const sitemapUrl = `${window.location.origin}/api/seo/sitemap`;
                    window.open(sitemapUrl, '_blank');
                    toast.success('Sitemap aberto! Copie a URL e cole no Google Search Console');
                  }}
                  className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-medium text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <div className="font-semibold">Ver Sitemap XML</div>
                      <div className="text-sm text-blue-100">Abre o arquivo XML completo</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Lista de Páginas */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">📄 Minhas Páginas SEO</h3>
                <span className="text-sm text-gray-500">{seoPages.length} página(s)</span>
              </div>

              {seoPages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">Nenhuma página salva ainda</p>
                  <p className="text-sm">Gere conteúdo na aba "Ferramentas SEO" e salve como página</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {seoPages.map((page) => (
                    <div
                      key={page.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{page.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {page.metaDescription || 'Sem descrição'}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              page.status === 'published' ? 'bg-green-100 text-green-700' :
                              page.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {page.status === 'published' ? 'Publicada' :
                               page.status === 'ready' ? 'Pronta' : 'Rascunho'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {page.contentType}
                            </span>
                            {page.wordCount && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {page.wordCount} palavras
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              Slug: /{page.slug}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `TÍTULO: ${page.title}\n\nMETA: ${page.metaDescription || ''}\n\nH1: ${page.h1}\n\n${page.content}`
                              );
                              toast.success('Conteúdo copiado!');
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                            title="Copiar conteúdo"
                          >
                            📋 Copiar
                          </button>
                          <button
                            onClick={() => handleExportHTML(page.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            title="Exportar HTML"
                          >
                            📥 HTML
                          </button>
                          <button
                            onClick={() => handleExportText(page.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            title="Exportar texto"
                          >
                            📄 TXT
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.post(`/seo/pages/${page.id}/notify-google`);
                                const url = res.data.data.url || `https://grupobiomed.com/${page.slug}`;
                                const steps = res.data.data.manualSteps || [];
                                const message = `🔍 URL para submeter:\n${url}\n\n📋 Passos:\n${steps.join('\n')}\n\n💡 Ou copie a URL e cole diretamente no Google Search Console.`;
                                navigator.clipboard.writeText(message);
                                toast.success('✅ Instruções copiadas! Acesse search.google.com/search-console');
                                
                                // Abrir Google Search Console em nova aba
                                setTimeout(() => {
                                  window.open('https://search.google.com/search-console', '_blank');
                                }, 500);
                              } catch (error) {
                                toast.error('Erro ao obter instruções');
                              }
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            title="Submeter ao Google Search Console"
                          >
                            🔍 Google
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.get(`/seo/pages/${page.id}/check-indexed`);
                                const searchUrl = res.data.data.searchUrl;
                                
                                if (searchUrl) {
                                  toast.success('Abrindo busca no Google...', { duration: 3000 });
                                  window.open(searchUrl, '_blank');
                                } else {
                                  toast.error('Erro ao gerar URL de verificação');
                                }
                              } catch (error) {
                                toast.error('Erro ao verificar indexação');
                              }
                            }}
                            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                            title="Verificar se está indexado"
                          >
                            ✅ Verificar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja deletar esta página?')) {
                                deletePageMutation.mutate(page.id);
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Salvar Página */}
        {showSaveModal && contentResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">💾 Salvar como Página SEO</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL amigável):
                  </label>
                  <input
                    type="text"
                    value={slugInput || generateSlug(contentResult.title)}
                    onChange={(e) => setSlugInput(e.target.value)}
                    placeholder="ex: saude-ocupacional"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A URL será: grupobiomed.com/{slugInput || generateSlug(contentResult.title)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <div className="font-semibold mb-2">Resumo:</div>
                  <div className="space-y-1 text-gray-600">
                    <div>📝 <strong>Título:</strong> {contentResult.title}</div>
                    <div>📊 <strong>Palavras:</strong> {contentResult.wordCount}</div>
                    <div>⭐ <strong>Legibilidade:</strong> {contentResult.readabilityScore}/100</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSlugInput('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={savePageMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {savePageMutation.isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

