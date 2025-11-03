import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  createdAt: string;
  scheduledAt: string | null;
  isRecurring: boolean;
  recurrenceType: string | null;
  stats?: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    openRate: number;
    clickRate: number;
  };
  _count?: {
    contacts: number;
  };
}

export default function Campaigns() {
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [campaignType, setCampaignType] = useState('email');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery('campaigns', async () => {
    const res = await api.get('/campaigns');
    return res.data.data as Campaign[];
  });

  // Filtrar campanhas
  const filteredCampaigns = campaigns?.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      running: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      email: '📧',
      whatsapp: '💬',
      instagram: '📷',
      facebook: '👥',
      linkedin: '💼',
    };
    return icons[type] || '📢';
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não agendado';
    return new Date(date).toLocaleString('pt-BR');
  };

  const { data: contacts } = useQuery('contacts', async () => {
    const res = await api.get('/contacts?limit=10000');
    return res.data.data;
  });

  const { data: templates } = useQuery('templates', async () => {
    const res = await api.get('/templates');
    return res.data.data;
  });

  const createCampaign = useMutation(
    async (data: any) => {
      const res = await api.post('/campaigns', data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Campanha criada com sucesso!');
        queryClient.invalidateQueries('campaigns');
        setShowModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao criar campanha');
      },
    }
  );

  const executeCampaign = useMutation(
    async (id: string) => {
      const res = await api.post(`/campaigns/${id}/execute`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        const message = data.message || 'Campanha executada com sucesso!';
        if (data.data?.failed > 0) {
          toast.error(`${data.data.success} enviados, ${data.data.failed} falhas. ${data.data.failed > 0 ? 'Verifique configuração SMTP!' : ''}`, { duration: 8000 });
        } else {
          toast.success(message);
        }
        queryClient.invalidateQueries('campaigns');
      },
      onError: (error: any) => {
        const errorMsg = error.response?.data?.error || 'Erro ao executar campanha';
        
        // Mensagens mais claras sobre SMTP
        if (errorMsg.includes('SMTP não configurado')) {
          toast.error(
            '⚠️ SMTP não configurado! Configure no arquivo .env (veja COMO-CONFIGURAR-SMTP.md)', 
            { duration: 10000 }
          );
        } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('Invalid login')) {
          toast.error('❌ Erro de autenticação SMTP. Verifique usuário/senha no .env', { duration: 8000 });
        } else if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('timeout')) {
          toast.error('❌ Erro de conexão SMTP. Verifique SMTP_HOST e SMTP_PORT', { duration: 8000 });
        } else {
          toast.error(errorMsg, { duration: 8000 });
        }
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedContacts = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="contacts"]:checked')
    ).map((input) => input.value);

    if (selectedContacts.length === 0) {
      toast.error('Selecione pelo menos um contato!');
      return;
    }

    createCampaign.mutate({
      name: formData.get('name'),
      type: formData.get('type'),
      template: formData.get('template'),
      subject: formData.get('subject') || null,
      contactIds: selectedContacts,
    });
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  const scheduleCampaign = useMutation(
    async (data: { campaignId: string; scheduledAt: string; isRecurring?: boolean; recurrenceType?: string }) => {
      const res = await api.post(`/campaigns/${data.campaignId}/schedule`, data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Campanha agendada com sucesso!');
        queryClient.invalidateQueries('campaigns');
        setShowScheduleModal(false);
        setSelectedCampaign(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao agendar campanha');
      },
    }
  );

  const deleteCampaign = useMutation(
    async (id: string) => {
      await api.delete(`/campaigns/${id}`);
    },
    {
      onSuccess: (_, id) => {
        toast.success('Campanha deletada com sucesso!');
        queryClient.invalidateQueries('campaigns');
        setSelectedCampaigns((prev) => prev.filter((cid) => cid !== id));
      },
      onError: () => {
        toast.error('Erro ao deletar campanha');
      },
    }
  );

  const updateCampaign = useMutation(
    async (data: { id: string; name: string; description: string; template: string; subject?: string }) => {
      const res = await api.put(`/campaigns/${data.id}`, data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Campanha atualizada com sucesso!');
        queryClient.invalidateQueries('campaigns');
        setShowEditModal(false);
        setSelectedCampaign(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao atualizar campanha');
      },
    }
  );

  const deleteMultipleCampaigns = useMutation(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/campaigns/${id}`)));
    },
    {
      onSuccess: () => {
        toast.success(`${selectedCampaigns.length} campanha(s) deletada(s)!`);
        queryClient.invalidateQueries('campaigns');
        setSelectedCampaigns([]);
      },
      onError: () => {
        toast.error('Erro ao deletar campanhas');
      },
    }
  );

  const toggleSelectCampaign = (campaignId: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns?.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns?.map((c) => c.id) || []);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
        <h2 className="text-3xl font-bold text-gray-900">Campanhas</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie suas campanhas de marketing
            </p>
          </div>
        <button
          onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 shadow-md transition-colors"
        >
          + Nova Campanha
        </button>
      </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          {selectedCampaigns.length > 0 && (
            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                {selectedCampaigns.length} campanha(s) selecionada(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja deletar ${selectedCampaigns.length} campanha(s)?`)) {
                      deleteMultipleCampaigns.mutate(selectedCampaigns);
                    }
                  }}
                  disabled={deleteMultipleCampaigns.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                >
                  🗑️ Deletar Selecionadas
                </button>
                <button
                  onClick={() => setSelectedCampaigns([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  Limpar Seleção
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos</option>
                <option value="draft">Rascunho</option>
                <option value="scheduled">Agendada</option>
                <option value="running">Em Execução</option>
                <option value="completed">Concluída</option>
                <option value="failed">Falhou</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Campanhas */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Carregando campanhas...</div>
          </div>
        ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                <div>
            {/* Selecionar Todas */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700 cursor-pointer">
                Selecionar todas ({filteredCampaigns.length})
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => {
                const statusColors: Record<string, string> = {
                  draft: 'from-gray-500 to-gray-600',
                  scheduled: 'from-blue-500 to-blue-600',
                  running: 'from-green-500 to-green-600',
                  completed: 'from-purple-500 to-purple-600',
                  failed: 'from-red-500 to-red-600',
                };

                return (
                <div
                  key={campaign.id}
                  className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all ${
                    selectedCampaigns.includes(campaign.id) ? 'ring-2 ring-indigo-500 border-indigo-500' : ''
                  }`}
                >
                  {/* Header do Widget */}
                  <div className={`bg-gradient-to-r ${statusColors[campaign.status] || 'from-gray-500 to-gray-600'} px-6 py-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                          <h3 className="text-lg font-bold text-white truncate flex-1">
                    {campaign.name}
                  </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium text-white">
                            {campaign.status === 'draft' && '📝 Rascunho'}
                            {campaign.status === 'scheduled' && '📅 Agendada'}
                            {campaign.status === 'running' && '▶️ Em Execução'}
                            {campaign.status === 'completed' && '✅ Concluída'}
                            {campaign.status === 'failed' && '❌ Falhou'}
                          </span>
                          {campaign._count && (
                            <span className="bg-white/10 px-2 py-1 rounded text-xs text-white">
                              {campaign._count.contacts || 0} contatos
                            </span>
                          )}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={() => toggleSelectCampaign(campaign.id)}
                        className="mt-1 w-5 h-5 text-indigo-600 border-2 border-white rounded cursor-pointer bg-white/20"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Conteúdo do Widget */}
                  <div className="p-6">
                    {campaign.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 bg-gray-50 p-3 rounded-lg">
                        {campaign.description}
                      </p>
                    )}

                    {/* Estatísticas em Grid */}
                  {campaign.stats && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <div className="text-xs text-gray-600 mb-1">Total</div>
                            <div className="text-xl font-bold text-blue-600">{campaign.stats.total}</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                            <div className="text-xs text-gray-600 mb-1">Enviados</div>
                            <div className="text-xl font-bold text-green-600">{campaign.stats.sent}</div>
                          </div>
                          {campaign.stats.opened !== undefined && (
                            <>
                              <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
                                <div className="text-xs text-gray-600 mb-1">Abertos</div>
                                <div className="text-xl font-bold text-indigo-600">{campaign.stats.opened}</div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                                <div className="text-xs text-gray-600 mb-1">Cliques</div>
                                <div className="text-xl font-bold text-purple-600">{campaign.stats.clicked}</div>
                              </div>
                            </>
                          )}
                        </div>
                        {campaign.stats.openRate !== undefined && campaign.stats.openRate > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-600">Taxa de Abertura</span>
                              <span className="text-sm font-bold text-blue-600">{campaign.stats.openRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all" 
                                style={{ width: `${campaign.stats.openRate}%` }}
                              ></div>
                            </div>
                            {campaign.stats.clickRate !== undefined && campaign.stats.clickRate > 0 && (
                              <>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs font-medium text-gray-600">Taxa de Cliques</span>
                                  <span className="text-sm font-bold text-purple-600">{campaign.stats.clickRate.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all" 
                                    style={{ width: `${campaign.stats.clickRate}%` }}
                                  ></div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Info de contatos se não tiver stats */}
                    {!campaign.stats && campaign._count && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <div className="text-sm text-gray-600">
                          📊 <span className="font-semibold">{campaign._count.contacts || 0}</span> contato(s) vinculado(s)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer do Widget - Ações */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowDetailsModal(true);
                        }}
                        className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 text-sm transition-colors border border-gray-300 font-medium"
                        title="Ver detalhes"
                      >
                        👁️ Detalhes
                      </button>
                  {(campaign.status === 'draft' || campaign.status === 'failed') && (
                    <>
                      <button
                        onClick={async () => {
                          // Buscar dados completos da campanha antes de editar
                          try {
                            const res = await api.get(`/campaigns/${campaign.id}`);
                            setSelectedCampaign(res.data.data);
                            setShowEditModal(true);
                          } catch (error) {
                            toast.error('Erro ao carregar dados da campanha');
                          }
                        }}
                        className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm transition-colors font-medium shadow-sm"
                        title="Editar campanha"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => executeCampaign.mutate(campaign.id)}
                        disabled={executeCampaign.isLoading}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors disabled:opacity-50 font-medium shadow-sm"
                        title="Executar campanha"
                      >
                        ▶️ Executar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowScheduleModal(true);
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors font-medium shadow-sm"
                        title="Agendar campanha"
                      >
                        📅 Agendar
                      </button>
                    </>
                  )}
                  {campaign.status === 'scheduled' && (
                    <>
                      <button
                        onClick={async () => {
                          // Buscar dados completos da campanha antes de editar
                          try {
                            const res = await api.get(`/campaigns/${campaign.id}`);
                            setSelectedCampaign(res.data.data);
                            setShowEditModal(true);
                          } catch (error) {
                            toast.error('Erro ao carregar dados da campanha');
                          }
                        }}
                        className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm transition-colors font-medium shadow-sm"
                        title="Editar campanha"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Cancelar agendamento desta campanha?')) {
                            api.post(`/campaigns/${campaign.id}/cancel-schedule`).then(() => {
                              toast.success('Agendamento cancelado!');
                              queryClient.invalidateQueries('campaigns');
                            });
                          }
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition-colors font-medium shadow-sm"
                        title="Cancelar agendamento"
                      >
                        ⏹️ Cancelar
                      </button>
                    </>
                  )}
                  {campaign.status === 'completed' && (
                    <button
                      onClick={async () => {
                        // Buscar dados completos da campanha antes de editar
                        try {
                          const res = await api.get(`/campaigns/${campaign.id}`);
                          setSelectedCampaign(res.data.data);
                          setShowEditModal(true);
                        } catch (error) {
                          toast.error('Erro ao carregar dados da campanha');
                        }
                      }}
                      className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm transition-colors font-medium shadow-sm"
                      title="Editar campanha"
                    >
                      ✏️ Editar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja deletar a campanha "${campaign.name}"?`)) {
                        deleteCampaign.mutate(campaign.id);
                      }
                    }}
                    disabled={deleteCampaign.isLoading}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition-colors disabled:opacity-50 font-medium shadow-sm"
                    title="Deletar campanha"
                  >
                    🗑️ Deletar
                  </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">
              {(searchTerm || filterStatus !== 'all' || filterType !== 'all') 
                ? 'Nenhuma campanha encontrada com esses filtros'
                : 'Nenhuma campanha criada ainda'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Criar Primeira Campanha
            </button>
              </div>
        )}
      </div>

      {/* Modais - Fora do container principal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5">
              <h3 className="text-lg font-bold text-gray-900">
                Nova Campanha
              </h3>
            </div>
            <div className="p-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  name="name"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ex: Promoção de Verão 2025"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Descreva o objetivo desta campanha..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  name="type"
                  required
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              {(campaignType === 'instagram' || campaignType === 'facebook') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem {campaignType === 'instagram' ? '*' : '(opcional)'}
                  </label>
                  <input
                    name="mediaUrl"
                    type="url"
                    required={campaignType === 'instagram'}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {campaignType === 'instagram' 
                      ? 'Instagram requer uma imagem para posts com foto.'
                      : 'Para Facebook, a imagem é opcional mas recomendada.'}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template *
                </label>
                {templates && Array.isArray(templates) && templates.length > 0 && (
                  <div className="mb-2">
                    <select
                      onChange={(e) => {
                        const selected = templates.find((t: any) => t.id === e.target.value);
                        if (selected) {
                          const textarea = document.querySelector('textarea[name="template"]') as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.value = selected.body || '';
                            // Se for email, também preencher o assunto
                            if (selected.subject && campaignType === 'email') {
                              const subjectInput = document.querySelector('input[name="subject"]') as HTMLInputElement;
                              if (subjectInput) {
                                subjectInput.value = selected.subject;
                              }
                            }
                          }
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                    >
                      <option value="">-- Selecionar template criado --</option>
                      {templates
                        .filter((t: any) => !campaignType || t.type === campaignType || campaignType === 'email')
                        .map((template: any) => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.type})
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mb-2">Ou digite manualmente abaixo</p>
                  </div>
                )}
                <textarea
                  name="template"
                  required
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  placeholder="Olá {{nome}}, temos uma oferta especial para você!&#10;&#10;Use {{nome}} para substituir pelo nome do contato."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Para HTML: use tags como &lt;h1&gt;, &lt;p&gt;, &lt;a&gt;, etc.
                </p>
              </div>

              {campaignType === 'email' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto do Email *
                  </label>
                  <input
                    name="subject"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Assunto do email"
                  />
                </div>
              )}

              {/* Seção de Seleção de Contatos - DESTACADA */}
              <div className="mb-4 border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👥</span>
                  <label className="block text-sm font-semibold text-gray-900">
                    📌 Selecionar Contatos para a Campanha *
                </label>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Marque abaixo os contatos que vão receber esta campanha. Apenas contatos com {campaignType === 'email' ? 'email' : campaignType === 'whatsapp' ? 'telefone' : 'contato'} válido podem ser selecionados.
                </p>
                {contacts && Array.isArray(contacts) && contacts.length > 0 && (
                  <div className="mb-3 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        document.querySelectorAll<HTMLInputElement>('input[name="contacts"]').forEach((cb) => {
                          if (!cb.disabled) cb.checked = true;
                        });
                      }}
                      className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 font-medium"
                    >
                      ✅ Selecionar Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        document.querySelectorAll<HTMLInputElement>('input[name="contacts"]').forEach((cb) => {
                          cb.checked = false;
                        });
                      }}
                      className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 font-medium"
                    >
                      ❌ Desmarcar Todos
                    </button>
                    <div className="flex-1 text-right text-sm text-gray-600 pt-1">
                      <span className="font-semibold">
                        {contacts.filter((c: any) => {
                          if (campaignType === 'email') {
                            return typeof c.email === 'string' && c.email.trim() !== '';
                          } else if (campaignType === 'whatsapp') {
                            return typeof c.phone === 'string' && c.phone.trim() !== '';
                          }
                          return true;
                        }).length}
                      </span> contato(s) disponível(is)
                    </div>
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-md p-3 bg-white">
                  {contacts && Array.isArray(contacts) && contacts.length > 0 ? (
                    contacts.map((contact: any) => {
                      const contactId = contact.id || String(contact);
                      const contactName = typeof contact.name === 'string' ? contact.name : 'Sem nome';
                      
                      const hasEmail = typeof contact.email === 'string' && contact.email.trim() !== '';
                      const hasPhone = typeof contact.phone === 'string' && contact.phone.trim() !== '';
                      
                      return (
                        <label 
                          key={contactId} 
                          className={`flex items-center mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded border ${
                            campaignType === 'email' && !hasEmail ? 'opacity-50 bg-gray-100' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="contacts"
                            value={contactId}
                            disabled={campaignType === 'email' && !hasEmail}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{contactName}</span>
                            <div className="text-xs text-gray-500">
                              {hasEmail && <span>📧 {contact.email}</span>}
                              {hasEmail && hasPhone && <span> | </span>}
                              {hasPhone && <span>📱 {contact.phone}</span>}
                              {!hasEmail && !hasPhone && <span className="text-red-500">Sem email/telefone</span>}
                            </div>
                            {campaignType === 'email' && !hasEmail && (
                              <span className="text-xs text-red-500">⚠️ Sem email válido</span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-2">
                        📭 Nenhum contato cadastrado ainda
                      </p>
                      <p className="text-xs text-gray-400">
                        Vá para a página de <strong>Contatos</strong> e importe ou cadastre contatos primeiro.
                      </p>
                    </div>
                  )}
                </div>
                {contacts && Array.isArray(contacts) && contacts.length > 0 && (
                  <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border">
                    💡 <strong>Dica:</strong> Você pode selecionar todos os contatos de uma vez ou escolher apenas alguns específicos.
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Criar
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Detalhes da Campanha
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCampaign(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedCampaign.name}</h4>
                  {selectedCampaign.description && (
                    <p className="text-gray-600">{selectedCampaign.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Tipo:</span>
                    <p className="font-medium">{getTypeIcon(selectedCampaign.type)} {selectedCampaign.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <p className={`font-medium ${getStatusColor(selectedCampaign.status)} px-2 py-1 rounded-full inline-block`}>
                      {selectedCampaign.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Criada em:</span>
                    <p className="font-medium">{formatDate(selectedCampaign.createdAt)}</p>
                  </div>
                  {selectedCampaign.scheduledAt && (
                    <div>
                      <span className="text-sm text-gray-500">Agendada para:</span>
                      <p className="font-medium">{formatDate(selectedCampaign.scheduledAt)}</p>
                    </div>
                  )}
                </div>

                {selectedCampaign.stats && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold mb-3">Estatísticas</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-lg font-bold">{selectedCampaign.stats.total}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Enviados</div>
                        <div className="text-lg font-bold text-green-600">{selectedCampaign.stats.sent}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Falhas</div>
                        <div className="text-lg font-bold text-red-600">{selectedCampaign.stats.failed}</div>
                      </div>
                      {selectedCampaign.stats.opened !== undefined && (
                        <>
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-xs text-gray-500">Abertos</div>
                            <div className="text-lg font-bold text-blue-600">{selectedCampaign.stats.opened}</div>
                          </div>
                          <div className="bg-indigo-50 p-3 rounded">
                            <div className="text-xs text-gray-500">Cliques</div>
                            <div className="text-lg font-bold text-indigo-600">{selectedCampaign.stats.clicked}</div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <div className="text-xs text-gray-500">Taxa Abertura</div>
                            <div className="text-lg font-bold text-purple-600">
                              {selectedCampaign.stats.openRate?.toFixed(1)}%
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedCampaign(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {showScheduleModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Agendar Campanha: {selectedCampaign.name}
              </h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedCampaign(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const scheduledAt = formData.get('scheduledAt') as string;
                  const isRecurring = formData.get('isRecurring') === 'on';
                  const recurrenceType = formData.get('recurrenceType') as string;

                  if (!scheduledAt && !isRecurring) {
                    toast.error('Selecione uma data ou marque como recorrente');
                    return;
                  }

                  scheduleCampaign.mutate({
                    campaignId: selectedCampaign.id,
                    scheduledAt: scheduledAt || new Date().toISOString(),
                    isRecurring,
                    recurrenceType: isRecurring ? recurrenceType : undefined,
                  });
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora do Disparo
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      className="mr-2"
                      onChange={(e) => {
                        const recurrenceDiv = document.getElementById('recurrence-options');
                        if (recurrenceDiv) {
                          recurrenceDiv.style.display = e.target.checked ? 'block' : 'none';
                        }
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Campanha Recorrente
                    </span>
                  </label>
                </div>

                <div id="recurrence-options" className="mb-4" style={{ display: 'none' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Recorrência
                  </label>
                  <select
                    name="recurrenceType"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setSelectedCampaign(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleCampaign.isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {scheduleCampaign.isLoading ? 'Agendando...' : 'Agendar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Editar Campanha: {selectedCampaign.name}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCampaign(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateCampaign.mutate({
                    id: selectedCampaign.id,
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    template: formData.get('template') as string,
                    subject: formData.get('subject') as string || undefined,
                  });
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={selectedCampaign.name}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={selectedCampaign.description || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                {selectedCampaign.type === 'email' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assunto do Email *
                    </label>
                    <input
                      name="subject"
                      required
                      defaultValue={(selectedCampaign as any).subject || ''}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template *
                  </label>
                  <textarea
                    name="template"
                    required
                    rows={10}
                    defaultValue={(selectedCampaign as any).template || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                    placeholder="Digite o template da campanha..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{{'}nome{'}}'} para personalizar com o nome do contato
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Atenção:</strong> Alterar o template não afetará campanhas já enviadas. 
                    Apenas campanhas em rascunho ou futuras serão atualizadas.
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCampaign(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateCampaign.isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updateCampaign.isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

