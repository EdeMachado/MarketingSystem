import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  stats?: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
}

export default function Campaigns() {
  const [showModal, setShowModal] = useState(false);
  const [campaignType, setCampaignType] = useState('email');
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery('campaigns', async () => {
    const res = await api.get('/campaigns');
    return res.data.data as Campaign[];
  });

  const { data: contacts } = useQuery('contacts', async () => {
    const res = await api.get('/contacts?limit=10000');
    return res.data.data;
  });

  const { data: templates } = useQuery('templates', async () => {
    const res = await api.get('/templates');
    return res.data.data;
  });

  const createCampaign = useMutation(
    async (data: any) => {
      const res = await api.post('/campaigns', data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Campanha criada com sucesso!');
        queryClient.invalidateQueries('campaigns');
        setShowModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao criar campanha');
      },
    }
  );

  const executeCampaign = useMutation(
    async (id: string) => {
      const res = await api.post(`/campaigns/${id}/execute`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        const message = data.message || 'Campanha executada com sucesso!';
        if (data.data?.failed > 0) {
          toast.error(`${data.data.success} enviados, ${data.data.failed} falhas. ${data.data.failed > 0 ? 'Verifique configuração SMTP!' : ''}`, { duration: 8000 });
        } else {
          toast.success(message);
        }
        queryClient.invalidateQueries('campaigns');
      },
      onError: (error: any) => {
        const errorMsg = error.response?.data?.error || 'Erro ao executar campanha';
        
        // Mensagens mais claras sobre SMTP
        if (errorMsg.includes('SMTP não configurado')) {
          toast.error(
            '⚠️ SMTP não configurado! Configure no arquivo .env (veja COMO-CONFIGURAR-SMTP.md)', 
            { duration: 10000 }
          );
        } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('Invalid login')) {
          toast.error('❌ Erro de autenticação SMTP. Verifique usuário/senha no .env', { duration: 8000 });
        } else if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('timeout')) {
          toast.error('❌ Erro de conexão SMTP. Verifique SMTP_HOST e SMTP_PORT', { duration: 8000 });
        } else {
          toast.error(errorMsg, { duration: 8000 });
        }
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedContacts = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="contacts"]:checked')
    ).map((input) => input.value);

    if (selectedContacts.length === 0) {
      toast.error('Selecione pelo menos um contato!');
      return;
    }

    createCampaign.mutate({
      name: formData.get('name'),
      type: formData.get('type'),
      template: formData.get('template'),
      subject: formData.get('subject') || null,
      contactIds: selectedContacts,
    });
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Campanhas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          + Nova Campanha
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {campaigns?.map((campaign) => (
            <li key={campaign.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tipo: {campaign.type} | Status: {campaign.status}
                  </p>
                  {campaign.stats && (
                    <p className="text-sm text-gray-500 mt-1">
                      Enviados: {campaign.stats.sent} / {campaign.stats.total} | 
                      Falhas: {campaign.stats.failed}
                    </p>
                  )}
                </div>
                <div>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => executeCampaign.mutate(campaign.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2"
                    >
                      Executar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5">
              <h3 className="text-lg font-bold text-gray-900">
                Nova Campanha
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
                  Tipo *
                </label>
                <select
                  name="type"
                  required
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              {(campaignType === 'instagram' || campaignType === 'facebook') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem {campaignType === 'instagram' ? '*' : '(opcional)'}
                  </label>
                  <input
                    name="mediaUrl"
                    type="url"
                    required={campaignType === 'instagram'}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {campaignType === 'instagram' 
                      ? 'Instagram requer uma imagem para posts com foto.'
                      : 'Para Facebook, a imagem é opcional mas recomendada.'}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template *
                </label>
                {templates && Array.isArray(templates) && templates.length > 0 && (
                  <div className="mb-2">
                    <select
                      onChange={(e) => {
                        const selected = templates.find((t: any) => t.id === e.target.value);
                        if (selected) {
                          const textarea = document.querySelector('textarea[name="template"]') as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.value = selected.body || '';
                            // Se for email, também preencher o assunto
                            if (selected.subject && campaignType === 'email') {
                              const subjectInput = document.querySelector('input[name="subject"]') as HTMLInputElement;
                              if (subjectInput) {
                                subjectInput.value = selected.subject;
                              }
                            }
                          }
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                    >
                      <option value="">-- Selecionar template criado --</option>
                      {templates
                        .filter((t: any) => !campaignType || t.type === campaignType || campaignType === 'email')
                        .map((template: any) => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.type})
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mb-2">Ou digite manualmente abaixo</p>
                  </div>
                )}
                <textarea
                  name="template"
                  required
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  placeholder="Olá {{nome}}, temos uma oferta especial para você!&#10;&#10;Use {{nome}} para substituir pelo nome do contato."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Para HTML: use tags como &lt;h1&gt;, &lt;p&gt;, &lt;a&gt;, etc.
                </p>
              </div>

              {campaignType === 'email' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto do Email *
                  </label>
                  <input
                    name="subject"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Assunto do email"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecionar Contatos *
                </label>
                {contacts && Array.isArray(contacts) && contacts.length > 0 && (
                  <div className="mb-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        document.querySelectorAll<HTMLInputElement>('input[name="contacts"]').forEach((cb) => {
                          cb.checked = true;
                        });
                      }}
                      className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      Selecionar Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        document.querySelectorAll<HTMLInputElement>('input[name="contacts"]').forEach((cb) => {
                          cb.checked = false;
                        });
                      }}
                      className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {contacts && Array.isArray(contacts) && contacts.length > 0 ? (
                    contacts.map((contact: any) => {
                      const contactId = contact.id || String(contact);
                      const contactName = typeof contact.name === 'string' ? contact.name : 'Sem nome';
                      const contactInfo = typeof contact.email === 'string' 
                        ? contact.email 
                        : (typeof contact.phone === 'string' ? contact.phone : 'Sem contato');
                      
                      const hasEmail = typeof contact.email === 'string' && contact.email.trim() !== '';
                      const hasPhone = typeof contact.phone === 'string' && contact.phone.trim() !== '';
                      
                      return (
                        <label 
                          key={contactId} 
                          className={`flex items-center mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded border ${
                            campaignType === 'email' && !hasEmail ? 'opacity-50 bg-gray-100' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="contacts"
                            value={contactId}
                            disabled={campaignType === 'email' && !hasEmail}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{contactName}</span>
                            <div className="text-xs text-gray-500">
                              {hasEmail && <span>📧 {contact.email}</span>}
                              {hasEmail && hasPhone && <span> | </span>}
                              {hasPhone && <span>📱 {contact.phone}</span>}
                              {!hasEmail && !hasPhone && <span className="text-red-500">Sem email/telefone</span>}
                            </div>
                            {campaignType === 'email' && !hasEmail && (
                              <span className="text-xs text-red-500">⚠️ Sem email válido</span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 p-2">
                      Nenhum contato cadastrado. Adicione contatos primeiro na página de Contatos.
                    </p>
                  )}
                </div>
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

