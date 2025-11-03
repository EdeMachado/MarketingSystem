import { useQuery } from 'react-query';
import api from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { data: campaigns } = useQuery('campaigns', async () => {
    const res = await api.get('/campaigns');
    return res.data.data;
  });

  const { data: contacts } = useQuery('contacts', async () => {
    const res = await api.get('/contacts?limit=10000');
    return res.data.data;
  });

  const { data: topLinks } = useQuery('top-links', async () => {
    const res = await api.get('/stats/top-links');
    return res.data.data as { url: string; count: number }[];
  });

  // Preparar dados para gráficos
  const campaignStats = campaigns?.map((c: any) => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    enviados: c.stats?.sent || 0,
    aberturas: c.stats?.opened || 0,
    cliques: c.stats?.clicked || 0,
    falhas: c.stats?.failed || 0,
  })) || [];

  const platformData = campaigns?.reduce((acc: any, c: any) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {}) || {};

  const platformChart = Object.entries(platformData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const statusData = campaigns?.reduce((acc: any, c: any) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const statusChart = Object.entries(statusData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Calcular métricas
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'running').length || 0;
  const completedCampaigns = campaigns?.filter((c: any) => c.status === 'completed').length || 0;
  const totalContacts = contacts?.length || 0;

  const totalSent = campaigns?.reduce((sum: number, c: any) => sum + (c.stats?.sent || 0), 0) || 0;
  const totalOpened = campaigns?.reduce((sum: number, c: any) => sum + (c.stats?.opened || 0), 0) || 0;
  const totalClicked = campaigns?.reduce((sum: number, c: any) => sum + (c.stats?.clicked || 0), 0) || 0;
  const totalDelivered = campaigns?.reduce((sum: number, c: any) => sum + (c.stats?.delivered || 0), 0) || 0;
  const totalFailed = campaigns?.reduce((sum: number, c: any) => sum + (c.stats?.failed || 0), 0) || 0;
  const totalUnseen = Math.max(0, totalSent - totalOpened);

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard - Grupo Biomed</h2>
          <p className="text-gray-600 text-lg">Soluções em Saúde Ocupacional - Visão geral do marketing em tempo real</p>
        </div>

        {/* Cards Principais - Estilo Widget Completo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card: Visão Geral de Campanhas */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Campanhas</h3>
                  <p className="text-gray-300 text-xs">Visão geral completa</p>
                </div>
                <div className="bg-gray-700 rounded-lg px-4 py-2">
                  <span className="text-3xl font-bold text-white">{totalCampaigns}</span>
                  <p className="text-xs text-gray-300">Total</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{activeCampaigns}</div>
                  <div className="text-xs text-gray-600 mt-1">Ativas</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{completedCampaigns}</div>
                  <div className="text-xs text-gray-600 mt-1">Concluídas</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {campaigns?.filter((c: any) => c.status === 'scheduled').length || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Agendadas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Base de Contatos */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Base de Contatos</h3>
                  <p className="text-gray-300 text-xs">Sua lista de prospects</p>
                </div>
                <div className="bg-gray-700 rounded-lg px-4 py-2">
                  <span className="text-3xl font-bold text-white">{totalContacts}</span>
                  <p className="text-xs text-gray-300">Contatos</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Com Email</span>
                  <span className="font-semibold text-gray-900">
                    {contacts?.filter((c: any) => c.email).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Com Telefone</span>
                  <span className="font-semibold text-gray-900">
                    {contacts?.filter((c: any) => c.phone).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Ativos</span>
                  <span className="font-semibold text-gray-900">
                    {contacts?.filter((c: any) => c.status === 'active').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card: Métricas de Email */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-800 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Performance de Email</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Taxa de Abertura</div>
                  <div className="text-3xl font-bold text-gray-900">{openRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">{totalOpened} de {totalSent}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Taxa de Cliques</div>
                  <div className="text-3xl font-bold text-gray-900">{clickRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">{totalClicked} cliques</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{totalSent}</div>
                  <div className="text-xs text-gray-500">Enviados</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{totalDelivered}</div>
                  <div className="text-xs text-gray-500">Entregues</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{totalUnseen}</div>
                  <div className="text-xs text-gray-500">Não vistos</div>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{totalFailed}</div>
                  <div className="text-xs text-gray-500">Falhas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Status de Envio */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-800 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Status de Envio</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Entregues</span>
                    <span className="font-semibold">{totalDelivered} ({totalSent > 0 ? ((totalDelivered/totalSent)*100).toFixed(1) : 0}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-700 h-2 rounded-full" 
                      style={{ width: `${totalSent > 0 ? (totalDelivered/totalSent)*100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Abertos</span>
                    <span className="font-semibold">{totalOpened} ({openRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ width: `${openRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Cliques</span>
                    <span className="font-semibold">{totalClicked} ({clickRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${clickRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Falhas</span>
                    <span className="font-semibold">{totalFailed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full" 
                      style={{ width: `${totalSent > 0 ? (totalFailed/totalSent)*100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Gráficos - Estilo Widget Completo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Widget: Performance das Campanhas */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Performance das Campanhas</h3>
                <div className="bg-gray-700 rounded-full px-3 py-1">
                  <span className="text-xs text-white font-medium">Análise</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={campaignStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="enviados" fill="#6b7280" name="Enviados" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aberturas" fill="#4b5563" name="Aberturas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cliques" fill="#9ca3af" name="Cliques" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget: Distribuição por Plataforma */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Canais Utilizados</h3>
                <div className="bg-gray-700 rounded-full px-3 py-1">
                  <span className="text-xs text-white font-medium">{Object.keys(platformData).length} canais</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={platformChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}\n${(percent * 100).toFixed(0)}%`}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {platformChart.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-600">{entry.name}</span>
                    <span className="ml-auto font-semibold text-gray-900">{String(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Segunda Linha de Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Widget: Status das Campanhas */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-800 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Status das Campanhas</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => `${name}: ${value}`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget: Timeline de Performance */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow lg:col-span-2">
            <div className="bg-gray-800 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Timeline de Performance</h3>
            </div>
            <div className="p-6 bg-gray-50">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={campaignStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="aberturas" 
                    stroke="#6b7280" 
                    name="Aberturas"
                    strokeWidth={2}
                    dot={{ fill: '#6b7280', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cliques" 
                    stroke="#4b5563" 
                    name="Cliques"
                    strokeWidth={2}
                    dot={{ fill: '#4b5563', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Widget: Top Links */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Top Links Mais Clicados</h3>
              <div className="bg-gray-700 rounded-full px-3 py-1">
                <span className="text-xs text-white font-medium">Últimos 7 dias</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {topLinks && topLinks.length > 0 ? (
              <div className="space-y-3">
                {topLinks.map((l, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-sm">#{i + 1}</span>
                      </div>
                      <a 
                        href={l.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-gray-700 hover:text-gray-900 hover:underline truncate flex-1 font-medium"
                      >
                        {l.url}
                      </a>
                    </div>
                    <div className="flex-shrink-0 ml-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                      {l.count} {l.count === 1 ? 'clique' : 'cliques'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-3">🔗</div>
                <p className="text-gray-500">Nenhum link foi clicado ainda</p>
                <p className="text-gray-400 text-sm mt-1">Os cliques aparecerão aqui conforme os usuários interagem</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
