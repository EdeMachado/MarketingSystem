import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ChannelTab {
  id: string;
  name: string;
  icon: string;
  hasCosts: boolean;
}

const channels: ChannelTab[] = [
  { id: 'google-places', name: 'Google Places API', icon: '🔍', hasCosts: true },
  { id: 'email', name: 'Email (SMTP)', icon: '📧', hasCosts: true },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', hasCosts: true },
];

export default function ApiUsage() {
  const [activeTab, setActiveTab] = useState('google-places');
  const queryClient = useQueryClient();

  // Estatísticas do Google Places
  const { data: googlePlacesData, isLoading: loadingGooglePlaces } = useQuery(
    'api-usage-stats',
    async () => {
      const res = await api.get('/api-usage/stats');
      return res.data.data;
    },
    {
      refetchInterval: 30000,
    }
  );

  // Estatísticas dos canais (Email, WhatsApp, etc)
  const { data: channelStats, isLoading: loadingChannels } = useQuery(
    'channel-costs-stats',
    async () => {
      const res = await api.get('/channel-costs/stats');
      return res.data.data;
    },
    {
      refetchInterval: 30000,
    }
  );

  // Configuração de custos
  const { data: costConfig, isLoading: loadingConfig } = useQuery(
    'channel-costs-config',
    async () => {
      const res = await api.get('/channel-costs/config');
      return res.data.data;
    }
  );

  // Atualizar configuração
  const updateConfigMutation = useMutation(
    async (config: any) => {
      const res = await api.put('/channel-costs/config', config);
      return res.data.data;
    },
    {
      onSuccess: () => {
        toast.success('Configuração atualizada!');
        queryClient.invalidateQueries('channel-costs-config');
        queryClient.invalidateQueries('channel-costs-stats');
      },
      onError: () => {
        toast.error('Erro ao atualizar configuração');
      },
    }
  );

  const handleUpdateConfig = (channel: string, data: any) => {
    updateConfigMutation.mutate({ [channel]: data });
  };

  // Renderizar conteúdo baseado na aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'google-places':
        return <GooglePlacesTab data={googlePlacesData} isLoading={loadingGooglePlaces} />;
      case 'email':
        return (
          <EmailTab
            stats={channelStats?.email}
            config={costConfig?.email}
            onUpdateConfig={(data) => handleUpdateConfig('email', data)}
            isLoading={loadingChannels || loadingConfig}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppTab
            stats={channelStats?.whatsapp}
            config={costConfig?.whatsapp}
            onUpdateConfig={(data) => handleUpdateConfig('whatsapp', data)}
            isLoading={loadingChannels || loadingConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">💰 Controle de Custos</h2>
          <p className="text-gray-600">
            Monitore e controle os custos de todos os canais com limites ou custos
          </p>
        </div>

        {/* Layout com Menu Lateral */}
        <div className="flex gap-6">
          {/* Menu Lateral */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sticky top-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">Canais</h3>
              <nav className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveTab(channel.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === channel.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{channel.icon}</span>
                    <span className="text-sm">{channel.name}</span>
                    {channel.hasCosts && (
                      <span className="ml-auto text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                        $
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 px-2">
                  💡 Canais gratuitos (Instagram, Facebook, LinkedIn, Telegram, SEO) não aparecem aqui pois não geram custos.
                </p>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1 min-w-0">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

// Componente: Google Places Tab
function GooglePlacesTab({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  const stats = data || {
    cost: 0,
    remainingCredits: 200,
    percentageUsed: 0,
    textSearches: 0,
    placeDetails: 0,
    totalSearches: 0,
  };

  const getStatusColor = () => {
    if (stats.percentageUsed >= 90) return 'text-red-600 bg-red-50';
    if (stats.percentageUsed >= 70) return 'text-orange-600 bg-orange-50';
    if (stats.percentageUsed >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getBarColor = () => {
    if (stats.percentageUsed >= 90) return 'bg-red-500';
    if (stats.percentageUsed >= 70) return 'bg-orange-500';
    if (stats.percentageUsed >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {stats.alerts && stats.alerts.length > 0 && (
        <div className="space-y-3">
          {stats.alerts.map((alert: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === 'danger'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{alert.type === 'danger' ? '🚨' : '⚠️'}</span>
                <p className="flex-1 font-medium">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Créditos Restantes</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className={`text-3xl font-bold ${stats.remainingCredits >= 50 ? 'text-green-600' : stats.remainingCredits >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
            ${stats.remainingCredits.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">de $200.00 grátis</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Custo Total</h3>
            <span className="text-2xl">💵</span>
          </div>
          <div className={`text-3xl font-bold ${stats.cost >= 190 ? 'text-red-600' : stats.cost >= 160 ? 'text-orange-600' : 'text-gray-900'}`}>
            ${stats.cost.toFixed(4)}
          </div>
          <div className="text-xs text-gray-500 mt-1">usado este mês</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Buscas</h3>
            <span className="text-2xl">🔍</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalSearches?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">neste mês</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Percentual Usado</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor().split(' ')[0]}`}>
            {stats.percentageUsed?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">dos créditos grátis</div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Uso dos Créditos Grátis</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {stats.percentageUsed >= 90 ? 'CRÍTICO' : stats.percentageUsed >= 70 ? 'ATENÇÃO' : 'SAUDÁVEL'}
          </span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-8 mb-4">
          <div
            className={`h-8 rounded-full transition-all duration-300 flex items-center justify-end pr-2 ${getBarColor()}`}
            style={{ width: `${Math.min(stats.percentageUsed || 0, 100)}%` }}
          >
            {stats.percentageUsed >= 10 && (
              <span className="text-xs font-semibold text-white">
                {stats.percentageUsed.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Usado:</span>
            <span className="ml-2 font-semibold text-gray-900">${stats.cost.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-gray-600">Restante:</span>
            <span className="ml-2 font-semibold text-green-600">${stats.remainingCredits.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Total:</span>
            <span className="ml-2 font-semibold text-gray-900">$200.00</span>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-gray-700">Créditos Grátis:</strong> $200 USD por mês
          </div>
          <div>
            <strong className="text-gray-700">Text Search:</strong> $0.005 por busca
          </div>
          <div>
            <strong className="text-gray-700">Place Details:</strong> $0.017 por busca
          </div>
          <div>
            <strong className="text-gray-700">Renovação:</strong> Automática no início de cada mês
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente: Email Tab
function EmailTab({
  stats,
  config,
  onUpdateConfig,
  isLoading,
}: {
  stats: any;
  config: any;
  onUpdateConfig: (data: any) => void;
  isLoading: boolean;
}) {
  const [limitPerDay, setLimitPerDay] = useState(config?.limitPerDay || 500);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  const emailStats = stats || {
    sent: 0,
    limit: 500,
    remaining: 500,
    percentageUsed: 0,
    resetAt: new Date().toISOString(),
  };

  const getStatusColor = () => {
    if (emailStats.percentageUsed >= 90) return 'text-red-600 bg-red-50';
    if (emailStats.percentageUsed >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getBarColor = () => {
    if (emailStats.percentageUsed >= 90) return 'bg-red-500';
    if (emailStats.percentageUsed >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const handleSave = () => {
    onUpdateConfig({ limitPerDay: parseInt(limitPerDay.toString()) });
  };

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Enviados Hoje</h3>
            <span className="text-2xl">📧</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{emailStats.sent || 0}</div>
          <div className="text-xs text-gray-500 mt-1">de {emailStats.limit} permitidos</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Restante</h3>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{emailStats.remaining || 0}</div>
          <div className="text-xs text-gray-500 mt-1">emails disponíveis</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Percentual</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor().split(' ')[0]}`}>
            {emailStats.percentageUsed?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">do limite diário</div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Limite Diário de Emails</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {emailStats.percentageUsed >= 90 ? 'CRÍTICO' : emailStats.percentageUsed >= 70 ? 'ATENÇÃO' : 'SAUDÁVEL'}
          </span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-8 mb-4">
          <div
            className={`h-8 rounded-full transition-all duration-300 flex items-center justify-end pr-2 ${getBarColor()}`}
            style={{ width: `${Math.min(emailStats.percentageUsed || 0, 100)}%` }}
          >
            {emailStats.percentageUsed >= 10 && (
              <span className="text-xs font-semibold text-white">
                {emailStats.percentageUsed.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Configuração */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuração</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite de Emails por Dia:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={limitPerDay}
                onChange={(e) => setLimitPerDay(parseInt(e.target.value))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                max="10000"
              />
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Salvar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gmail gratuito: 500 emails/dia. Contas empresariais podem ter limites maiores.
            </p>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informações</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Limite Gmail Gratuito:</strong> 500 emails por dia
          </p>
          <p>
            <strong>Reset:</strong> Automático à meia-noite (horário do servidor)
          </p>
          <p>
            <strong>Custo:</strong> ✅ Gratuito até o limite diário
          </p>
          <p>
            <strong>Alerta:</strong> Sistema notifica em 70% e 90% do limite
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente: WhatsApp Tab
function WhatsAppTab({
  stats,
  config,
  onUpdateConfig,
  isLoading,
}: {
  stats: any;
  config: any;
  onUpdateConfig: (data: any) => void;
  isLoading: boolean;
}) {
  const [costPerMessage, setCostPerMessage] = useState(config?.costPerMessage || 0.01);
  const [monthlyLimit, setMonthlyLimit] = useState(config?.monthlyLimit || 50);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  const whatsappStats = stats || {
    sent: 0,
    cost: 0,
    limit: 50,
    remaining: 50,
    percentageUsed: 0,
    costPerMessage: 0.01,
    resetAt: new Date().toISOString(),
  };

  const getStatusColor = () => {
    if (whatsappStats.percentageUsed >= 90) return 'text-red-600 bg-red-50';
    if (whatsappStats.percentageUsed >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getBarColor = () => {
    if (whatsappStats.percentageUsed >= 90) return 'bg-red-500';
    if (whatsappStats.percentageUsed >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const handleSave = () => {
    onUpdateConfig({
      costPerMessage: parseFloat(costPerMessage.toString()),
      monthlyLimit: parseFloat(monthlyLimit.toString()),
    });
  };

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Mensagens Enviadas</h3>
            <span className="text-2xl">💬</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{whatsappStats.sent || 0}</div>
          <div className="text-xs text-gray-500 mt-1">este mês</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Custo Total</h3>
            <span className="text-2xl">💵</span>
          </div>
          <div className={`text-3xl font-bold ${whatsappStats.cost >= whatsappStats.limit * 0.9 ? 'text-red-600' : whatsappStats.cost >= whatsappStats.limit * 0.7 ? 'text-orange-600' : 'text-gray-900'}`}>
            ${(whatsappStats.cost || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">de ${whatsappStats.limit}/mês</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Restante</h3>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            ${(whatsappStats.remaining || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">disponível</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Percentual</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor().split(' ')[0]}`}>
            {whatsappStats.percentageUsed?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">do limite mensal</div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Limite Mensal de WhatsApp</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {whatsappStats.percentageUsed >= 90 ? 'CRÍTICO' : whatsappStats.percentageUsed >= 70 ? 'ATENÇÃO' : 'SAUDÁVEL'}
          </span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-8 mb-4">
          <div
            className={`h-8 rounded-full transition-all duration-300 flex items-center justify-end pr-2 ${getBarColor()}`}
            style={{ width: `${Math.min(whatsappStats.percentageUsed || 0, 100)}%` }}
          >
            {whatsappStats.percentageUsed >= 10 && (
              <span className="text-xs font-semibold text-white">
                {whatsappStats.percentageUsed.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Gasto:</span>
            <span className="ml-2 font-semibold text-gray-900">${(whatsappStats.cost || 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Restante:</span>
            <span className="ml-2 font-semibold text-green-600">${(whatsappStats.remaining || 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Limite:</span>
            <span className="ml-2 font-semibold text-gray-900">${whatsappStats.limit.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Configuração */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuração de Custos</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custo por Mensagem (USD):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                value={costPerMessage}
                onChange={(e) => setCostPerMessage(parseFloat(e.target.value))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
                max="1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Exemplo: $0.01 = 1 centavo por mensagem. Verifique com seu provedor de API.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite Mensal Máximo (USD):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="1"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(parseFloat(e.target.value))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                max="10000"
              />
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Salvar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              O sistema vai alertar quando estiver próximo deste limite (70% e 90%).
            </p>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informações</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Custo:</strong> Variável conforme o provedor (Evolution API, Twilio, etc.)
          </p>
          <p>
            <strong>Reset:</strong> Automático no início de cada mês
          </p>
          <p>
            <strong>Alerta:</strong> Sistema notifica em 70% e 90% do limite mensal
          </p>
          <p>
            <strong>⚠️ Importante:</strong> Configure o custo por mensagem e limite mensal baseado no seu plano contratado.
          </p>
        </div>
      </div>
    </div>
  );
}
