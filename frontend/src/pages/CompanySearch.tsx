import { useState } from 'react';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Company {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  source: string;
}

export default function CompanySearch() {
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    radius: 5000,
    maxResults: 50,
    niche: '',
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [isSearching, setIsSearching] = useState(false);

  // Buscar empresas
  const searchMutation = useMutation(
    async (params: typeof searchParams) => {
      const res = await api.post('/company-search/search', params);
      return res.data.data;
    },
    {
      onSuccess: (data) => {
        setCompanies(data.companies || []);
        setSelected({});
        toast.success(`Encontradas ${data.total} empresas!`);
      },
      onError: (error: any) => {
        const errorMsg = error.response?.data?.message || 'Erro ao buscar empresas';
        if (errorMsg.includes('Google Places') || errorMsg.includes('API') || companies.length === 0) {
          toast.error(
            'Google Places API não configurado. Configure GOOGLE_PLACES_API_KEY no arquivo .env. Veja: COMO-OBTER-GOOGLE-PLACES-API.md',
            { duration: 8000 }
          );
        } else {
          toast.error(errorMsg);
        }
      },
    }
  );

  // Buscar e importar
  const importMutation = useMutation(
    async (params: typeof searchParams) => {
      const res = await api.post('/company-search/search-and-import', params);
      return res.data.data;
    },
    {
      onSuccess: (data) => {
        toast.success(
          `Importadas ${data.imported} empresas! ${data.duplicates} duplicatas ignoradas.`
        );
        // Mantém os resultados atuais na tela (não limpa a busca)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao importar empresas');
      },
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.query.trim()) {
      toast.error('Digite o que deseja buscar');
      return;
    }
    searchMutation.mutate(searchParams);
  };

  const handleImportAll = () => {
    if (companies.length === 0) {
      toast.error('Nenhuma empresa para importar');
      return;
    }
    importMutation.mutate(searchParams);
  };

  const importSelectedMutation = useMutation(
    async (items: Company[]) => {
      const res = await api.post('/companies/bulk-import', { companies: items });
      return res.data.data;
    },
    {
      onSuccess: (r) => {
        toast.success(`Importadas ${r.imported} • Duplicatas ${r.duplicates}`);
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || 'Erro ao importar selecionados');
      },
    }
  );

  const handleImportSelected = () => {
    const items = companies.filter((_, idx) => selected[idx]);
    if (items.length === 0) {
      toast.error('Selecione ao menos uma empresa');
      return;
    }
    importSelectedMutation.mutate(items.map((c) => ({
      ...c,
      source: 'google',
    })) as any);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Buscar Empresas Automaticamente</h1>

        {/* Formulário de Busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O que buscar? *
                </label>
                <input
                  type="text"
                  value={searchParams.query}
                  onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                  placeholder="Ex: clínicas, empresas de saúde, farmácias..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  placeholder="Ex: São Paulo, SP ou CEP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raio de Busca (metros)
                </label>
                <input
                  type="number"
                  value={searchParams.radius}
                  onChange={(e) => setSearchParams({ ...searchParams, radius: parseInt(e.target.value) || 5000 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Resultados
                </label>
                <input
                  type="number"
                  value={searchParams.maxResults}
                  onChange={(e) => setSearchParams({ ...searchParams, maxResults: parseInt(e.target.value) || 50 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nicho/Segmento (opcional)
              </label>
              <input
                type="text"
                value={searchParams.niche}
                onChange={(e) => setSearchParams({ ...searchParams, niche: e.target.value })}
                placeholder="Ex: saúde ocupacional, medicina do trabalho..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={searchMutation.isLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchMutation.isLoading ? 'Buscando...' : '🔍 Buscar Empresas'}
              </button>

              {companies.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportAll}
                  disabled={importMutation.isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importMutation.isLoading ? 'Importando...' : `📥 Importar ${companies.length} Empresas`}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Resultados */}
        {companies.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {companies.length} Empresas Encontradas
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleImportAll}
                  disabled={importMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {importMutation.isLoading ? 'Importando...' : 'Importar Todas'}
                </button>
                <button
                  type="button"
                  onClick={handleImportSelected}
                  disabled={importSelectedMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {importSelectedMutation.isLoading ? 'Importando...' : 'Importar Selecionadas'}
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {companies.map((company, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {company.email && (
                          <p>
                            <span className="font-medium">📧 Email:</span> {company.email}
                          </p>
                        )}
                        {company.phone && (
                          <p>
                            <span className="font-medium">📞 Telefone:</span> {company.phone}
                            {company.whatsapp && (
                              <span className="text-green-600 ml-2">✓ WhatsApp</span>
                            )}
                          </p>
                        )}
                        {company.address && (
                          <p>
                            <span className="font-medium">📍 Endereço:</span> {company.address}
                          </p>
                        )}
                        {company.website && (
                          <p>
                            <span className="font-medium">🌐 Site:</span>{' '}
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              {company.website}
                            </a>
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Fonte: {company.source}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={!!selected[index]}
                          onChange={(e) => setSelected({ ...selected, [index]: e.target.checked })}
                        />
                        Selecionar
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {searchMutation.isSuccess && companies.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <p className="text-yellow-800 font-medium mb-2">
                ⚠️ Nenhuma empresa encontrada ou Google Places API não configurado
              </p>
              <p className="text-yellow-700 text-sm mb-4">
                Se você acabou de fazer uma busca, tente ajustar os filtros.
              </p>
              <div className="bg-white border border-yellow-300 rounded-md p-4 text-left">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  📋 Para configurar a API:
                </p>
                <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Adicione no arquivo <code className="bg-gray-100 px-1 rounded">backend/.env</code>:</li>
                  <li className="ml-4 font-mono bg-gray-100 p-2 rounded">GOOGLE_PLACES_API_KEY=sua-chave-aqui</li>
                  <li>Veja o guia completo: <code className="bg-gray-100 px-1 rounded">COMO-OBTER-GOOGLE-PLACES-API.md</code></li>
                  <li>Acesse: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.cloud.google.com</a></li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

