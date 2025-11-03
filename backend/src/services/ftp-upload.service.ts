import * as fs from 'fs';
import * as path from 'path';
import { Client as FTPClient } from 'basic-ftp';

// Interface para configuração FTP
interface FTPConfig {
  host: string;
  user: string;
  password: string;
  path: string; // Caminho no servidor (ex: /public_html/)
  port?: number;
}

// Carregar configuração FTP do .env
const getFTPConfig = (): FTPConfig | null => {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASS;
  const ftpPath = process.env.FTP_PATH || '/public_html/';

  if (!host || !user || !password) {
    return null;
  }

  return {
    host,
    user,
    password,
    path: ftpPath,
    port: parseInt(process.env.FTP_PORT || '21'),
  };
};

/**
 * Upload de arquivo via FTP
 */
export const uploadFileToServer = async (
  localFilePath: string,
  remoteFilePath: string
): Promise<{ success: boolean; message: string; url?: string }> => {
  const config = getFTPConfig();

  if (!config) {
    return {
      success: false,
      message: 'FTP não configurado. Configure FTP_HOST, FTP_USER, FTP_PASS no .env',
    };
  }

  const ftp = new FTPClient();
  ftp.ftp.verbose = false; // Não mostrar logs detalhados

  try {
    // Verificar se arquivo local existe
    if (!fs.existsSync(localFilePath)) {
      return {
        success: false,
        message: `Arquivo local não encontrado: ${localFilePath}`,
      };
    }

    console.log(`📤 Conectando ao FTP: ${config.host}...`);

    // Conectar ao servidor FTP
    await ftp.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: false, // Usar FTP normal (true para FTPS)
    });

    console.log(`✅ Conectado ao FTP!`);

    // Navegar para o diretório correto
    const remoteDir = config.path.replace(/\/$/, ''); // Remover barra final
    const remoteFile = remoteFilePath.startsWith('/') ? remoteFilePath.substring(1) : remoteFilePath;

    try {
      await ftp.cd(remoteDir);
      console.log(`📂 Diretório: ${remoteDir}`);
    } catch (error) {
      console.log(`⚠️ Não conseguiu mudar para ${remoteDir}, tentando criar...`);
      // Tentar criar diretório se não existir
      try {
        await ftp.ensureDir(remoteDir);
      } catch {
        // Ignorar erro de criação
      }
    }

    // Fazer upload do arquivo
    console.log(`📤 Fazendo upload de ${remoteFile}...`);
    await ftp.uploadFrom(localFilePath, remoteFile);

    console.log(`✅ Upload concluído: ${remoteFile}`);

    // Fechar conexão
    ftp.close();

    const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';
    return {
      success: true,
      message: `Arquivo enviado com sucesso para o servidor!`,
      url: `${siteUrl}/${remoteFile}`,
    };
  } catch (error: any) {
    ftp.close();
    console.error(`❌ Erro no upload FTP:`, error.message);
    return {
      success: false,
      message: `Erro ao fazer upload: ${error.message}`,
    };
  }
};

/**
 * Upload de página SEO completa para o servidor
 */
export const uploadSeoPageToSite = async (
  htmlContent: string,
  slug: string
): Promise<{ success: boolean; message: string; url?: string }> => {
  const config = getFTPConfig();

  if (!config) {
    return {
      success: false,
      message: 'FTP não configurado. Página criada, mas não foi enviada ao site.',
    };
  }

  try {
    // Criar arquivo temporário
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${slug}.html`);
    fs.writeFileSync(tempFilePath, htmlContent, 'utf-8');

    // Fazer upload
    const remotePath = `${config.path}${slug}.html`;
    const result = await uploadFileToServer(tempFilePath, remotePath);

    // Limpar arquivo temporário
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (result.success) {
      const siteUrl = process.env.SITE_URL || 'https://grupobiomed.com';
      return {
        success: true,
        message: `Página enviada com sucesso para o servidor!`,
        url: `${siteUrl}/${slug}`,
      };
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao fazer upload: ${error.message}`,
    };
  }
};

/**
 * Verificar se FTP está configurado
 */
export const isFTPConfigured = (): boolean => {
  return !!getFTPConfig();
};

