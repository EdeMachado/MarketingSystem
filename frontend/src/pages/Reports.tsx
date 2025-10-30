import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Reports() {
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string }>({})
  const params = useMemo(() => ({ params: { ...filters } }), [filters])

  const { data: overview } = useQuery(['reports-overview', filters], async () => {
    const r = await api.get('/reports/overview', params)
    return r.data.data as { totalCampaigns: number; totalContacts: number; sent: number; opens: number; clicks: number; failed: number; openRate: number; clickRate: number; bounceRate: number }
  })
  const { data: channels } = useQuery('reports-channels', async () => {
    const r = await api.get('/reports/channels')
    return r.data.data as { type: string; count: number }[]
  })
  const { data: domains } = useQuery('reports-domains', async () => {
    const r = await api.get('/reports/domains')
    return r.data.data as { domain: string; count: number }[]
  })
  const { data: links } = useQuery(['reports-links', filters], async () => {
    const r = await api.get('/reports/links', params)
    return r.data.data as { url: string; count: number }[]
  })

  const channelChart = (channels || []).map((c) => ({ name: c.type, value: c.count }))

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📈 Relatórios</h1>
          <div className="flex items-center gap-2">
            <input type="date" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })} className="px-3 py-2 border rounded" />
            <span className="text-sm text-gray-500">até</span>
            <input type="date" value={filters.endDate || ''} onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })} className="px-3 py-2 border rounded" />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4">
            <div className="text-sm text-gray-500">Enviados</div>
            <div className="text-2xl font-semibold">{overview?.sent ?? 0}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-sm text-gray-500">Aberturas</div>
            <div className="text-2xl font-semibold">{overview?.opens ?? 0} <span className="text-xs text-gray-500">({overview ? overview.openRate.toFixed(1) : '0'}%)</span></div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-sm text-gray-500">Cliques</div>
            <div className="text-2xl font-semibold">{overview?.clicks ?? 0} <span className="text-xs text-gray-500">({overview ? overview.clickRate.toFixed(1) : '0'}%)</span></div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Distribuição por Canal</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={channelChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {channelChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Top Domínios (Contatos)</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(domains || []).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" angle={-30} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#6366f1" name="Contatos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded shadow p-4 lg:col-span-2">
            <div className="font-medium mb-3">Top Links (período)</div>
            <div className="space-y-2 text-sm">
              {(links || []).map((l, i) => (
                <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2">
                  <a href={l.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[75%]">{l.url}</a>
                  <span className="text-gray-600">{l.count} cliques</span>
                </div>
              ))}
              {(links || []).length === 0 && <div className="text-gray-500">Sem cliques no período</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
