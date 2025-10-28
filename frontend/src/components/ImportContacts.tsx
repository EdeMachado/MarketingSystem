import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

interface ImportContactsProps {
  onClose: () => void;
}

export default function ImportContacts({ onClose }: ImportContactsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const queryClient = useQueryClient();

  const importMutation = useMutation(
    async (formData: FormData) => {
      const res = await api.post('/import/contacts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    {
      onSuccess: (data) => {
        const { inserted, skipped, errors, total } = data.data;
        const message = `✅ ${inserted} inseridos, ${skipped} duplicados, ${errors} erros (Total: ${total})`;
        toast.success(message, { duration: 8000 });
        queryClient.invalidateQueries('contacts');
        setTimeout(() => onClose(), 2000);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Erro ao importar');
      },
    }
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Preview do arquivo
    if (selectedFile.name.endsWith('.csv')) {
      try {
        const text = await selectedFile.text();
        const lines = text.split('\n').slice(0, 6); // Primeiras 6 linhas (header + 5)
        const headers = lines[0]?.split(',').map((h: string) => h.trim()) || [];
        
        const previewData = lines.slice(1).map((line: string) => {
          const values = line.split(',').map((v: string) => v.trim());
          const obj: any = {};
          headers.forEach((header: string, idx: number) => {
            obj[header] = values[idx] || '';
          });
          return obj;
        }).filter((obj: any) => Object.keys(obj).length > 0);

        setPreview(previewData);
      } catch (error) {
        setPreview([{ message: 'Erro ao ler arquivo CSV' }]);
      }
    } else {
      // Para Excel, apenas mostrar nome do arquivo
      setPreview([{ message: 'Arquivo Excel selecionado. Preview disponível após importação.' }]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    setLoading(true);
    setProgress('Enviando arquivo...');
    
    importMutation.mutate(formData, {
      onSuccess: () => {
        setProgress('Importação concluída! Fechando...');
      },
      onSettled: () => {
        setLoading(false);
      },
      onError: () => {
        setProgress('');
      },
    });
    
    // Simular progresso para grandes arquivos
    if (file && file.size > 5 * 1024 * 1024) {
      setTimeout(() => setProgress('Processando arquivo grande... Isso pode levar alguns minutos.'), 2000);
      setTimeout(() => setProgress('Validando contatos e verificando duplicatas...'), 5000);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/import/template', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template-importacao.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Template baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar template');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-5">
          <h3 className="text-lg font-bold text-gray-900">
            Importar Contatos
          </h3>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o arquivo (CSV ou Excel)
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {preview.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview (primeiras 5 linhas)
              </label>
              <div className="border rounded-md overflow-auto max-h-48">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value: any, vIdx) => (
                          <td key={vIdx} className="px-3 py-2 text-sm text-gray-900">
                            {String(value || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Formato esperado:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Colunas: <strong>Nome</strong> (obrigatório), <strong>Email</strong> ou <strong>Telefone</strong> (pelo menos um), Empresa, Origem</li>
              <li>Primeira linha deve ter cabeçalho</li>
              <li>Suporta até <strong>100MB</strong> de arquivo</li>
              <li>Formatos: CSV, Excel (.xlsx, .xls)</li>
              <li><strong>75.000+ contatos? Sem problema!</strong> Sistema otimizado para grandes volumes</li>
            </ul>
          </div>

          {progress && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">{progress}</p>
              {loading && file && file.size > 5 * 1024 * 1024 && (
                <p className="text-xs text-blue-600 mt-1">
                  ⏳ Arquivos grandes (75k+) podem levar 5-10 minutos. Aguarde...
                </p>
              )}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800 font-medium">💡 Dica:</p>
            <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
              <li>Para 75.000+ contatos, o processo leva 5-10 minutos</li>
              <li>Não feche o navegador durante a importação</li>
              <li>Duplicatas são detectadas automaticamente</li>
              <li>Veja progresso no console do backend</li>
            </ul>
          </div>

          <div className="flex justify-between">
            <button
              onClick={downloadTemplate}
              disabled={loading}
              className="px-4 py-2 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50 disabled:opacity-50"
            >
              📥 Baixar Template
            </button>
            
            <div className="space-x-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (file && file.size > 5 * 1024 * 1024 ? '⏳ Processando...' : 'Importando...') : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

