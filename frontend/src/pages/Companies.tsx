import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  source: string;
  metadata?: string;
  createdAt: string;
}

export default function Companies() {
  const [filters, setFilters] = useState({ q: '', city: '', state: '' });
  const [pagination, setPagination] = useState({ take: 50, skip: 0 });

  const queryKey = useMemo(() => ['companies', filters, pagination], [filters, pagination]);

  const { data, isLoading, refetch } = useQuery(queryKey, async () => {
    const res = await api.get('/companies', { params: { ...filters, ...pagination } });
    return res.data.data as { items: Company[]; total: number };
  });

  const importMutation = useMutation(
    async (payload: { query: string; location?: string; radius?: number; maxResults?: number }) => {
      const res = await api.post('/companies/import-from-search', payload);
      return res.data.data;
    },
    {
      onSuccess: (r) => {
        toast.success(`Importadas ${r.imported} empresas • Duplicatas ${r.duplicates}`);
        refetch();
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || 'Erro ao importar empresas');
      },
    }
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🏢 Empresas</h1>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Buscar por nome, email, site, telefone"
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <input
            placeholder="Cidade"
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <input
            placeholder="Estado"
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          />
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Filtrar
          </button>
        </div>

        {/* Importar via busca */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Importar automaticamente</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input id="q" placeholder="O que buscar (ex: clínicas)" className="px-3 py-2 border border-gray-300 rounded-md" />
            <input id="loc" placeholder="Local (ex: São Paulo, SP)" className="px-3 py-2 border border-gray-300 rounded-md" />
            <input id="radius" type="number" placeholder="Raio (m)" className="px-3 py-2 border border-gray-300 rounded-md" defaultValue={5000} />
            <input id="max" type="number" placeholder="Máximo" className="px-3 py-2 border border-gray-300 rounded-md" defaultValue={60} />
            <button
              onClick={() => {
                const q = (document.getElementById('q') as HTMLInputElement).value.trim();
                const loc = (document.getElementById('loc') as HTMLInputElement).value.trim();
                const radius = parseInt((document.getElementById('radius') as HTMLInputElement).value) || 5000;
                const max = parseInt((document.getElementById('max') as HTMLInputElement).value) || 60;
                if (!q) return toast.error('Preencha o campo "O que buscar"');
                importMutation.mutate({ query: q, location: loc, radius, maxResults: max });
              }}
              disabled={importMutation.isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {importMutation.isLoading ? 'Importando...' : 'Importar da Busca'}
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade/UF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && (
                  <tr><td className="px-4 py-3" colSpan={7}>Carregando...</td></tr>
                )}
                {!isLoading && data?.items?.length === 0 && (
                  <tr><td className="px-4 py-3" colSpan={7}>Nenhuma empresa encontrada</td></tr>
                )}
                {data?.items?.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.phone || c.whatsapp || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{[c.city, c.state].filter(Boolean).join('/') || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {c.website ? (
                        <a href={c.website} target="_blank" className="text-indigo-600 hover:underline" rel="noreferrer">{c.website}</a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.source}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação simples */}
          {!!data?.total && (
            <div className="px-4 py-3 flex items-center justify-between bg-gray-50 text-sm text-gray-600">
              <span>Total: {data.total}</span>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPagination((p) => ({ ...p, skip: Math.max(0, p.skip - p.take) }))}
                  disabled={pagination.skip === 0}
                >Anterior</button>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPagination((p) => ({ ...p, skip: p.skip + p.take }))}
                  disabled={data.items.length < pagination.take}
                >Próximo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
