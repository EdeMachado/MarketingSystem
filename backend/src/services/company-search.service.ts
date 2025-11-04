import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { isValidEmail, normalizePhone } from '../utils/validators';
import { enrichCompany, enrichContact, normalizeName, normalizeAddress } from './lead-enrichment.service';
import { trackTextSearch, trackPlaceDetails } from './api-usage-tracker.service';
import { extractSocialMediaFromWebsite, findWhatsAppBusiness } from './social-media-extractor.service';

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

      // Registrar busca de texto
      trackTextSearch();

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

        // Registrar busca de detalhes
        trackPlaceDetails();

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

        // Buscar redes sociais e WhatsApp do website
        let socialMedia: any = {};
        let whatsappFromSite: string | undefined;
        if (details?.website) {
          try {
            socialMedia = await extractSocialMediaFromWebsite(details.website);
            whatsappFromSite = await findWhatsAppBusiness(details.website, phone);
          } catch (error) {
            // Continuar mesmo se falhar
            console.log(`Erro ao buscar redes sociais: ${error}`);
          }
        }

        const company: CompanyData = {
          name: (details && details.name) || place.name,
          email,
          phone,
          whatsapp: whatsappFromSite || phone, // WhatsApp do site ou telefone
          address: details?.formatted_address,
          website: details?.website,
          source: 'google',
          metadata: {
            placeId: place.place_id,
            types: (details && details.types) || place.types,
            rating: place.rating,
            geometry: details?.geometry,
            socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : undefined, // LinkedIn, Instagram, Facebook, Telegram, etc
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
export const tryFindEmailFromWebsite = async (website: string): Promise<string | undefined> => {
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

        // Procurar por padrões de email usando múltiplos métodos
        const emailRegex = /[\w\.\-+]+@[\w\.\-]+\.[\w]{2,}/g;
        const htmlContent = response.data.toString();
        const foundEmails = new Set<string>();

        // Método 1: Regex simples no HTML bruto
        const emailsFromRegex = htmlContent.match(emailRegex) as string[] | null;
        if (emailsFromRegex) {
          emailsFromRegex.forEach(e => foundEmails.add(e.toLowerCase().trim()));
        }

        // Método 2: Cheerio - parsing HTML estruturado
        try {
          const $ = cheerio.load(htmlContent);
          
          // Buscar em links mailto:
          $('a[href^="mailto:"]').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
              const email = href.replace('mailto:', '').split('?')[0].toLowerCase().trim();
              if (email) foundEmails.add(email);
            }
          });

          // Buscar em textos visíveis (priorizar elementos de contato)
          const contactSelectors = [
            '.contact', '.contato', '.contact-info', '.contact-us',
            '#contact', '#contato', '#contact-info',
            '[class*="contact"]', '[class*="contato"]',
            '[id*="contact"]', '[id*="contato"]',
          ];

          contactSelectors.forEach(selector => {
            try {
              $(selector).find('*').each((i, el) => {
                const text = $(el).text();
                const matches = text.match(emailRegex);
                if (matches) {
                  matches.forEach(m => foundEmails.add(m.toLowerCase().trim()));
                }
              });
            } catch (e) {
              // Ignorar erros de seletor
            }
          });

          // Buscar em todo o body se não encontrou em contato
          if (foundEmails.size === 0) {
            $('body').find('*').each((i, el) => {
              const text = $(el).text();
              const matches = text.match(emailRegex);
              if (matches) {
                matches.forEach(m => foundEmails.add(m.toLowerCase().trim()));
              }
            });
          }

          // Buscar em atributos data-*
          $('[data-email], [data-contact], [data-info]').each((i, el) => {
            const email = $(el).attr('data-email') || $(el).attr('data-contact') || $(el).attr('data-info');
            if (email && email.includes('@')) {
              const matches = email.match(emailRegex);
              if (matches) {
                matches.forEach(m => foundEmails.add(m.toLowerCase().trim()));
              }
            }
          });

        } catch (cheerioError) {
          // Se Cheerio falhar, usar apenas regex
          console.log(`    ⚠️  Erro ao processar com Cheerio: ${cheerioError}`);
        }
        
        if (foundEmails.size > 0) {
          // Filtrar emails válidos
          const validEmails = Array.from(foundEmails)
            .filter((e) => {
              return isValidEmail(e) && 
                     !e.includes('example') && 
                     !e.includes('test') &&
                     !e.includes('noreply') &&
                     !e.includes('no-reply') &&
                     !e.includes('@example') &&
                     !e.endsWith('.png') &&
                     !e.endsWith('.jpg') &&
                     !e.endsWith('.gif') &&
                     !e.endsWith('.css') &&
                     !e.endsWith('.js');
            });
          
          if (validEmails.length > 0) {
            // Priorizar emails comuns de contato
            const contactEmails = validEmails.filter(e => 
              e.includes('contato') || 
              e.includes('contact') || 
              e.includes('info') ||
              e.includes('comercial') ||
              e.includes('vendas') ||
              e.includes('atendimento')
            );
            
            return contactEmails.length > 0 ? contactEmails[0] : validEmails[0];
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

      // Usar mesmo método melhorado da função acima
      const emailRegex = /[\w\.\-+]+@[\w\.\-]+\.[\w]{2,}/g;
      const htmlContent = response.data.toString();
      const foundEmails = new Set<string>();

      // Método 1: Regex simples
      const emailsFromRegex = htmlContent.match(emailRegex) as string[] | null;
      if (emailsFromRegex) {
        emailsFromRegex.forEach(e => foundEmails.add(e.toLowerCase().trim()));
      }

      // Método 2: Cheerio
      try {
        const $ = cheerio.load(htmlContent);
        
        // Links mailto:
        $('a[href^="mailto:"]').each((i, el) => {
          const href = $(el).attr('href');
          if (href) {
            const email = href.replace('mailto:', '').split('?')[0].toLowerCase().trim();
            if (email) foundEmails.add(email);
          }
        });

        // Textos visíveis
        $('body').find('*').each((i, el) => {
          const text = $(el).text();
          const matches = text.match(emailRegex);
          if (matches) {
            matches.forEach(m => foundEmails.add(m.toLowerCase().trim()));
          }
        });
      } catch (e) {
        // Ignorar erro
      }
      
      if (foundEmails.size > 0) {
        const validEmails = Array.from(foundEmails)
          .filter((e) => {
            return isValidEmail(e) && 
                   !e.includes('example') && 
                   !e.includes('test') &&
                   !e.includes('noreply') &&
                   !e.includes('no-reply') &&
                   !e.includes('@example') &&
                   !e.endsWith('.png') &&
                   !e.endsWith('.jpg') &&
                   !e.endsWith('.gif') &&
                   !e.endsWith('.css') &&
                   !e.endsWith('.js');
          });
        
        if (validEmails.length > 0) {
          const contactEmails = validEmails.filter(e => 
            e.includes('contato') || 
            e.includes('contact') || 
            e.includes('info') ||
            e.includes('comercial') ||
            e.includes('vendas') ||
            e.includes('atendimento')
          );
          
          return contactEmails.length > 0 ? contactEmails[0] : validEmails[0];
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

// Salvar em Company com deduplicação básica (website ou nome+endereço)
const upsertCompany = async (company: CompanyData) => {
  const website = company.website || null;
  const name = company.name;
  const address = company.address || null;

  // Tentar deduplicar por website
  let existing = null as any;
  if (website) {
    existing = await prisma.company.findFirst({ where: { website } });
  }
  // Se não achou, deduplicar por (nome + address)
  if (!existing && name && address) {
    const nn = normalizeName(name) || name
    const na = normalizeAddress(address) || address
    existing = await prisma.company.findFirst({
      where: {
        OR: [
          { name, address },
          { normalizedName: nn, normalizedAddress: na },
        ],
      },
    });
  }

  if (existing) {
    const enriched = await enrichCompany({
      ...existing,
      name: company.name,
      email: company.email || existing.email,
      phone: company.phone || existing.phone,
      whatsapp: company.whatsapp || existing.whatsapp,
      website: website || existing.website,
      address: address || existing.address,
      city: company.city || existing.city,
      state: company.state || existing.state,
      zipCode: company.zipCode || existing.zipCode,
      source: company.source || existing.source,
      metadata: existing.metadata,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      id: existing.id,
      emailValid: existing.emailValid,
      emailValidatedAt: existing.emailValidatedAt,
      whatsappDetected: existing.whatsappDetected,
      enrichedAt: existing.enrichedAt,
      normalizedName: existing.normalizedName,
      normalizedAddress: existing.normalizedAddress,
    } as any)

    await prisma.company.update({
      where: { id: existing.id },
      data: {
        email: company.email || existing.email,
        phone: company.phone || existing.phone,
        whatsapp: company.whatsapp || existing.whatsapp,
        website: website || existing.website,
        address: address || existing.address,
        city: company.city || existing.city,
        state: company.state || existing.state,
        zipCode: company.zipCode || existing.zipCode,
        source: company.source || existing.source,
        metadata: JSON.stringify({
          ...(existing.metadata ? JSON.parse(existing.metadata) : {}),
          ...(company.metadata || {}),
        }),
        ...enriched,
      },
    });
    return { updated: true };
  } else {
    const enriched = await enrichCompany({
      id: '' as any,
      name: company.name,
      email: company.email || null,
      phone: company.phone || null,
      whatsapp: company.whatsapp || null,
      website,
      address,
      city: company.city || null,
      state: company.state || null,
      zipCode: company.zipCode || null,
      source: company.source,
      metadata: company.metadata ? JSON.stringify(company.metadata) : null,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      emailValid: null as any,
      emailValidatedAt: null as any,
      whatsappDetected: null as any,
      enrichedAt: null as any,
      normalizedName: null as any,
      normalizedAddress: null as any,
    })

    await prisma.company.create({
      data: {
        name: company.name,
        email: company.email || null,
        phone: company.phone || null,
        whatsapp: company.whatsapp || null,
        website,
        address,
        city: company.city || null,
        state: company.state || null,
        zipCode: company.zipCode || null,
        source: company.source,
        metadata: company.metadata ? JSON.stringify(company.metadata) : null,
        ...enriched,
      },
    });
    return { created: true };
  }
};

// Validar e importar empresas automaticamente (Contact + Company)
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
        // Mesmo que contato exista, garantir atualização/criação da Company
        await upsertCompany(company);
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
      const created = await prisma.contact.create({
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
            ...(company.metadata || {}),
          }),
        },
      });

      // Enriquecer contato recém-criado
      const enrichedContact = await enrichContact(created as any)
      if (Object.keys(enrichedContact).length) {
        await prisma.contact.update({ where: { id: created.id }, data: enrichedContact })
      }

      // Criar/atualizar Company
      await upsertCompany({ ...company, city, state });

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

  // Importar como contatos + empresas
  const result = await importCompaniesAsContacts(companies, 'email');

  return {
    found: companies.length,
    imported: result.imported,
    duplicates: result.duplicates,
    errors: result.errors,
    companies,
  };
};

