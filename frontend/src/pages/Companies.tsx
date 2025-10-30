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

  // Modal de edição/visualização
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  // Seleção múltipla
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const allSelected = !!data?.items?.length && data.items.every((c) => selectedIds[c.id]);
  const toggleAll = (checked: boolean) => {
    if (!data?.items) return;
    const obj: Record<string, boolean> = {};
    data.items.forEach((c) => (obj[c.id] = checked));
    setSelectedIds(obj);
  };

  const openModal = (company: Company) => {
    setEditing(company);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const saveMutation = useMutation(
    async (payload: Partial<Company> & { id: string }) => {
      const { id, ...data } = payload;
      const res = await api.put(`/companies/${id}`, data);
      return res.data.data as Company;
    },
    {
      onSuccess: () => {
        toast.success('Empresa atualizada');
        closeModal();
        refetch();
      },
      onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao salvar'),
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      await api.delete(`/companies/${id}`);
    },
    {
      onSuccess: () => {
        toast.success('Empresa excluída');
        closeModal();
        refetch();
      },
      onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao excluir'),
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
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </th>
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
                  <tr><td className="px-4 py-3" colSpan={8}>Carregando...</td></tr>
                )}
                {!isLoading && data?.items?.length === 0 && (
                  <tr><td className="px-4 py-3" colSpan={8}>Nenhuma empresa encontrada</td></tr>
                )}
                {data?.items?.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!selectedIds[c.id]}
                        onChange={(e) => setSelectedIds({ ...selectedIds, [c.id]: e.target.checked })}
                      />
                    </td>
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
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      <button
                        className="px-3 py-1 border rounded hover:bg-gray-100 mr-2"
                        onClick={() => openModal(c)}
                      >Editar</button>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
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

      {/* Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editar Empresa</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.email || ''}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefone</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.phone || ''}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">WhatsApp</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.whatsapp || ''}
                  onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Website</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.website || ''}
                  onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Endereço</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.address || ''}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cidade</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.city || ''}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estado</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.state || ''}
                  onChange={(e) => setEditing({ ...editing, state: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">CEP</label>
                <input className="w-full px-3 py-2 border rounded" value={editing.zipCode || ''}
                  onChange={(e) => setEditing({ ...editing, zipCode: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => {
                  if (confirm('Deseja excluir esta empresa?')) deleteMutation.mutate(editing.id);
                }}
                disabled={deleteMutation.isLoading}
              >Excluir</button>

              <div className="space-x-2">
                <button className="px-4 py-2 border rounded" onClick={closeModal}>Cancelar</button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => saveMutation.mutate(editing as any)}
                  disabled={saveMutation.isLoading}
                >Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
