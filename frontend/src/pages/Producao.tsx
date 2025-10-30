import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import api from '../services/api'

interface Advertisement {
  id: string
  company?: string
  title: string
  serviceId?: string
  brief?: string
  objective?: string
  targetAudience?: string
  budget?: number
  content?: string
  mediaUrls?: string
  channels?: string // JSON array string
  channel?: string // Compatibilidade
  format?: string
  status: string
  stage: string
  needsApproval: boolean
  approvedAt?: string
  approvedBy?: string
  scheduledAt?: string
  publishedAt?: string
  publishedUrl?: string
  campaignId?: string
  assetId?: string
  approvals?: { id: string; reviewer: string; status: string; comment?: string; decidedAt?: string }[]
}

interface Service {
  id: string
  name: string
  category: string
  description: string
  targetAudience: string
}

type Tab = 'planejamento' | 'criacao' | 'aprovacao' | 'agendamento' | 'publicacao'

export default function Producao() {
  const [selectedCompany, setSelectedCompany] = useState<'biomed' | 'advocacia'>('biomed')
  const [selectedAd, setSelectedAd] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('planejamento')
  const [showModal, setShowModal] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)

  const { data: ads, refetch } = useQuery(['advertisements', selectedCompany], async () => {
    const r = await api.get('/advertisements', { params: { company: selectedCompany } })
    return r.data.data as Advertisement[]
  })

  const { data: services } = useQuery(['services', selectedCompany], async () => {
    const r = await api.get(`/ai/services/${selectedCompany}`)
    return r.data.data as Service[]
  })

  const generateAI = useMutation(async ({ company, serviceId, objective, channel, channels, format }: any) => {
    const r = await api.post('/ai/generate', { company, serviceId, objective, channel, channels, format })
    return r.data.data
  }, {
    onSuccess: (data) => {
      toast.success('Conteúdo gerado pela IA!')
      return data
    },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro ao gerar conteúdo') }
  })

  const createAd = useMutation(async (data: Partial<Advertisement>) => {
    const r = await api.post('/advertisements', { ...data, company: selectedCompany })
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Produção criada'); refetch(); setShowModal(false) },
    onError: (e: any) => { 
      console.error('Erro ao criar:', e.response?.data)
      toast.error(e.response?.data?.message || 'Erro ao criar produção') 
    }
  })

  const updateAd = useMutation(async ({ id, data }: { id: string; data: Partial<Advertisement> }) => {
    const r = await api.put(`/advertisements/${id}`, data)
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Atualizado'); refetch() },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const nextStage = useMutation(async (id: string) => {
    const r = await api.post(`/advertisements/${id}/next-stage`)
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Estágio avançado'); refetch() },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const publish = useMutation(async ({ id, addToLibrary }: { id: string; addToLibrary?: boolean }) => {
    const r = await api.post(`/advertisements/${id}/publish`, { addToLibrary: addToLibrary !== false })
    return r.data.data as Advertisement
  }, {
    onSuccess: () => { toast.success('Publicado!'); refetch(); setTab('publicacao') },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const deleteAd = useMutation(async (id: string) => {
    const r = await api.delete(`/advertisements/${id}`)
    return r.data
  }, {
    onSuccess: () => { toast.success('Produção excluída'); refetch(); if (selectedAd) setSelectedAd(null) },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro ao excluir') }
  })

  const currentAd = selectedAd ? ads?.find(a => a.id === selectedAd) : null

  const handleAIGenerate = async () => {
    if (!currentAd) return
    setGeneratingAI(true)
    try {
      const { serviceId, objective, channels, channel, format } = currentAd as any
      const channelsArray = channels ? JSON.parse(channels) : (channel ? [channel] : [])
      if (!serviceId || !objective || channelsArray.length === 0) {
        toast.error('Complete o planejamento primeiro (serviço, objetivo, canais)')
        return
      }
      // Gerar conteúdo para todos os canais selecionados
      const response = await generateAI.mutateAsync({
        company: selectedCompany,
        serviceId,
        objective,
        channels: channelsArray,
        format
      })
      
      // Combinar conteúdo de todos os canais
      let combinedContent = ''
      for (const ch of channelsArray) {
        const channelContent = response[ch]
        if (!channelContent) continue
        
        if (channelContent.email) {
          combinedContent += `\n\n--- EMAIL ---\nAssunto: ${channelContent.email.subject?.[0] || 'Sem assunto'}\n\n${channelContent.email.body || ''}`
        } else if (channelContent.social) {
          combinedContent += `\n\n--- ${ch.toUpperCase()} ---\n${channelContent.social.caption?.[0] || ''}\n\nHashtags: ${channelContent.social.hashtags?.join(' ') || ''}`
        } else if (channelContent.ads) {
          combinedContent += `\n\n--- ${ch.toUpperCase()} ADS ---\nHeadline: ${channelContent.ads.headline?.[0] || ''}\n\n${channelContent.ads.description?.[0] || ''}`
        } else if (channelContent.whatsapp) {
          combinedContent += `\n\n--- WHATSAPP ---\n${channelContent.whatsapp.message || ''}`
        }
      }
      const finalContent = combinedContent.trim()
      
      // Preenche automaticamente o conteúdo combinado
      if (finalContent) {
        await updateAd.mutateAsync({ id: currentAd.id, data: { content: finalContent, mediaUrls: JSON.stringify([]) } })
        // Aguardar um pouco e atualizar os dados para mostrar o conteúdo
        await new Promise(resolve => setTimeout(resolve, 300))
        await refetch()
        // Se ainda estiver em planejamento, avança para criação automaticamente
        if (currentAd.stage === 'planning') {
          await nextStage.mutateAsync(currentAd.id)
          setTab('criacao')
        }
        toast.success('Conteúdo gerado e aplicado!')
      } else {
        toast.error('Não foi possível gerar conteúdo. Verifique os parâmetros.')
      }
    } catch (e: any) {
      console.error('Erro ao gerar conteúdo:', e)
      toast.error(e.response?.data?.message || e.message || 'Erro ao gerar conteúdo pela IA')
    } finally {
      setGeneratingAI(false)
    }
  }

  if (!selectedAd && ads && ads.length > 0) {
    setSelectedAd(ads[0].id)
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Seletor de Empresa */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">🎬 Produção</h1>
            <select
              className="px-4 py-2 border rounded text-lg font-medium"
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value as 'biomed' | 'advocacia')
                setSelectedAd(null)
                refetch()
              }}
            >
              <option value="biomed">🏥 Biomed</option>
              <option value="advocacia">⚖️ Advocacia</option>
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            + Nova Produção
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Lista */}
          <div className="col-span-1 bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Produções ({ads?.length || 0})</div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {(ads || []).map(ad => (
                <div
                  key={ad.id}
                  className={`p-3 rounded border-2 ${selectedAd === ad.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedAd(ad.id)}>
                      <div className="font-medium text-sm">{ad.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {(ad.channels ? JSON.parse(ad.channels) : (ad.channel ? [ad.channel] : [])).join(', ')}
                      </div>
                      <div className="text-xs mt-1 px-2 py-1 bg-gray-100 rounded inline-block">
                        {ad.stage === 'planning' ? '📋 Planejamento' :
                         ad.stage === 'creation' ? '✍️ Criação' :
                         ad.stage === 'approval' ? '✅ Aprovação' :
                         ad.stage === 'scheduling' ? '📅 Agendamento' :
                         '🚀 Publicação'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Deseja excluir esta produção?')) {
                          deleteAd.mutate(ad.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm px-2"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área de Trabalho */}
          {currentAd && (
            <div className="col-span-3 bg-white rounded shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{currentAd.title}</h2>
                {tab === 'criacao' && (
                  <button
                    onClick={handleAIGenerate}
                    disabled={generatingAI}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
                  >
                    {generatingAI ? '🤖 Gerando...' : '🤖 Gerar com IA'}
                  </button>
                )}
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

              {/* Planejamento com Catálogo */}
              {tab === 'planejamento' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Serviço*</label>
                    <select
                      className="w-full border rounded p-2"
                      value={(currentAd as any).serviceId || ''}
                      onChange={(e) => {
                        const service = services?.find(s => s.id === e.target.value)
                        updateAd.mutate({
                          id: currentAd.id,
                          data: {
                            serviceId: e.target.value || null,
                            brief: service?.description || '',
                            targetAudience: service?.targetAudience || '',
                            title: `${service?.name || 'Nova Produção'} - ${selectedCompany === 'biomed' ? 'Biomed' : 'Advocacia'}`
                          } as any
                        })
                      }}
                    >
                      <option value="">Selecione um serviço</option>
                      {services?.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Objetivo*</label>
                      <select
                        className="w-full border rounded p-2"
                        value={currentAd.objective || ''}
                        onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { objective: e.target.value } })}
                      >
                        <option value="">Selecione</option>
                        <option value="conversao">Conversão</option>
                        <option value="awareness">Conscientização</option>
                        <option value="engagement">Engajamento</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Canais* (múltipla escolha)</label>
                      <div className="grid grid-cols-2 gap-2 border rounded p-3">
                        {['email', 'instagram', 'facebook', 'linkedin', 'google_ads', 'meta_ads', 'whatsapp'].map(ch => {
                          const currentChannels = currentAd.channels ? JSON.parse(currentAd.channels) : (currentAd.channel ? [currentAd.channel] : [])
                          const isSelected = currentChannels.includes(ch)
                          return (
                            <label key={ch} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const current = currentAd.channels ? JSON.parse(currentAd.channels) : (currentAd.channel ? [currentAd.channel] : [])
                                  const updated = e.target.checked 
                                    ? [...current, ch]
                                    : current.filter((c: string) => c !== ch)
                                  updateAd.mutate({ id: currentAd.id, data: { channels: updated, channel: updated[0] || '' } })
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm capitalize">{ch === 'google_ads' ? 'Google Ads' : ch === 'meta_ads' ? 'Meta Ads' : ch}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brief</label>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={4}
                      value={currentAd.brief || ''}
                      onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { brief: e.target.value } })}
                      placeholder="Descreva o objetivo e conceito..."
                    />
                  </div>
                  <button
                    onClick={() => {
                      const missing = []
                      if (!currentAd.objective) missing.push('objetivo')
                      if (!currentAd.channels && !currentAd.channel) missing.push('canais')
                      if (!(currentAd as any).serviceId) missing.push('serviço')
                      if (missing.length > 0) {
                        toast.error(`Complete: ${missing.join(', ')}`)
                        return
                      }
                      nextStage.mutate(currentAd.id)
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!currentAd.objective || (!currentAd.channels && !currentAd.channel) || !(currentAd as any).serviceId}
                  >
                    ➡️ Ir para Criação
                  </button>
                  {(!currentAd.objective || (!currentAd.channels && !currentAd.channel) || !(currentAd as any).serviceId) && (
                    <div className="text-xs text-red-600 mt-2">
                      Complete: {[
                        !(currentAd as any).serviceId && 'Serviço',
                        !currentAd.objective && 'Objetivo',
                        (!currentAd.channels && !currentAd.channel) && 'Canais'
                      ].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Criação com IA */}
              {tab === 'criacao' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Conteúdo</label>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={12}
                      value={currentAd?.content || ''}
                      onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { content: e.target.value } })}
                      placeholder="O conteúdo será gerado automaticamente pela IA ao clicar em 'Gerar com IA'..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAIGenerate}
                      disabled={generatingAI || !currentAd || !(currentAd as any).serviceId}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingAI ? '🤖 Gerando...' : '🤖 Gerar com IA'}
                    </button>
                    <button
                      onClick={() => nextStage.mutate(currentAd.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!currentAd?.content}
                    >
                      ➡️ Solicitar Aprovação
                    </button>
                  </div>
                </div>
              )}

              {/* Outros tabs simplificados (mantendo funcionalidade básica) */}
              {tab === 'aprovacao' && (
                <div className="text-center py-8 text-gray-500">
                  Funcionalidade de aprovação em desenvolvimento...
                </div>
              )}

              {tab === 'agendamento' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data e Hora</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded p-2"
                      value={currentAd.scheduledAt ? new Date(currentAd.scheduledAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => updateAd.mutate({ id: currentAd.id, data: { scheduledAt: e.target.value } })}
                    />
                  </div>
                  <button
                    onClick={() => nextStage.mutate(currentAd.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    ➡️ Ir para Publicação
                  </button>
                </div>
              )}

              {tab === 'publicacao' && (
                <div className="space-y-4">
                  {currentAd.publishedAt ? (
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <div className="font-medium text-green-800">🚀 Publicado!</div>
                      <div className="text-sm text-green-600 mt-1">
                        Em {new Date(currentAd.publishedAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => publish.mutate({ id: currentAd.id, addToLibrary: true })}
                      className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                    >
                      🚀 Publicar Agora
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Nova Produção</h3>
              <CreateProductionForm
                company={selectedCompany}
                onSubmit={(data) => createAd.mutate(data)}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CreateProductionForm({ company, onSubmit, onCancel }: { company: string; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ title: '', channels: [] as string[], format: 'post' })

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={`Ex: Campanha ${company === 'biomed' ? 'Biomed' : 'Advocacia'}`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Canais (múltipla escolha)</label>
        <div className="grid grid-cols-2 gap-2 border rounded p-3">
          {['email', 'instagram', 'facebook', 'linkedin', 'google_ads', 'meta_ads', 'whatsapp'].map(ch => (
            <label key={ch} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.channels.includes(ch)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...form.channels, ch]
                    : form.channels.filter(c => c !== ch)
                  setForm({ ...form, channels: updated })
                }}
                className="w-4 h-4"
              />
              <span className="text-sm capitalize">{ch === 'google_ads' ? 'Google Ads' : ch === 'meta_ads' ? 'Meta Ads' : ch}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={() => onSubmit(form)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          disabled={!form.title || form.channels.length === 0}
        >
          Criar
        </button>
      </div>
    </div>
  )
}

