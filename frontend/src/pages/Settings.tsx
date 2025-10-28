import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [testing, setTesting] = useState<string | null>(null);

  const testEmail = async () => {
    setTesting('email');
    try {
      const res = await api.get('/email/verify');
      if (res.data.success) {
        toast.success('Conexão de email verificada com sucesso!');
      } else {
        toast.error('Erro na conexão de email');
      }
    } catch (error: any) {
      toast.error('Erro ao verificar email: ' + (error.response?.data?.error || error.message));
    } finally {
      setTesting(null);
    }
  };

  const testWhatsApp = async () => {
    setTesting('whatsapp');
    try {
      const res = await api.get('/whatsapp/verify');
      toast.success(`WhatsApp: ${res.data.message || 'Verificado'}`);
    } catch (error: any) {
      toast.error('Erro ao verificar WhatsApp: ' + (error.response?.data?.error || error.message));
    } finally {
      setTesting(null);
    }
  };

  const testFacebook = async () => {
    setTesting('facebook');
    try {
      const res = await api.get('/social/facebook/verify');
      if (res.data.success) {
        toast.success('Conexão com Facebook verificada!');
      } else {
        toast.error(res.data.message || 'Erro na conexão');
      }
    } catch (error: any) {
      toast.error('Erro ao verificar Facebook: ' + (error.response?.data?.error || error.message));
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h2>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Integrações
        </h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">Email (SMTP)</h4>
                <p className="text-sm text-gray-500">
                  Configure suas credenciais SMTP no arquivo .env
                </p>
              </div>
              <button
                onClick={testEmail}
                disabled={testing === 'email'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {testing === 'email' ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">WhatsApp Business API</h4>
                <p className="text-sm text-gray-500">
                  Configure a URL da API, chave e ID da instância no .env
                </p>
              </div>
              <button
                onClick={testWhatsApp}
                disabled={testing === 'whatsapp'}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {testing === 'whatsapp' ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">Facebook & Instagram</h4>
                <p className="text-sm text-gray-500">
                  Configure tokens de acesso no arquivo .env
                </p>
              </div>
              <button
                onClick={testFacebook}
                disabled={testing === 'facebook'}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {testing === 'facebook' ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informações Importantes
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>⚠️ Atenção:</strong> O envio em massa pode violar termos de serviço de algumas
            plataformas. Use com responsabilidade e sempre obtenha consentimento dos destinatários.
          </p>
          <p>
            <strong>Email:</strong> Configure um servidor SMTP válido. Para Gmail, use senhas de app.
          </p>
          <p>
            <strong>WhatsApp:</strong> Use a API Business oficial ou serviços como Evolution API.
            Evite automações não oficiais que podem resultar em bloqueio.
          </p>
          <p>
            <strong>Redes Sociais:</strong> As APIs oficiais não permitem envio de mensagens diretas
            em massa. Use principalmente para postagens programadas.
          </p>
        </div>
      </div>
    </div>
  );
}

