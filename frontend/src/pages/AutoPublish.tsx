import { useState } from 'react';
import { useMutation } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

interface PublishResult {
  success: boolean;
  seoPage?: {
    id: string;
    slug: string;
    url: string;
  };
  campaign?: {
    id: string;
    name: string;
  };
  channels: {
    [key: string]: {
      success: boolean;
      sent?: number;
      failed?: number;
      message?: string;
    };
  };
  summary: {
    totalChannels: number;
    successfulChannels: number;
    totalSent: number;
  };
}

export default function AutoPublish() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [contentType, setContentType] = useState<'article' | 'landing' | 'blog'>('article');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['site', 'email', 'whatsapp']);
  const [saveToSite, setSaveToSite] = useState(true);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  const channels = [
    { id: 'site', name: '🌐 Site (SEO)', description: 'Publica página otimizada no site' },
    { id: 'email', name: '📧 Email', description: 'Envia para todos os contatos' },
    { id: 'whatsapp', name: '💬 WhatsApp', description: 'Envia mensagens via WhatsApp' },
    { id: 'instagram', name: '📷 Instagram', description: 'Publica post no Instagram' },
    { id: 'facebook', name: '👥 Facebook', description: 'Publica post no Facebook' },
    { id: 'linkedin', name: '💼 LinkedIn', description: 'Publica post no LinkedIn' },
    { id: 'telegram', name: '✈️ Telegram', description: 'Envia para canal/chat (em breve)' },
  ];

  const publishMutation = useMutation(
    async () => {
      const keywordsArray = keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);

      const res = await api.post('/auto-publish/publish', {
        topic,
        keywords: keywordsArray.length > 0 ? keywordsArray : [topic],
        contentType,
        channels: selectedChannels,
        targetContacts: 'all',
        saveToSite,
      });

      return res.data.data;
    },
    {
      onSuccess: (data) => {
        setPublishResult(data);
        toast.success(
          `🚀 Publicação concluída! ${data.summary.successfulChannels}/${data.summary.totalChannels} canais com sucesso`
        );
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao publicar');
      },
    }
  );

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handlePublish = () => {
    if (!topic.trim()) {
      toast.error('Digite um tópico');
      return;
    }

    if (selectedChannels.length === 0) {
      toast.error('Selecione pelo menos um canal');
      return;
    }

    publishMutation.mutate();
  };

  const getChannelIcon = (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId);
    return channel?.name.split(' ')[0] || '📌';
  };

  const getChannelName = (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId);
    return channel?.name.replace(/^[^\s]+\s/, '') || channelId;
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🚀 Publicação Automática</h2>
          <p className="text-gray-600">
            Escolha as palavras-chave, selecione os canais e clique em PUBLICAR. O sistema faz tudo automaticamente!
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="space-y-6">
            {/* Tópico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Tópico/Assunto Principal:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Saúde Ocupacional, Exame Admissional, PCMAT..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este será o assunto principal do conteúdo gerado
              </p>
            </div>

            {/* Palavras-chave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔑 Palavras-chave (separadas por vírgula):
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ex: saúde ocupacional, medicina do trabalho, PCMAT, ASMT..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para usar o tópico como palavra-chave principal
              </p>
            </div>

            {/* Tipo de conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📄 Tipo de Conteúdo:
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'article' | 'landing' | 'blog')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="article">Artigo/Blog Post</option>
                <option value="landing">Landing Page</option>
                <option value="blog">Post de Blog</option>
              </select>
            </div>

            {/* Canais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📡 Selecionar Canais de Publicação:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedChannels.includes(channel.id)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(channel.id)}
                          onChange={() => toggleChannel(channel.id)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{channel.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{channel.description}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opções */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveToSite"
                  checked={saveToSite}
                  onChange={(e) => setSaveToSite(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="saveToSite" className="text-sm font-medium text-gray-700">
                  💾 Salvar página SEO no site
                </label>
              </div>
            </div>

            {/* Botão Publicar */}
            <button
              onClick={handlePublish}
              disabled={publishMutation.isLoading || !topic.trim() || selectedChannels.length === 0}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transform hover:scale-[1.02] transition-all"
            >
              {publishMutation.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Publicando...
                </span>
              ) : (
                '🚀 PUBLICAR TUDO AGORA!'
              )}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {publishResult && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Resultado da Publicação</h3>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {publishResult.summary.successfulChannels}/{publishResult.summary.totalChannels}
                </div>
                <div className="text-sm text-gray-600 mt-1">Canais com Sucesso</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{publishResult.summary.totalSent}</div>
                <div className="text-sm text-gray-600 mt-1">Total Enviados</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                {publishResult.seoPage && (
                  <>
                    <div className="text-sm font-semibold text-blue-600">Página Criada</div>
                    <div className="text-xs text-gray-600 mt-1 break-all">{publishResult.seoPage.url}</div>
                  </>
                )}
              </div>
            </div>

            {/* Detalhes por Canal */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Detalhes por Canal:</h4>
              <div className="space-y-2">
                {Object.entries(publishResult.channels).map(([channelId, result]) => (
                  <div
                    key={channelId}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getChannelIcon(channelId)}</span>
                        <span className="font-medium text-gray-900">{getChannelName(channelId)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {result.success ? (
                          <>
                            <span className="text-green-600 font-semibold">✓ Sucesso</span>
                            {result.sent !== undefined && (
                              <span className="text-sm text-gray-600">{result.sent} enviado(s)</span>
                            )}
                          </>
                        ) : (
                          <span className="text-red-600 font-semibold">✗ Falhou</span>
                        )}
                      </div>
                    </div>
                    {result.message && (
                      <div className="text-xs text-gray-600 mt-1 ml-7">{result.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Botão para ver campanha */}
            {publishResult.campaign && (
              <div className="mt-6 pt-4 border-t">
                <a
                  href={`/campaigns`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Ver campanha criada →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

