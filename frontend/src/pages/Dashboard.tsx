import { useQuery } from 'react-query';
import { format, subDays } from 'date-fns';
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

  const { data: stats } = useQuery('dashboard-stats', async () => {
    const res = await api.get('/stats/overview');
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
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard - Grupo Biomed</h2>
        <p className="text-gray-600 mt-2">Soluções em Saúde Ocupacional - Visão geral do marketing em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Campanhas</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalCampaigns}</dd>
                  <dd className="text-xs text-gray-500">{activeCampaigns} ativas</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Contatos</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalContacts}</dd>
                  <dd className="text-xs text-green-600">Crescimento constante</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <span className="text-2xl">📧</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taxa de Abertura</dt>
                  <dd className="text-2xl font-bold text-gray-900">{openRate}%</dd>
                  <dd className="text-xs text-gray-500">{totalOpened} de {totalSent} abertos</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <span className="text-2xl">🖱️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taxa de Cliques</dt>
                  <dd className="text-2xl font-bold text-gray-900">{clickRate}%</dd>
                  <dd className="text-xs text-gray-500">{totalClicked} cliques totais</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs de Entrega/Abertura/Clique/Não vistos */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-500 rounded-md p-3"><span className="text-2xl">📨</span></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Enviados</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalSent}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-teal-500 rounded-md p-3"><span className="text-2xl">✅</span></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Entregues</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalDelivered}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3"><span className="text-2xl">👁️</span></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Não vistos</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalUnseen}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-rose-500 rounded-md p-3"><span className="text-2xl">❌</span></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Falhas</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalFailed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Campanhas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performance das Campanhas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enviados" fill="#6366f1" name="Enviados" />
              <Bar dataKey="aberturas" fill="#10b981" name="Aberturas" />
              <Bar dataKey="cliques" fill="#f59e0b" name="Cliques" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Plataformas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribuição por Plataforma
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {platformChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segundo Row de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das Campanhas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Status das Campanhas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline de Aberturas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Timeline de Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={campaignStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="aberturas" stroke="#10b981" name="Aberturas" />
              <Line type="monotone" dataKey="cliques" stroke="#f59e0b" name="Cliques" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Top Links Clicados */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Links Clicados (7 dias)
          </h3>
          <div className="space-y-2 text-sm">
            {topLinks?.length ? (
              topLinks.map((l, i) => (
                <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2">
                  <a href={l.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[75%]">
                    {l.url}
                  </a>
                  <span className="text-gray-600">{l.count} cliques</span>
                </div>
              ))
            ) : (
              <div className="text-gray-500">Sem cliques no período</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
