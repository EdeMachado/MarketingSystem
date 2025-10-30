import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import api from '../services/api'

interface Project { id: string; name: string; clientName?: string; description?: string; status: string; createdAt: string }
interface Task { id: string; title: string; status: string; assignee?: string; priority: string; dueDate?: string }

export default function Projects() {
  const { data: projects, refetch } = useQuery('projects', async () => {
    const r = await api.get('/projects')
    return r.data.data as Project[]
  })
  const [creating, setCreating] = useState(false)
  const [newProj, setNewProj] = useState({ name: '', clientName: '', description: '' })

  const createMutation = useMutation(async () => {
    const r = await api.post('/projects', newProj)
    return r.data.data as Project
  }, { onSuccess: () => { toast.success('Projeto criado'); setCreating(false); setNewProj({ name: '', clientName: '', description: '' }); refetch() }, onError: (e: any) => toast.error(e.response?.data?.message || 'Erro') })

  const [openProject, setOpenProject] = useState<Project | null>(null)
  const { data: tasks, refetch: refetchTasks } = useQuery(['tasks', openProject?.id], async () => {
    if (!openProject?.id) return []
    const r = await api.get(`/projects/${openProject.id}/tasks`)
    return r.data.data as Task[]
  })

  const createTask = useMutation(async (payload: { title: string }) => {
    const r = await api.post(`/projects/${openProject?.id}/tasks`, { title: payload.title })
    return r.data.data as Task
  }, { onSuccess: () => { toast.success('Tarefa criada'); refetchTasks() }, onError: (e: any) => toast.error(e.response?.data?.message || 'Erro') })

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📂 Projetos e Tarefas</h1>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => setCreating(true)}>+ Novo Projeto</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects?.map((p) => (
            <div key={p.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-medium">{p.name}</div>
                  {p.clientName && <div className="text-sm text-gray-600">{p.clientName}</div>}
                </div>
                <button className="text-sm text-indigo-600 hover:underline" onClick={() => setOpenProject(p)}>Abrir</button>
              </div>
              {openProject?.id === p.id && (
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <input id="newTask" className="px-2 py-1 border rounded flex-1" placeholder="Nova tarefa" />
                    <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => {
                      const title = (document.getElementById('newTask') as HTMLInputElement).value.trim()
                      if (!title) return
                      createTask.mutate({ title })
                      ;(document.getElementById('newTask') as HTMLInputElement).value = ''
                    }}>Adicionar</button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {(tasks || []).map(t => (
                      <div key={t.id} className="border rounded p-2 text-sm flex justify-between items-center">
                        <div>
                          <div className="font-medium">{t.title}</div>
                          <div className="text-gray-500">{t.status} {t.assignee ? `• ${t.assignee}` : ''}</div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{t.priority}</span>
                      </div>
                    ))}
                    {(tasks || []).length === 0 && <div className="text-gray-500 text-sm">Sem tarefas</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Projeto</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setCreating(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 border rounded" placeholder="Nome" value={newProj.name} onChange={(e) => setNewProj({ ...newProj, name: e.target.value })} />
              <input className="w-full px-3 py-2 border rounded" placeholder="Cliente (opcional)" value={newProj.clientName} onChange={(e) => setNewProj({ ...newProj, clientName: e.target.value })} />
              <textarea className="w-full px-3 py-2 border rounded" placeholder="Descrição (opcional)" value={newProj.description} onChange={(e) => setNewProj({ ...newProj, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setCreating(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => createMutation.mutate()} disabled={!newProj.name}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
