import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import ImportContacts from '../components/ImportContacts';

export default function Contacts() {
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery('contacts', async () => {
    const res = await api.get('/contacts?limit=1000');
    return res.data.data;
  });

  const createContact = useMutation(
    async (data: any) => {
      const res = await api.post('/contacts', data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Contato criado com sucesso!');
        queryClient.invalidateQueries('contacts');
        setShowModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao criar contato');
      },
    }
  );

  const updateContact = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/contacts/${id}`, data);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Contato atualizado com sucesso!');
        queryClient.invalidateQueries('contacts');
        setEditingContact(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao atualizar contato');
      },
    }
  );

  const deleteContact = useMutation(
    async (id: string) => {
      const res = await api.delete(`/contacts/${id}`);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('Contato removido com sucesso!');
        queryClient.invalidateQueries('contacts');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao remover contato');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      source: formData.get('source') || 'manual',
    };

    if (editingContact) {
      updateContact.mutate({ id: editingContact.id, data });
    } else {
      createContact.mutate(data);
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleDelete = (contact: any) => {
    if (confirm(`Tem certeza que deseja excluir o contato "${contact.name}"?`)) {
      deleteContact.mutate(contact.id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {showImport && <ImportContacts onClose={() => setShowImport(false)} />}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Contatos</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowImport(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            📥 Importar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            + Novo Contato
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Origem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts && Array.isArray(contacts) && contacts.length > 0 ? (
              contacts.map((contact: any) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {contact.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar contato"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(contact)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir contato"
                        disabled={deleteContact.isLoading}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum contato encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
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
                    defaultValue={editingContact?.name || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingContact?.email || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingContact?.phone || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <input
                    name="company"
                    defaultValue={editingContact?.company || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Origem
                  </label>
                  <select
                    name="source"
                    defaultValue={editingContact?.source || 'manual'}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="manual">Manual</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="import">Importação</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createContact.isLoading || updateContact.isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createContact.isLoading || updateContact.isLoading
                      ? 'Salvando...'
                      : editingContact
                      ? '💾 Salvar'
                      : 'Criar'}
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

