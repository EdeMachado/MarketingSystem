import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'
import { ResponsiveContainer, HeatMapChartProps } from 'recharts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function weekdayName(wd: number) {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][wd] || String(wd)
}

export default function Insights() {
  const [days, setDays] = useState(30)

  // Heatmap send-time
  const { data: heatmap } = useQuery('ins-heatmap', async () => {
    const r = await api.get('/insights/send-time-heatmap')
    return r.data.data as Record<string, { sent: number; opens: number; clicks: number }>
  })

  const { data: subjectPerf } = useQuery('ins-subjects', async () => {
    const r = await api.get('/insights/subject-performance')
    return r.data.data as { subject: string; sent: number; opens: number; clicks: number; ctr: number; or: number }[]
  })

  const { data: domainPerf } = useQuery('ins-domains', async () => {
    const r = await api.get('/insights/domain-performance')
    return r.data.data as { domain: string; total: number; openRate: number; clickRate: number }[]
  })

  const { data: fatigue } = useQuery('ins-fatigue', async () => {
    const r = await api.get('/insights/frequency-fatigue')
    return r.data.data as { sendNumber: number; openRate: number; clickRate: number }[]
  })

  const { data: reeng } = useQuery(['ins-reeng', days], async () => {
    const r = await api.get('/insights/reengagement', { params: { days } })
    return r.data.data as { days: number; total: number; sample: any[] }
  })

  const { data: recs } = useQuery('ins-recs', async () => {
    const r = await api.get('/insights/recommendations')
    return r.data.data as { recommendations: string[]; topSubjects: { subject: string; ctr: number }[] }
  })

  // Transform heatmap to 2D matrix for display (bar per hour per weekday)
  const heatBars = useMemo(() => {
    const rows: Record<number, Array<{ hour: number; clicks: number; opens: number; sent: number }>> = {}
    Object.entries(heatmap || {}).forEach(([key, v]) => {
      const [wdStr, hourStr] = key.split('-')
      const wd = Number(wdStr)
      const h = Number(hourStr)
      rows[wd] = rows[wd] || []
      rows[wd].push({ hour: h, clicks: v.clicks, opens: v.opens, sent: v.sent })
    })
    Object.values(rows).forEach(arr => arr.sort((a, b) => a.hour - b.hour))
    return rows
  }, [heatmap])

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">💡 Insights Analíticos</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Reengajamento:</span>
            <input type="number" min={7} value={days} onChange={(e) => setDays(parseInt(e.target.value) || 30)} className="px-2 py-1 border rounded w-24" />
            <span className="text-gray-500">dias</span>
          </div>
        </div>

        {/* Heatmap (barras por dia/hora) */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <div className="font-medium mb-3">Melhores horários e dias (cliques/aberturas)</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.keys(heatBars).length === 0 && <div className="text-gray-500">Sem dados suficientes</div>}
            {Object.entries(heatBars).map(([wd, data]) => (
              <div key={wd} className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">{weekdayName(Number(wd))}</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opens" fill="#10b981" name="Aberturas" />
                    <Bar dataKey="clicks" fill="#f59e0b" name="Cliques" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assuntos com melhor CTR */}
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Assuntos com melhor CTR</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(subjectPerf || []).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ctr" fill="#6366f1" name="CTR %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Domínios com melhor performance */}
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Domínios com melhor performance</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(domainPerf || []).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="openRate" fill="#10b981" name="Open %" />
                <Bar dataKey="clickRate" fill="#f59e0b" name="Click %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fadiga de frequência */}
          <div className="bg-white rounded shadow p-4 lg:col-span-2">
            <div className="font-medium mb-3">Fadiga por frequência (envio # vs taxas)</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fatigue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sendNumber" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="openRate" stroke="#10b981" name="Open %" />
                <Line dataKey="clickRate" stroke="#f59e0b" name="Click %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reengajamento e Recomendações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-2">Reengajamento sugerido</div>
            <div className="text-sm text-gray-600">Contatos sem abrir nos últimos {reeng?.days ?? days} dias e aptos:</div>
            <div className="text-2xl font-semibold mt-2">{reeng?.total ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Exemplo (até 50):</div>
            <ul className="text-sm text-gray-700 list-disc ml-5 mt-2 space-y-1 max-h-40 overflow-auto">
              {(reeng?.sample || []).map((c: any) => (
                <li key={c.id}>{c.name} — {c.email || '-'} {c.phone ? `• ${c.phone}` : ''}</li>
              ))}
              {(reeng?.sample || []).length === 0 && (<li className="list-none text-gray-500">Sem candidatos no período</li>)}
            </ul>
          </div>

          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-2">Recomendações</div>
            <ul className="text-sm text-gray-700 space-y-2 list-disc ml-5">
              {(recs?.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
              {(recs?.recommendations || []).length === 0 && <li className="list-none text-gray-500">Sem recomendações geradas ainda</li>}
            </ul>
            {recs?.topSubjects?.length ? (
              <div className="text-xs text-gray-600 mt-3">
                <div className="font-medium mb-1">Top assuntos (CTR):</div>
                <ul className="list-disc ml-5 space-y-1">
                  {recs.topSubjects.map((s, i) => (
                    <li key={i}>{s.subject} — {s.ctr.toFixed(2)}%</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
