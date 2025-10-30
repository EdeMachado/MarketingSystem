import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import api from '../services/api'

interface Advertisement {
  id: string
  title: string
  brief?: string
  objective?: string
  targetAudience?: string
  budget?: number
  budgetSpent?: number
  content?: string
  mediaUrls?: string
  channel: string
  format?: string
  status: string
  stage: string
  needsApproval: boolean
  approvedAt?: string
  approvedBy?: string
  scheduledAt?: string
  scheduledChannel?: string
  publishedAt?: string
  publishedUrl?: string
  campaignId?: string
  assetId?: string
  approvals?: { id: string; reviewer: string; status: string; comment?: string; decidedAt?: string }[]
}

type Tab = 'planejamento' | 'criacao' | 'aprovacao' | 'agendamento' | 'publicacao'

export default function Advertisements() {
  const [selectedAd, setSelectedAd] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('planejamento')
  const [showModal, setShowModal] = useState(false)

  const { data: ads, refetch } = useQuery('advertisements', async () => {
    const r = await api.get('/advertisements')
    return r.data.data as Advertisement[]
  })

  const createAd = useMutation(async (data: Partial<Advertisement>) => {
    const r = await api.post('/advertisements', data)
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Anúncio criado'); refetch(); setShowModal(false) },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const updateAd = useMutation(async ({ id, data }: { id: string; data: Partial<Advertisement> }) => {
    const r = await api.put(`/advertisements/${id}`, data)
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Anúncio atualizado'); refetch() },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const nextStage = useMutation(async (id: string) => {
    const r = await api.post(`/advertisements/${id}/next-stage`)
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Estágio avançado'); refetch() },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const requestApproval = useMutation(async ({ id, reviewer }: { id: string; reviewer: string }) => {
    const r = await api.post(`/advertisements/${id}/request-approval`, { reviewer })
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Aprovação solicitada'); refetch(); setTab('aprovacao') },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const approve = useMutation(async ({ id, reviewer, status, comment }: { id: string; reviewer: string; status: string; comment?: string }) => {
    const r = await api.post(`/advertisements/${id}/approve`, { reviewer, status, comment })
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Aprovação registrada'); refetch() },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const schedule = useMutation(async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
    const r = await api.post(`/advertisements/${id}/schedule`, { scheduledAt })
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Agendamento definido'); refetch(); setTab('agendamento') },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const publish = useMutation(async ({ id, addToLibrary }: { id: string; addToLibrary?: boolean }) => {
    const r = await api.post(`/advertisements/${id}/publish`, { addToLibrary: addToLibrary !== false })
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Anúncio publicado!'); refetch(); setTab('publicacao') },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const currentAd = selectedAd ? ads?.find(a => a.id === selectedAd) : null

  const getStageLabel = (stage: string) => {
    return {
      planning: 'Planejamento',
      creation: 'Criação',
      approval: 'Aprovação',
      scheduling: 'Agendamento',
      publishing: 'Publicação'
    }[stage] || stage
  }

  const getStatusColor = (status: string) => {
    return {
      draft: 'bg-gray-100 text-gray-700',
      planning: 'bg-blue-100 text-blue-700',
      creation: 'bg-yellow-100 text-yellow-700',
      review: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      scheduled: 'bg-purple-100 text-purple-700',
      published: 'bg-indigo-100 text-indigo-700'
    }[status] || 'bg-gray-100 text-gray-700'
  }

  if (!selectedAd && ads && ads.length > 0) {
    setSelectedAd(ads[0].id)
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📢 Anúncios</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            + Novo Anúncio
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Lista de Anúncios */}
          <div className="col-span-1 bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Anúncios ({ads?.length || 0})</div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {(ads || []).map(ad => (
                <div
                  key={ad.id}
                  className={`p-3 rounded cursor-pointer border-2 ${selectedAd === ad.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setSelectedAd(ad.id)}
                >
                  <div className="font-medium text-sm">{ad.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{ad.channel}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ad.status)}`}>
                      {getStageLabel(ad.stage)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área de Trabalho */}
          {currentAd && (
            <div className="col-span-3 bg-white rounded shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{currentAd.title}</h2>
                  <div className="text-sm text-gray-600 mt-1">Canal: {currentAd.channel} • Formato: {currentAd.format || 'post'}</div>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${getStatusColor(currentAd.status)}`}>
                  {getStageLabel(currentAd.stage)}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b mb-4">
                {(['planejamento', 'criacao', 'aprovacao', 'agendamento', 'publicacao'] as Tab[]).map(t => (
                  <button
                    key={t}
                    className={`px-4 py-2 ${tab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
                    onClick={() => setTab(t)}
                  >
                    {t === 'planejamento' ? '📋 Planejamento' :
                     t === 'criacao' ? '✍️ Criação' :
                     t === 'aprovacao' ? '✅ Aprovação' :
                     t === 'agendamento' ? '📅 Agendamento' :
                     '🚀 Publicação'}
                  </button>
                ))}
              </div>

              {/* Planejamento */}
              {tab === 'planejamento' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Brief</label>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={4}
                      value={currentAd.brief || ''}
                      onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { brief: e.target.value } })}
                      placeholder="Descreva o objetivo e conceito do anúncio..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Objetivo</label>
                      <select
                        className="w-full border rounded p-2"
                        value={currentAd.objective || ''}
                        onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { objective: e.target.value } })}
                      >
                        <option value="">Selecione</option>
                        <option value="conversao">Conversão</option>
                        <option value="awareness">Conscientização</option>
                        <option value="engagement">Engajamento</option>
                        <option value="traffic">Tráfego</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Orçamento (R$)</label>
                      <input
                        type="number"
                        className="w-full border rounded p-2"
                        value={currentAd.budget || ''}
                        onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { budget: parseFloat(e.target.value) || 0 } })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Público-alvo</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={currentAd.targetAudience || ''}
                      onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { targetAudience: e.target.value } })}
                      placeholder="Ex: Homens 25-45, interessados em tecnologia"
                    />
                  </div>
                  <button
                    onClick={() => nextStage.mutate(currentAd.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    disabled={!currentAd.brief || !currentAd.objective}
                  >
                    ➡️ Ir para Criação
                  </button>
                </div>
              )}

              {/* Criação */}
              {tab === 'criacao' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Conteúdo/Texto</label>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={6}
                      value={currentAd.content || ''}
                      onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { content: e.target.value } })}
                      placeholder="Escreva o texto do anúncio..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URLs de Mídia (imagens/vídeos)</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      placeholder="Cole URLs separadas por vírgula"
                      onBlur={(e) => {
                        const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                        updateAd.mutate({ id: currentAd.id, data: { mediaUrls: urls } })
                      }}
                    />
                    {currentAd.mediaUrls && (
                      <div className="mt-2 text-xs text-gray-600">
                        {JSON.parse(currentAd.mediaUrls).map((url: string, i: number) => (
                          <div key={i} className="break-all">{url}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => nextStage.mutate(currentAd.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    disabled={!currentAd.content && !currentAd.mediaUrls}
                  >
                    ➡️ Solicitar Aprovação
                  </button>
                </div>
              )}

              {/* Aprovação */}
              {tab === 'aprovacao' && (
                <div className="space-y-4">
                  {currentAd.approvals && currentAd.approvals.length > 0 && (
                    <div className="space-y-3">
                      <div className="font-medium">Histórico de Aprovações</div>
                      {currentAd.approvals.map(apr => (
                        <div key={apr.id} className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{apr.reviewer}</div>
                              <div className="text-xs text-gray-600">{apr.decidedAt ? new Date(apr.decidedAt).toLocaleDateString() : 'Pendente'}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              apr.status === 'approved' ? 'bg-green-100 text-green-700' :
                              apr.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {apr.status === 'approved' ? 'Aprovado' : apr.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                            </span>
                          </div>
                          {apr.comment && <div className="text-sm mt-2 text-gray-700">{apr.comment}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {currentAd.stage === 'approval' && !currentAd.approvedAt && (
                    <div className="border rounded p-4">
                      <div className="font-medium mb-2">Solicitar Aprovação</div>
                      <input
                        type="text"
                        className="w-full border rounded p-2 mb-2"
                        placeholder="Nome do revisor"
                        id="reviewer-name"
                      />
                      <button
                        onClick={() => {
                          const reviewer = (document.getElementById('reviewer-name') as HTMLInputElement)?.value
                          if (reviewer) requestApproval.mutate({ id: currentAd.id, reviewer })
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                      >
                        Enviar para Aprovação
                      </button>
                    </div>
                  )}

                  {currentAd.approvedAt ? (
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <div className="font-medium text-green-800">✅ Aprovado por {currentAd.approvedBy}</div>
                      <div className="text-sm text-green-600 mt-1">
                        Em {new Date(currentAd.approvedAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => nextStage.mutate(currentAd.id)}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        ➡️ Ir para Agendamento
                      </button>
                    </div>
                  ) : (
                    currentAd.stage !== 'approval' && (
                      <div className="text-gray-500 text-center py-8">
                        Aprovação ainda não foi solicitada. Avance da etapa de Criação.
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Agendamento */}
              {tab === 'agendamento' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data e Hora de Publicação</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded p-2"
                      value={currentAd.scheduledAt ? new Date(currentAd.scheduledAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => schedule.mutate({ id: currentAd.id, scheduledAt: e.target.value })}
                    />
                  </div>
                  {currentAd.scheduledAt && (
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <div className="font-medium text-green-800">📅 Agendado para</div>
                      <div className="text-sm text-green-600 mt-1">
                        {new Date(currentAd.scheduledAt).toLocaleString('pt-BR')}
                      </div>
                      <button
                        onClick={() => nextStage.mutate(currentAd.id)}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        ➡️ Ir para Publicação
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Publicação */}
              {tab === 'publicacao' && (
                <div className="space-y-4">
                  {currentAd.publishedAt ? (
                    <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                      <div className="font-medium text-indigo-800">🚀 Publicado com sucesso!</div>
                      <div className="text-sm text-indigo-600 mt-1">
                        Em {new Date(currentAd.publishedAt).toLocaleString('pt-BR')}
                      </div>
                      {currentAd.publishedUrl && (
                        <div className="mt-2">
                          <a href={currentAd.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            Ver publicação →
                          </a>
                        </div>
                      )}
                      {currentAd.campaignId && (
                        <div className="mt-2 text-sm text-indigo-700">
                          Campanha criada: {currentAd.campaignId}
                        </div>
                      )}
                      {currentAd.assetId && (
                        <div className="mt-2 text-sm text-indigo-700">
                          ✅ Adicionado à biblioteca de ativos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            id="add-to-library"
                          />
                          <span className="text-sm">Adicionar à biblioteca de ativos após publicação</span>
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          const addToLibrary = (document.getElementById('add-to-library') as HTMLInputElement)?.checked
                          publish.mutate({ id: currentAd.id, addToLibrary })
                        }}
                        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                        disabled={currentAd.needsApproval && !currentAd.approvedAt}
                      >
                        🚀 Publicar Agora
                      </button>
                      {currentAd.needsApproval && !currentAd.approvedAt && (
                        <div className="mt-2 text-sm text-red-600">
                          Anúncio precisa ser aprovado antes de publicar
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal criar anúncio */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Novo Anúncio</h3>
              <CreateAdForm
                onSubmit={(data) => {
                  createAd.mutate(data)
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CreateAdForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ title: '', channel: '', format: 'post' })

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Canal</label>
        <select
          className="w-full border rounded p-2"
          value={form.channel}
          onChange={(e) => setForm({ ...form, channel: e.target.value })}
        >
          <option value="">Selecione</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
          <option value="google_ads">Google Ads</option>
          <option value="meta_ads">Meta Ads</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Formato</label>
        <select
          className="w-full border rounded p-2"
          value={form.format}
          onChange={(e) => setForm({ ...form, format: e.target.value })}
        >
          <option value="post">Post</option>
          <option value="story">Story</option>
          <option value="reel">Reel</option>
          <option value="carousel">Carrossel</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={() => onSubmit(form)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          disabled={!form.title || !form.channel}
        >
          Criar
        </button>
      </div>
    </div>
  )
}

