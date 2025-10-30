import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import api from '../services/api'

interface Segment {
  id: string
  name: string
  description?: string
  filters: string
  contactCount: number
  type: 'dynamic' | 'static'
  createdAt: string
}

export default function Segments() {
  const qc = useQueryClient()
  const { data, isLoading, refetch } = useQuery('segments', async () => {
    const r = await api.get('/segments')
    return r.data.data as Segment[]
  })

  const [showModal, setShowModal] = useState(false)
  const [viewContacts, setViewContacts] = useState<{ id: string; items: any[] } | null>(null)

  const createMutation = useMutation(async (payload: { name: string; description?: string; type: string; filters: any }) => {
    const r = await api.post('/segments', payload)
    return r.data.data as Segment
  }, {
    onSuccess: () => {
      toast.success('Segmento criado')
      setShowModal(false)
      qc.invalidateQueries('segments')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao criar segmento')
  })

  const deleteMutation = useMutation(async (id: string) => {
    await api.delete(`/segments/${id}`)
  }, {
    onSuccess: () => { toast.success('Segmento removido'); qc.invalidateQueries('segments') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao remover')
  })

  const openContacts = async (id: string) => {
    try {
      const r = await api.get(`/segments/${id}/contacts`)
      setViewContacts({ id, items: r.data.data || [] })
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao carregar contatos')
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">🗂️ Segmentos</h1>
            <p className="text-sm text-gray-600">Crie públicos dinâmicos por filtros (status, opt-out, email válido, tags, datas).</p>
          </div>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={() => setShowModal(true)}
          >+ Novo Segmento</button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contatos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr><td className="px-6 py-4" colSpan={4}>Carregando...</td></tr>
              )}
              {!isLoading && data?.length === 0 && (
                <tr><td className="px-6 py-4 text-gray-500" colSpan={4}>Nenhum segmento</td></tr>
              )}
              {data?.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    {s.description && <div className="text-xs text-gray-500">{s.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.contactCount}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded hover:bg-gray-100" onClick={() => openContacts(s.id)}>Ver contatos</button>
                      <button className="px-2 py-1 border rounded hover:bg-gray-100" onClick={() => window.open(`/api/export/contacts/excel`, '_blank')}>Exportar</button>
                      <button className="px-2 py-1 border rounded text-red-600 hover:bg-red-50" onClick={() => { if (confirm('Excluir segmento?')) deleteMutation.mutate(s.id) }}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal criar segmento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Segmento</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget as HTMLFormElement)
              const payload = {
                name: String(fd.get('name') || ''),
                description: String(fd.get('description') || ''),
                type: String(fd.get('type') || 'dynamic'),
                filters: {
                  status: fd.get('status') || undefined,
                  hasEmail: fd.get('hasEmail') === 'on' ? true : undefined,
                  hasPhone: fd.get('hasPhone') === 'on' ? true : undefined,
                  emailValid: fd.get('emailValid') === 'true' ? true : fd.get('emailValid') === 'false' ? false : undefined,
                  optOut: fd.get('optOut') === 'true' ? true : fd.get('optOut') === 'false' ? false : undefined,
                  company: String(fd.get('company') || '') || undefined,
                  createdAfter: String(fd.get('createdAfter') || '') || undefined,
                  createdBefore: String(fd.get('createdBefore') || '') || undefined,
                  tags: (String(fd.get('tags') || '').trim() ? String(fd.get('tags')).split(',').map(t => t.trim()) : undefined)
                }
              }
              createMutation.mutate(payload as any)
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome</label>
                  <input name="name" required className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select name="type" className="w-full px-3 py-2 border rounded">
                    <option value="dynamic">Dinâmico</option>
                    <option value="static">Estático</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                  <input name="description" className="w-full px-3 py-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select name="status" className="w-full px-3 py-2 border rounded">
                    <option value="">(qualquer)</option>
                    <option value="active">Ativo</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email válido</label>
                  <select name="emailValid" className="w-full px-3 py-2 border rounded">
                    <option value="">(qualquer)</option>
                    <option value="true">Válido</option>
                    <option value="false">Inválido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Opt-out</label>
                  <select name="optOut" className="w-full px-3 py-2 border rounded">
                    <option value="">(qualquer)</option>
                    <option value="false">Sem opt-out</option>
                    <option value="true">Somente opt-out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Empresa contém</label>
                  <input name="company" className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <input id="hasEmail" name="hasEmail" type="checkbox" className="h-4 w-4" />
                  <label htmlFor="hasEmail" className="text-sm text-gray-600">Apenas com email</label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="hasPhone" name="hasPhone" type="checkbox" className="h-4 w-4" />
                  <label htmlFor="hasPhone" className="text-sm text-gray-600">Apenas com telefone</label>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Criados após</label>
                  <input type="date" name="createdAfter" className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Criados antes</label>
                  <input type="date" name="createdBefore" className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Tags (separadas por vírgula)</label>
                  <input name="tags" className="w-full px-3 py-2 border rounded" placeholder="vip, clientes, leads" />
                </div>
              </div>
              <div className="flex justify-end mt-6 gap-2">
                <button type="button" className="px-4 py-2 border rounded" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ver contatos */}
      {viewContacts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contatos do segmento</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setViewContacts(null)}>✕</button>
            </div>
            <div className="text-sm text-gray-600 mb-3">Total: {viewContacts.items.length}</div>
            <div className="divide-y">
              {viewContacts.items.map((c: any) => (
                <div key={c.id} className="py-2 text-sm flex justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-gray-600">{c.email || '-'} • {c.phone || '-'}</div>
                  </div>
                  {c.company && <div className="text-gray-500">{c.company}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
