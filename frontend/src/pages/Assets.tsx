import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import api from '../services/api'

interface Asset { id: string; name: string; type: string; url?: string; content?: string; tags?: string }
interface Creative { id: string; title: string; channel: string; status: string }

export default function Assets() {
  const { data: assets, refetch } = useQuery('assets', async () => {
    const r = await api.get('/assets')
    return r.data.data as Asset[]
  })
  const { data: creatives, refetch: refetchCreatives } = useQuery('creatives', async () => {
    const r = await api.get('/creatives')
    return r.data.data as Creative[]
  })
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'image', url: '', content: '' })

  const createAsset = useMutation(async () => {
    const r = await api.post('/assets', form)
    return r.data.data as Asset
  }, { onSuccess: () => { toast.success('Ativo criado'); setCreating(false); setForm({ name: '', type: 'image', url: '', content: '' }); refetch() }, onError: (e: any) => toast.error(e.response?.data?.message || 'Erro') })

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">🎛️ Biblioteca de Ativos & Criativos</h1>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => setCreating(true)}>+ Novo Ativo</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Ativos</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(assets || []).map(a => (
                <div key={a.id} className="border rounded p-3 text-sm">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-gray-600">{a.type}</div>
                  {a.url && <a className="text-indigo-600 text-xs hover:underline" href={a.url} target="_blank" rel="noreferrer">abrir</a>}
                </div>
              ))}
              {(assets || []).length === 0 && <div className="text-gray-500">Sem ativos</div>}
            </div>
          </div>

          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Criativos</div>
            <div className="space-y-2">
              {(creatives || []).map(c => (
                <div key={c.id} className="border rounded p-3 text-sm flex justify-between items-center">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-gray-600">{c.channel} • {c.status}</div>
                  </div>
                  <button className="px-2 py-1 border rounded text-xs hover:bg-gray-100" onClick={async () => {
                    try {
                      await api.post(`/creatives/${c.id}/approvals`, { reviewer: 'admin', status: 'approved' })
                      toast.success('Aprovado')
                      refetchCreatives()
                    } catch (e: any) { toast.error('Erro ao aprovar') }
                  }}>Aprovar</button>
                </div>
              ))}
              {(creatives || []).length === 0 && <div className="text-gray-500">Sem criativos</div>}
            </div>
          </div>
        </div>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Ativo</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setCreating(false)}>✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input className="w-full px-3 py-2 border rounded" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="w-full px-3 py-2 border rounded" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="image">Imagem</option>
                <option value="video">Vídeo</option>
                <option value="doc">Documento</option>
                <option value="text">Texto</option>
              </select>
              <input className="w-full px-3 py-2 border rounded" placeholder="URL (opcional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <textarea className="w-full px-3 py-2 border rounded" placeholder="Conteúdo (opcional)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setCreating(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => createAsset.mutate()} disabled={!form.name}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
