import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  isRecurring: boolean;
  recurrenceType: string | null;
  recurrenceValue: number | null;
  scheduledAt: string | null;
  scheduledChannels?: string[];
  stats?: {
    total: number;
    sent: number;
  };
  _count: {
    contacts: number;
  };
}

export default function Automations() {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [scheduleConfig, setScheduleConfig] = useState({
    channels: [] as string[],
    time: '09:00',
    onlyNewContacts: false,
  });

  // Buscar campanhas
  const { data: campaigns } = useQuery<Campaign[]>('campaigns', async () => {
    const res = await api.get('/campaigns');
    return res.data.data;
  });

  // Buscar automações ativas
  const { data: activeAutomations } = useQuery<Campaign[]>(
    'active-automations',
    async () => {
      const res = await api.get('/automation/active');
      return res.data.data;
    }
  );

  // Agendar automação
  const scheduleMutation = useMutation(
    async (data: { campaignId: string; channels: string[]; time: string; onlyNewContacts: boolean }) => {
      const res = await api.post('/automation/schedule-daily', data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Automação agendada com sucesso!');
        queryClient.invalidateQueries('active-automations');
        queryClient.invalidateQueries('campaigns');
        setSelectedCampaign('');
        setScheduleConfig({ channels: [], time: '09:00', onlyNewContacts: false });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao agendar automação');
      },
    }
  );

  // Cancelar automação
  const cancelMutation = useMutation(
    async (campaignId: string) => {
      const res = await api.post(`/automation/${campaignId}/cancel`);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Automação cancelada!');
        queryClient.invalidateQueries('active-automations');
        queryClient.invalidateQueries('campaigns');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao cancelar automação');
      },
    }
  );

  // Disparar agora
  const dispatchMutation = useMutation(
    async (data: { campaignId: string; channels: string[] }) => {
      const res = await api.post('/automation/dispatch-now', data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Disparo executado com sucesso!');
        queryClient.invalidateQueries('campaigns');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao disparar');
      },
    }
  );

  const handleSchedule = () => {
    if (!selectedCampaign) {
      toast.error('Selecione uma campanha');
      return;
    }
    if (scheduleConfig.channels.length === 0) {
      toast.error('Selecione pelo menos um canal');
      return;
    }

    scheduleMutation.mutate({
      campaignId: selectedCampaign,
      channels: scheduleConfig.channels,
      time: scheduleConfig.time,
      onlyNewContacts: scheduleConfig.onlyNewContacts,
    });
  };

  const handleChannelToggle = (channel: string) => {
    setScheduleConfig((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const getRecurrenceInfo = (campaign: Campaign) => {
    if (!campaign.isRecurring) return null;
    
    if (campaign.recurrenceType === 'daily') {
      const hour = campaign.recurrenceValue || 9;
      return `Diário às ${hour}:00`;
    }
    if (campaign.recurrenceType === 'weekly') {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const day = campaign.recurrenceValue || 1;
      return `Semanal - ${days[day]}`;
    }
    if (campaign.recurrenceType === 'monthly') {
      return `Mensal - dia ${campaign.recurrenceValue || 1}`;
    }
    return 'Recorrente';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">⚙️ Automações e Disparos Diários</h1>

        {/* Configurar Nova Automação */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Criar Nova Automação</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Campanha *
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione uma campanha...</option>
                {campaigns?.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} ({campaign.type}) - {campaign._count?.contacts || 0} contatos
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canais de Disparo *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['email', 'whatsapp', 'instagram', 'facebook', 'linkedin'].map((channel) => (
                  <label
                    key={channel}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                      scheduleConfig.channels.includes(channel)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={scheduleConfig.channels.includes(channel)}
                      onChange={() => handleChannelToggle(channel)}
                      className="mr-2"
                    />
                    <span className="capitalize">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário do Disparo *
                </label>
                <input
                  type="time"
                  value={scheduleConfig.time}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center mt-7">
                  <input
                    type="checkbox"
                    checked={scheduleConfig.onlyNewContacts}
                    onChange={(e) =>
                      setScheduleConfig({ ...scheduleConfig, onlyNewContacts: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Disparar apenas para contatos novos (adicionados hoje)
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSchedule}
              disabled={scheduleMutation.isLoading || !selectedCampaign || scheduleConfig.channels.length === 0}
              className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scheduleMutation.isLoading ? 'Agendando...' : '✅ Agendar Disparo Diário'}
            </button>
          </div>
        </div>

        {/* Automações Ativas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Automações Ativas</h2>

          {activeAutomations && activeAutomations.length > 0 ? (
            <div className="space-y-4">
              {activeAutomations.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Tipo:</span> {campaign.type}
                        </p>
                        <p>
                          <span className="font-medium">Recorrência:</span>{' '}
                          {getRecurrenceInfo(campaign) || 'Não configurado'}
                        </p>
                        {campaign.scheduledChannels && campaign.scheduledChannels.length > 0 && (
                          <p>
                            <span className="font-medium">Canais:</span>{' '}
                            <span className="inline-flex gap-1 flex-wrap">
                              {campaign.scheduledChannels.map((channel) => (
                                <span
                                  key={channel}
                                  className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs capitalize"
                                >
                                  {channel}
                                </span>
                              ))}
                            </span>
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Contatos:</span> {campaign._count?.contacts || 0}
                        </p>
                        {campaign.stats && (
                          <p>
                            <span className="font-medium">Enviados:</span> {campaign.stats.sent || 0} /{' '}
                            {campaign.stats.total || 0}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Status:</span>{' '}
                          <span
                            className={`font-semibold ${
                              campaign.status === 'scheduled'
                                ? 'text-green-600'
                                : campaign.status === 'running'
                                ? 'text-blue-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {campaign.status === 'scheduled' ? '✓ Agendada' : campaign.status === 'running' ? '▶ Em execução' : campaign.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          const channels = campaign.scheduledChannels && campaign.scheduledChannels.length > 0
                            ? campaign.scheduledChannels
                            : ['email', 'whatsapp'];
                          dispatchMutation.mutate({
                            campaignId: campaign.id,
                            channels,
                          });
                        }}
                        disabled={dispatchMutation.isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
                        title="Executar disparo imediatamente"
                      >
                        {dispatchMutation.isLoading ? '⏳ Disparando...' : '▶️ Disparar Agora'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja cancelar esta automação?')) {
                            cancelMutation.mutate(campaign.id);
                          }
                        }}
                        disabled={cancelMutation.isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm transition-colors"
                        title="Cancelar automação agendada"
                      >
                        {cancelMutation.isLoading ? '⏳ Cancelando...' : '⏹️ Cancelar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma automação ativa no momento.</p>
              <p className="text-sm mt-2">Configure uma automação acima para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



