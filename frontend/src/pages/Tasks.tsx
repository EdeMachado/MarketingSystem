import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  assignee?: string
  priority: string
  startDate?: string
  dueDate?: string
  estimateH?: number
  spentH?: number
  project?: { name: string }
}

type View = 'lista' | 'kanban' | 'calendario' | 'gantt' | 'workload'

export default function Tasks() {
  const [view, setView] = useState<View>('kanban')
  const [filters, setFilters] = useState<{ status?: string; assignee?: string; projectId?: string; priority?: string }>({})

  const { data: tasks, refetch } = useQuery(['tasks', filters], async () => {
    const r = await api.get('/projects/tasks', { params: filters })
    return r.data.data as Task[]
  })

  const { data: projects } = useQuery('projects', async () => {
    const r = await api.get('/projects')
    return r.data.data || []
  })

  const { data: workload } = useQuery('workload', async () => {
    const r = await api.get('/projects/tasks/workload')
    return r.data.data as { assignee: string; estimated: number; spent: number }[]
  })

  const updateTask = useMutation(async ({ id, data }: { id: string; data: Partial<Task> }) => {
    const r = await api.put(`/projects/tasks/${id}`, data)
    return r.data.data as Task
  }, { 
    onSuccess: () => { toast.success('Tarefa atualizada'); refetch() }, 
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Erro') }
  })

  const updateStatus = (id: string, status: string) => updateTask.mutate({ id, data: { status } })

  // Kanban columns
  const columns = ['todo', 'doing', 'review', 'done']

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = { todo: [], doing: [], review: [], done: [] }
    tasks?.forEach(t => {
      grouped[t.status] = grouped[t.status] || []
      grouped[t.status].push(t)
    })
    return grouped
  }, [tasks])

  // Gantt helper
  const ganttData = useMemo(() => {
    return (tasks || [])
      .filter(t => t.startDate || t.dueDate)
      .map(t => ({
        ...t,
        start: t.startDate ? new Date(t.startDate) : new Date(),
        end: t.dueDate ? new Date(t.dueDate) : new Date(Date.now() + 86400000),
      }))
      .sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0))
  }, [tasks])

  // Calendar helper
  const calendarData = useMemo(() => {
    const byDate: Record<string, Task[]> = {}
    tasks?.forEach(t => {
      const date = t.dueDate || t.startDate
      if (date) {
        const key = new Date(date).toISOString().split('T')[0]
        byDate[key] = byDate[key] || []
        byDate[key].push(t)
      }
    })
    return byDate
  }, [tasks])

  const getPriorityColor = (p: string) => {
    return { low: 'bg-blue-100 text-blue-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }[p] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📋 Tarefas</h1>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 border rounded" value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}>
              <option value="">Todos status</option>
              <option value="todo">A fazer</option>
              <option value="doing">Em andamento</option>
              <option value="review">Revisão</option>
              <option value="done">Concluído</option>
            </select>
            <select className="px-3 py-2 border rounded" value={filters.projectId || ''} onChange={(e) => setFilters({ ...filters, projectId: e.target.value || undefined })}>
              <option value="">Todos projetos</option>
              {(projects || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="px-3 py-2 border rounded" placeholder="Responsável" value={filters.assignee || ''} onChange={(e) => setFilters({ ...filters, assignee: e.target.value || undefined })} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b mb-4">
          {(['lista', 'kanban', 'calendario', 'gantt', 'workload'] as View[]).map(v => (
            <button key={v} className={`px-4 py-2 ${view === v ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`} onClick={() => setView(v)}>
              {v === 'lista' ? '📋 Lista' : v === 'kanban' ? '📊 Kanban' : v === 'calendario' ? '📅 Calendário' : v === 'gantt' ? '📈 Gantt' : '👥 Workload'}
            </button>
          ))}
        </div>

        {/* Lista */}
        {view === 'lista' && (
          <div className="bg-white rounded shadow">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prazo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {(tasks || []).map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{t.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.project?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.assignee || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                        <option value="todo">A fazer</option>
                        <option value="doing">Em andamento</option>
                        <option value="review">Revisão</option>
                        <option value="done">Concluído</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs ${getPriorityColor(t.priority)}`}>{t.priority}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban */}
        {view === 'kanban' && (
          <div className="grid grid-cols-4 gap-4">
            {columns.map(col => (
              <div 
                key={col} 
                data-column={col}
                className="bg-gray-50 rounded p-3"
                onDrop={(e) => {
                  e.preventDefault()
                  const taskId = e.dataTransfer.getData('taskId')
                  if (taskId) updateStatus(taskId, col)
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="font-medium mb-3 capitalize">{col === 'todo' ? 'A fazer' : col === 'doing' ? 'Em andamento' : col === 'review' ? 'Revisão' : 'Concluído'}</div>
                <div className="space-y-2">
                  {(tasksByStatus[col] || []).map(t => (
                    <div 
                      key={t.id} 
                      className="bg-white rounded p-3 shadow cursor-move hover:shadow-md transition" 
                      draggable 
                      onDragStart={(e) => e.dataTransfer.setData('taskId', t.id)}
                    >
                      <div className="font-medium text-sm">{t.title}</div>
                      {t.assignee && <div className="text-xs text-gray-600 mt-1">{t.assignee}</div>}
                      {t.dueDate && <div className="text-xs text-gray-500 mt-1">{new Date(t.dueDate).toLocaleDateString()}</div>}
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                    </div>
                  ))}
                  {(!tasksByStatus[col] || tasksByStatus[col].length === 0) && <div className="text-sm text-gray-400 text-center py-4">Vazio</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendário */}
        {view === 'calendario' && (
          <div className="bg-white rounded shadow p-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }, (_, i) => {
                const d = new Date(Date.now() + i * 86400000)
                const key = d.toISOString().split('T')[0]
                const dayTasks = calendarData[key] || []
                return (
                  <div key={i} className="border rounded p-2 min-h-24">
                    <div className="text-xs font-medium">{d.getDate()}/{d.getMonth() + 1}</div>
                    <div className="space-y-1 mt-1">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="text-xs bg-indigo-100 text-indigo-700 rounded px-1 truncate">{t.title}</div>
                      ))}
                      {dayTasks.length > 3 && <div className="text-xs text-gray-500">+{dayTasks.length - 3}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Gantt */}
        {view === 'gantt' && (
          <div className="bg-white rounded shadow p-4 overflow-x-auto">
            <div className="space-y-2 min-w-[800px]">
              {ganttData.map((t, i) => {
                const duration = (t.end.getTime() - t.start.getTime()) / (1000 * 60 * 60 * 24)
                const left = ((t.start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) * 10
                return (
                  <div key={t.id} className="relative h-8 border-b">
                    <div className="absolute left-0 w-32 text-sm truncate">{t.title}</div>
                    <div className="ml-40 relative">
                      <div className="absolute" style={{ left: `${Math.max(0, left)}px`, width: `${Math.max(10, duration * 10)}px` }}>
                        <div className="bg-indigo-500 h-6 rounded text-white text-xs flex items-center px-2 truncate">{t.title}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {ganttData.length === 0 && <div className="text-center text-gray-500 py-8">Sem tarefas com datas para exibir</div>}
            </div>
          </div>
        )}

        {/* Workload */}
        {view === 'workload' && (
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-4">Horas por pessoa</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workload || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="assignee" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="estimated" fill="#3b82f6" name="Estimado (h)" />
                <Bar dataKey="spent" fill="#10b981" name="Realizado (h)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {(workload || []).map(w => (
                <div key={w.assignee} className="flex justify-between items-center border-b pb-2">
                  <div className="font-medium">{w.assignee}</div>
                  <div className="text-sm text-gray-600">Estimado: {w.estimated}h • Realizado: {w.spent}h</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

