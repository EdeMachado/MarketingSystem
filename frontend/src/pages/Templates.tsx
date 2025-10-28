import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Templates() {
  const [showModal, setShowModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateFilter, setTemplateFilter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery('templates', async () => {
    const res = await api.get('/templates');
    return res.data.data;
  });

  const { data: defaultTemplates } = useQuery('default-templates', async () => {
    const res = await api.get('/templates-library/default');
    return res.data.data;
  });

  const createTemplate = useMutation(
    async (data: any) => {
      const res = await api.post('/templates', data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Template criado com sucesso!');
        queryClient.invalidateQueries('templates');
        setShowModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao criar template');
      },
    }
  );

  const createFromDefault = useMutation(
    async (index: number) => {
      const res = await api.post(`/templates-library/from-default/${index}`);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Template criado com sucesso!');
        // Forçar atualização da lista
        queryClient.invalidateQueries('templates');
        // Aguardar um pouco e atualizar novamente para garantir
        setTimeout(() => {
          queryClient.refetchQueries('templates');
        }, 500);
        setShowLibrary(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao criar template');
      },
    }
  );

  const deleteTemplate = useMutation(
    async (id: string) => {
      const res = await api.delete(`/templates/${id}`);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Template removido com sucesso!');
        queryClient.invalidateQueries('templates');
        setViewingTemplate(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao remover template');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTemplate.mutate({
      name: formData.get('name'),
      subject: formData.get('subject'),
      body: formData.get('body'),
      type: formData.get('type') || 'email',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Carregando templates...</p>
          <button
            onClick={() => queryClient.refetchQueries('templates')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Atualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Templates</h2>
          {templates && Array.isArray(templates) && (
            <p className="text-sm text-gray-500 mt-1">
              {templates.length} template(s) cadastrado(s)
            </p>
          )}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => queryClient.refetchQueries('templates')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            title="Atualizar lista"
          >
            🔄 Atualizar
          </button>
          <button
            onClick={() => setShowLibrary(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            📚 Biblioteca de Templates
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            + Novo Template
          </button>
        </div>
      </div>

      {/* Biblioteca de Templates */}
      {showLibrary && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  📚 Biblioteca de Templates - Grupo Biomed
                </h3>
                <button
                  onClick={() => setShowLibrary(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4 flex space-x-2">
                <button
                  onClick={() => setTemplateFilter(null)}
                  className={`px-3 py-1 text-sm rounded hover:opacity-80 ${
                    templateFilter === null ? 'bg-gray-400 text-white' : 'bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTemplateFilter('instagram')}
                  className={`px-3 py-1 text-sm rounded hover:opacity-80 ${
                    templateFilter === 'instagram' ? 'bg-pink-400 text-white' : 'bg-pink-200'
                  }`}
                >
                  📸 Instagram
                </button>
                <button
                  onClick={() => setTemplateFilter('facebook')}
                  className={`px-3 py-1 text-sm rounded hover:opacity-80 ${
                    templateFilter === 'facebook' ? 'bg-blue-400 text-white' : 'bg-blue-200'
                  }`}
                >
                  📘 Facebook
                </button>
                <button
                  onClick={() => setTemplateFilter('email')}
                  className={`px-3 py-1 text-sm rounded hover:opacity-80 ${
                    templateFilter === 'email' ? 'bg-green-400 text-white' : 'bg-green-200'
                  }`}
                >
                  📧 Email
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  let filtered = defaultTemplates || [];
                  if (templateFilter) {
                    filtered = filtered.filter((t: any) => t.type === templateFilter);
                  }
                  // Encontrar índice original para criar template corretamente
                  return filtered.map((template: any) => {
                    const originalIndex = defaultTemplates?.findIndex((t: any) => t === template) ?? 0;
                    return (
                  <div key={originalIndex} className="border rounded-lg p-4 hover:shadow-md transition">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {template.name}
                      {template.category === 'promotional' && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Promocional
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                    <div
                      className="text-xs text-gray-400 mb-3 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: template.body.replace(/<[^>]*>/g, '').substring(0, 150),
                      }}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowLibrary(false);
                          setTimeout(() => setViewingTemplate(template), 100);
                        }}
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                      >
                        👁️ Visualizar
                      </button>
                      <button
                        onClick={() => createFromDefault.mutate(originalIndex)}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                        disabled={createFromDefault.isLoading}
                      >
                        {createFromDefault.isLoading ? 'Criando...' : '✅ Usar Este'}
                      </button>
                    </div>
                  </div>
                    );
                  });
                })()}
              </div>
              {defaultTemplates && defaultTemplates.length === 0 && (
                <p className="text-center text-gray-500 mt-4">Nenhum template encontrado</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates && Array.isArray(templates) && templates.length > 0 ? (
          templates.map((template: any) => (
            <div key={template.id || String(template)} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900 flex-1">
                  {String(template.name || 'Sem nome')}
                </h3>
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja remover o template "${template.name}"?`)) {
                      deleteTemplate.mutate(template.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remover template"
                >
                  🗑️
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {String(template.subject || 'Sem assunto')}
              </p>
              <p className="text-xs text-gray-400 mb-4 line-clamp-3">
                {(() => {
                  const bodyText = typeof template.body === 'string'
                    ? template.body
                    : String(template.body || '');
                  const cleanText = bodyText.replace(/<[^>]*>/g, '');
                  return cleanText.substring(0, 100) + (cleanText.length > 100 ? '...' : '');
                })()}
              </p>
              <div className="flex justify-between items-center">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                  {String(template.type || 'email')}
                </span>
                <button
                  onClick={() => setViewingTemplate(template)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  👁️ Ver
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white shadow rounded-lg p-6 text-center text-gray-500">
            <p className="mb-4">Nenhum template criado ainda.</p>
            <p className="text-sm mb-4">Clique em "📚 Biblioteca de Templates" para escolher templates prontos do Grupo Biomed!</p>
            <button
              onClick={() => setShowLibrary(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Abrir Biblioteca
            </button>
          </div>
        )}
      </div>

      {/* Modal para Visualizar Template */}
      {viewingTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {String(viewingTemplate.name || 'Template')}
              </h3>
              <div className="space-x-2">
                <button
                  onClick={() => setEditingTemplate(viewingTemplate)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja remover este template?')) {
                      deleteTemplate.mutate(viewingTemplate.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  🗑️ Remover
                </button>
                <button
                  onClick={() => setViewingTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto:
                </label>
                <p className="text-gray-900">{String(viewingTemplate.subject || 'Sem assunto')}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo:
                </label>
                <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded">
                  {String(viewingTemplate.type || 'email')}
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview do Email:
                </label>
                <div 
                  className="border border-gray-300 rounded-md p-4 bg-white"
                  style={{ minHeight: '300px' }}
                  dangerouslySetInnerHTML={{ 
                    __html: String(viewingTemplate.body || 'Sem conteúdo') 
                  }}
                />
              </div>

              <div className="bg-gray-50 rounded-md p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código HTML:
                </label>
                <pre className="text-xs bg-white border rounded p-3 overflow-auto max-h-40">
                  <code>{String(viewingTemplate.body || '')}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Template */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5">
              <h3 className="text-lg font-bold text-gray-900">
                Editar Template
              </h3>
            </div>
            <div className="p-5">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                api.put(`/templates/${editingTemplate.id}`, {
                  name: formData.get('name'),
                  subject: formData.get('subject'),
                  body: formData.get('body'),
                }).then(() => {
                  toast.success('Template atualizado!');
                  queryClient.invalidateQueries('templates');
                  setEditingTemplate(null);
                  setViewingTemplate(null);
                }).catch((error) => {
                  toast.error('Erro ao atualizar');
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={editingTemplate.name}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto *
                  </label>
                  <input
                    name="subject"
                    required
                    defaultValue={editingTemplate.subject}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corpo (HTML) *
                  </label>
                  <textarea
                    name="body"
                    required
                    rows={10}
                    defaultValue={editingTemplate.body}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5">
              <h3 className="text-lg font-bold text-gray-900">
                Novo Template
              </h3>
            </div>
            <div className="p-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  name="name"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  name="type"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto *
                </label>
                <input
                  name="subject"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span>Corpo (HTML) - use </span>
                  <code className="bg-gray-100 px-1 rounded">{'{{nome}}'}</code>
                  <span> para variáveis *</span>
                </label>
                <textarea
                  name="body"
                  required
                  rows={10}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  placeholder="<h1>Olá {{nome}}!</h1><p>Temos uma oferta especial para você...</p>"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Criar
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
