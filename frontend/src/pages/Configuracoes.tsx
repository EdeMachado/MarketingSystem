import { useState } from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface ApiStatus {
  configured: boolean;
  connected?: boolean;
  message: string;
}

export default function Configuracoes() {
  const [testing, setTesting] = useState(false);
  const [domain, setDomain] = useState('')

  const { data: smtpStatus, refetch } = useQuery('smtp-check', async () => {
    const res = await api.get('/config/smtp/check');
    return res.data;
  });

  const { data: envConfig } = useQuery('env-config', async () => {
    const res = await api.get('/config/env');
    return res.data.data;
  });

  const { data: apiStatus } = useQuery<Record<string, ApiStatus>>('api-status', async () => {
    const res = await api.get('/api-config/status');
    return res.data.data;
  });

  const { data: deliverability, refetch: refetchDeliverability } = useQuery(['deliverability', domain], async () => {
    const res = await api.get('/config/deliverability', { params: { domain: domain || undefined } })
    return res.data
  })

  const testSMTP = async () => {
    setTesting(true);
    try {
      const res = await api.get('/config/smtp/check');
      if (res.data.success) {
        toast.success('✅ SMTP configurado e funcionando!');
      } else {
        toast.error('❌ SMTP não configurado ou com erro');
      }
      refetch();
    } catch (error: any) {
      toast.error('Erro ao verificar SMTP');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h2>
        <p className="text-gray-600 mt-2">Configure todas as integrações e APIs do sistema</p>
      </div>

      {/* Status de Todas as APIs */}
      {apiStatus && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status das Integrações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(apiStatus).map(([key, status]) => (
              <div
                key={key}
                className={`border-2 rounded-lg p-4 ${
                  status.configured && status.connected
                    ? 'border-green-300 bg-green-50'
                    : status.configured
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <span className="text-2xl">
                    {status.configured && status.connected
                      ? '✅'
                      : status.configured
                      ? '⚠️'
                      : '❌'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{status.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status SMTP */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Status da Configuração</h3>
          <button
            onClick={testSMTP}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testando...' : '🔄 Testar Conexão'}
          </button>
        </div>

        {smtpStatus?.configured ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <p className="text-green-800 font-medium">SMTP Configurado</p>
                <p className="text-green-700 text-sm mt-1">{smtpStatus.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <p className="text-yellow-800 font-medium">SMTP Não Configurado</p>
                <p className="text-yellow-700 text-sm mt-1">{smtpStatus?.message || 'Configure o SMTP para enviar emails'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Informações atuais */}
        {envConfig && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Configuração Atual:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">SMTP Host:</span>
                <span className="ml-2 font-mono">{envConfig.smtpHost}</span>
              </div>
              <div>
                <span className="text-gray-600">SMTP Port:</span>
                <span className="ml-2 font-mono">{envConfig.smtpPort}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">SMTP User:</span>
                <span className="ml-2 font-mono">{envConfig.smtpUser}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deliverability check */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Checklist de Entregabilidade (SPF/DMARC)</h3>
          <div className="flex items-center gap-2">
            <input
              placeholder="seu-dominio.com (opcional)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={() => refetchDeliverability()}>Verificar</button>
          </div>
        </div>
        <div className="text-sm text-gray-700">
          {deliverability?.success ? (
            <div className="space-y-2">
              <div><span className="font-medium">Domínio:</span> <span className="font-mono">{deliverability.data.domain}</span></div>
              <div>
                <span className="font-medium">SPF:</span>{' '}
                {deliverability.data.spf.exists ? (
                  <span className="text-green-700">Encontrado</span>
                ) : (
                  <span className="text-red-700">Não encontrado</span>
                )}
              </div>
              <div>
                <span className="font-medium">DMARC:</span>{' '}
                {deliverability.data.dmarc.exists ? (
                  <span className="text-green-700">Encontrado (política: {deliverability.data.dmarc.policy})</span>
                ) : (
                  <span className="text-red-700">Não encontrado</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Informe o domínio acima ou deixe em branco para usar o domínio do SMTP.</div>
          )}
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Como Configurar:</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">1. Criar Arquivo .env</h4>
            <p className="text-sm text-gray-600 mb-2">
              Na pasta <code className="bg-gray-100 px-1 rounded">marketing-system/backend/</code>, crie um arquivo chamado <code className="bg-gray-100 px-1 rounded">.env</code>
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">2. Para Gmail (Recomendado):</h4>
            <div className="bg-gray-50 rounded-md p-3 font-mono text-xs overflow-x-auto">
              <div>SMTP_HOST=smtp.gmail.com</div>
              <div>SMTP_PORT=587</div>
              <div>SMTP_USER=seu-email@gmail.com</div>
              <div>SMTP_PASS=sua-senha-de-app</div>
              <div>SMTP_FROM="Grupo Biomed &lt;seu-email@gmail.com&gt;"</div>
            </div>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">3. Criar Senha de App (Gmail):</h4>
            <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
              <li>Acesse: <a href="https://myaccount.google.com/security" target="_blank" className="text-blue-600 hover:underline">myaccount.google.com/security</a></li>
              <li>Ative <strong>Verificação em duas etapas</strong> (se não tiver)</li>
              <li>Vá em <strong>"Senhas de app"</strong></li>
              <li>Selecione <strong>"Email"</strong> e <strong>"Outro (personalizado)"</strong></li>
              <li>Digite "Marketing System"</li>
              <li>Clique em <strong>"Gerar"</strong></li>
              <li><strong>COPIE A SENHA</strong> (16 caracteres) e cole no .env</li>
            </ol>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">4. Reiniciar Backend:</h4>
            <p className="text-sm text-gray-600">
              Pare o backend (Ctrl+C) e inicie novamente com <code className="bg-gray-100 px-1 rounded">npm run dev</code>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>📄 Arquivo de exemplo:</strong> Veja <code className="bg-blue-100 px-1 rounded">backend/.env.example</code> ou <code className="bg-blue-100 px-1 rounded">backend/COMO-CONFIGURAR-SMTP.md</code>
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Importante:</strong> Use <strong>Senha de App</strong> do Gmail, NÃO sua senha normal! Senhas de app são específicas para aplicativos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

