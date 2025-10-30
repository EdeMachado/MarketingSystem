import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { isValidEmail, normalizePhone } from '../utils/validators';

const prisma = new PrismaClient();

interface CompanySearchParams {
  query: string; // Nome da empresa ou tipo de negócio
  location?: string; // Cidade, estado, CEP ou endereço
  radius?: number; // Raio em metros (default: 5000)
  maxResults?: number; // Máximo de resultados (default: 50)
  niche?: string; // Nicho/segmento específico
}

interface CompanyData {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  source: string; // 'google', 'yellowpages', 'linkedin', etc
  metadata?: Record<string, any>;
}

// Buscar empresas no Google Places API
export const searchGooglePlaces = async (params: CompanySearchParams): Promise<CompanyData[]> => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  GOOGLE_PLACES_API_KEY não configurado');
    console.warn('📖 Veja: COMO-OBTER-GOOGLE-PLACES-API.md');
    console.warn('🔗 Ou: https://console.cloud.google.com/ -> Ativar Places API -> Criar API Key');
    return [];
  }

  try {
    const results: CompanyData[] = [];
    const { query, location, radius = 5000, maxResults = 50 } = params;

    // Buscar lugares próximos
    const searchQuery = location ? `${query} em ${location}` : query;

    // Helper para esperar (necessário antes de usar next_page_token)
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let pageToken: string | undefined = undefined;
    let pagesFetched = 0;

    while (results.length < maxResults && pagesFetched < 3) {
      // Montar parâmetros da requisição
      const requestParams: any = {
        key: apiKey,
        language: 'pt-BR',
      };

      if (pageToken) {
        requestParams.pagetoken = pageToken;
      } else {
        requestParams.query = searchQuery;
        if (radius) requestParams.radius = radius;
      }

      // Para páginas após a primeira, aguardar ~2s por exigência do Google
      if (pageToken) {
        await delay(2000);
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: requestParams,
      });

      const pageResults = response.data.results || [];

      if (pageResults.length === 0) {
        break;
      }

      // Fatiar para não exceder maxResults
      const remaining = maxResults - results.length;
      const slice = pageResults.slice(0, remaining);

      for (const place of slice) {
        // Buscar detalhes completos do lugar
        const detailsResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/place/details/json',
          {
            params: {
              place_id: place.place_id,
              key: apiKey,
              fields: 'name,formatted_phone_number,formatted_address,website,types,geometry',
              language: 'pt-BR',
            },
          }
        );

        const details = detailsResponse.data.result;
        
        // Tentar encontrar email no website (se houver)
        let email: string | undefined;
        if (details?.website) {
          email = await tryFindEmailFromWebsite(details.website);
        }

        // Normalizar telefone
        let phone = details?.formatted_phone_number;
        if (phone) {
          phone = normalizePhone(phone);
        }

        const company: CompanyData = {
          name: (details && details.name) || place.name,
          email,
          phone,
          whatsapp: phone, // Assumir que telefone pode ser WhatsApp
          address: details?.formatted_address,
          website: details?.website,
          source: 'google',
          metadata: {
            placeId: place.place_id,
            types: (details && details.types) || place.types,
            rating: place.rating,
            geometry: details?.geometry,
          },
        };

        results.push(company);

        if (results.length >= maxResults) {
          break;
        }
      }

      pagesFetched += 1;

      // Preparar próxima página
      if (response.data.next_page_token && results.length < maxResults) {
        pageToken = response.data.next_page_token;
      } else {
        break;
      }
    }

    return results;
  } catch (error: any) {
    console.error('Erro ao buscar no Google Places:', error.message);
    return [];
  }
};

// Buscar empresas genéricas por região
export const searchCompaniesByRegion = async (params: CompanySearchParams): Promise<CompanyData[]> => {
  const results: CompanyData[] = [];

  // Buscar no Google Places
  const googleResults = await searchGooglePlaces(params);
  results.push(...googleResults);

  // Adicionar outras fontes aqui no futuro:
  // - Yellow Pages
  // - Facebook Business
  // - LinkedIn
  
  return results;
};

// Tentar encontrar email em um website
const tryFindEmailFromWebsite = async (website: string): Promise<string | undefined> => {
  try {
    // Padrões comuns de páginas de contato
    const contactPages = [
      '/contato',
      '/contact',
      '/fale-conosco',
      '/contact-us',
    ];

    for (const page of contactPages) {
      try {
        const url = website.replace(/\/$/, '') + page;
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        // Procurar por padrões de email
        const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
        const emails = response.data.match(emailRegex);
        
        if (emails && emails.length > 0) {
          // Retornar primeiro email válido
          for (const email of emails) {
            if (isValidEmail(email) && !email.includes('example') && !email.includes('test')) {
              return email.toLowerCase();
            }
          }
        }
      } catch {
        // Continuar tentando outras páginas
        continue;
      }
    }

    // Se não encontrou, tentar página principal
    try {
      const response = await axios.get(website, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
      const emails = response.data.match(emailRegex);
      
      if (emails && emails.length > 0) {
        for (const email of emails) {
          if (isValidEmail(email) && !email.includes('example') && !email.includes('test')) {
            return email.toLowerCase();
          }
        }
      }
    } catch {
      // Ignorar erros
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
};

// Validar e importar empresas automaticamente
export const importCompaniesAsContacts = async (
  companies: CompanyData[],
  source: string = 'email'
): Promise<{ imported: number; duplicates: number; errors: number }> => {
  let imported = 0;
  let duplicates = 0;
  let errors = 0;

  for (const company of companies) {
    try {
      // Verificar se já existe por email ou telefone
      let existingContact = null;

      if (company.email) {
        existingContact = await prisma.contact.findFirst({
          where: { email: company.email },
        });
      }

      if (!existingContact && company.phone) {
        existingContact = await prisma.contact.findFirst({
          where: { phone: company.phone },
        });
      }

      if (existingContact) {
        duplicates++;
        continue;
      }

      // Extrair cidade e estado do endereço se não tiver
      let city = company.city;
      let state = company.state;

      if (!city && company.address) {
        const parts = company.address.split(',');
        if (parts.length >= 2) {
          city = parts[parts.length - 2].trim();
          state = parts[parts.length - 1].trim();
        }
      }

      // Criar contato
      await prisma.contact.create({
        data: {
          name: company.name,
          email: company.email || null,
          phone: company.phone || null,
          company: company.name,
          source,
          status: 'active',
          metadata: JSON.stringify({
            address: company.address,
            city,
            state,
            zipCode: company.zipCode,
            website: company.website,
            searchSource: company.source,
            importedAt: new Date().toISOString(),
            ...company.metadata,
          }),
        },
      });

      imported++;
    } catch (error: any) {
      console.error(`Erro ao importar empresa ${company.name}:`, error.message);
      errors++;
    }
  }

  return { imported, duplicates, errors };
};

// Buscar e importar automaticamente
export const searchAndImportCompanies = async (
  params: CompanySearchParams
): Promise<{
  found: number;
  imported: number;
  duplicates: number;
  errors: number;
  companies: CompanyData[];
}> => {
  // Buscar empresas
  const companies = await searchCompaniesByRegion(params);

  // Importar como contatos
  const result = await importCompaniesAsContacts(companies, 'email');

  return {
    found: companies.length,
    imported: result.imported,
    duplicates: result.duplicates,
    errors: result.errors,
    companies,
  };
};

