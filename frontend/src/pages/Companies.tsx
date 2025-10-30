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
    async (payload: Partial<Company> & { id?: string }) => {
      const { id, ...data } = payload;
      if (id) {
        const res = await api.put(`/companies/${id}`, data);
        return res.data.data as Company;
      } else {
        const res = await api.post(`/companies`, data);
        return res.data.data as Company;
      }
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

  // Duplicados (fuzzy)
  const [dupeOpen, setDupeOpen] = useState(false)
  const [dupes, setDupes] = useState<Array<{ a: Company; b: Company; score: number }>>([])
  const loadDupes = async () => {
    try {
      const r = await api.get('/companies/duplicates', { params: { threshold: 0.9, take: 1500 } })
      setDupes(r.data.data || [])
      setDupeOpen(true)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao buscar duplicados')
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🏢 Empresas</h1>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
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
          <button
            onClick={() => {
              setEditing({
                id: '',
                name: '',
                email: '',
                phone: '',
                whatsapp: '',
                website: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                source: 'manual',
                metadata: '',
                createdAt: new Date().toISOString(),
              } as any);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Nova Empresa
          </button>
          <button
            onClick={() => {
              const params = new URLSearchParams()
              if (filters.city) params.set('city', filters.city)
              if (filters.state) params.set('state', filters.state)
              window.open('/api/export/companies/excel' + (params.toString() ? `?${params.toString()}` : ''), '_blank')
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            title="Exportar Excel com filtros atuais"
          >
            ⬇️ Exportar
          </button>
        </div>

        {/* Importar via busca */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Importar automaticamente</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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
            <button
              onClick={loadDupes}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
              title="Ver possíveis duplicados"
            >
              🔍 Duplicados
            </button>
          </div>
        </div>

        {/* Cards (igual à Busca) */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} />
              <span className="text-sm text-gray-600">Selecionar todos</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                onClick={() => {
                  const ids = Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k);
                  if (ids.length === 0) return toast.error('Selecione ao menos uma empresa');
                  if (!confirm(`Excluir ${ids.length} selecionada(s)?`)) return;
                  api.post('/companies/bulk-delete', { ids })
                    .then((r) => {
                      toast.success(`Excluídas: ${r.data.data.deleted}`);
                      setSelectedIds({});
                      refetch();
                    })
                    .catch((e) => toast.error(e.response?.data?.message || 'Erro ao excluir'));
                }}
              >Excluir selecionadas</button>
              {!!data?.total && <span className="text-xs text-gray-600">Total: {data.total}</span>}
            </div>
          </div>

          {isLoading && <div>Carregando...</div>}
          {!isLoading && data?.items?.length === 0 && <div>Nenhuma empresa encontrada</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.items?.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-md p-3 shadow-sm hover:shadow-md transition bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{c.name}</h3>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                      <p><span className="font-medium">📧</span> {c.email || '-'}</p>
                      <p><span className="font-medium">📞</span> {c.phone || c.whatsapp || '-'}</p>
                      <p className="line-clamp-2"><span className="font-medium">📍</span> {[c.address, c.city, c.state].filter(Boolean).join(', ') || '-'}</p>
                      <p>
                        <span className="font-medium">🌐</span>{' '}
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{c.website}</a>
                        ) : '-'}
                      </p>
                      <p className="text-[10px] text-gray-400">Fonte: {c.source}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedIds[c.id]}
                      onChange={(e) => setSelectedIds({ ...selectedIds, [c.id]: e.target.checked })}
                      title="Selecionar"
                    />
                    <button
                      className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                      onClick={() => openModal(c)}
                    >Editar</button>
                  </div>
                </div>
                <div className="mt-2 text-right text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          {/* Paginação simples */}
          {!!data?.total && (
            <div className="mt-4 px-1 py-2 flex items-center justify-between bg-gray-50 text-sm text-gray-600 rounded">
              <div className="space-x-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPagination((p) => ({ ...p, skip: Math.max(0, p.skip - p.take) }))}
                  disabled={pagination.skip === 0}
                >Anterior</button>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPagination((p) => ({ ...p, skip: p.skip + p.take }))}
                  disabled={!!data?.items && data.items.length < pagination.take}
                >Próximo</button>
              </div>
              <span>Página {Math.floor(pagination.skip / pagination.take) + 1}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edição */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editing.id ? 'Editar Empresa' : 'Nova Empresa'}</h3>
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

      {/* Modal Duplicados */}
      {dupeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Possíveis Duplicados</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setDupeOpen(false)}>✕</button>
            </div>
            {dupes.length === 0 && <div className="text-gray-500">Nenhum duplicado encontrado com o limiar atual.</div>}
            <div className="space-y-3">
              {dupes.map((p, idx) => (
                <div key={idx} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{p.a.name}</div>
                      <div className="text-gray-600">{[p.a.email, p.a.phone, p.a.website].filter(Boolean).join(' • ')}</div>
                    </div>
                    <div className="px-2 text-xs text-gray-500">score {p.score}</div>
                    <div className="flex-1 text-right">
                      <div className="font-medium">{p.b.name}</div>
                      <div className="text-gray-600">{[p.b.email, p.b.phone, p.b.website].filter(Boolean).join(' • ')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
