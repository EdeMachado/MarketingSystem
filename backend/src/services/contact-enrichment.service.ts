import { PrismaClient } from '@prisma/client';
import { tryFindEmailFromWebsite } from './company-search.service';
import { findWhatsAppBusiness } from './social-media-extractor.service';
import { isValidEmail, normalizePhone } from '../utils/validators';

const prisma = new PrismaClient();

interface EnrichmentResult {
  contactId: string;
  name: string;
  emailFound: boolean;
  phoneFound: boolean;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  errors?: string[];
}

/**
 * Enriquecer um contato buscando informações faltantes no site da empresa
 */
export async function enrichContactFromWebsite(
  contactId: string
): Promise<EnrichmentResult> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!contact) {
    throw new Error('Contato não encontrado');
  }

  const result: EnrichmentResult = {
    contactId: contact.id,
    name: contact.name,
    emailFound: false,
    phoneFound: false,
  };

  const errors: string[] = [];

  // Buscar empresa pelo nome da empresa do contato
  let website: string | null = null;
  if (contact.company) {
    const company = await prisma.company.findFirst({
      where: { 
        name: contact.company,
        website: { not: null },
      },
      select: { website: true },
    });
    if (company?.website) {
      website = company.website;
    }
  }

  // Se não tem website, não pode enriquecer
  if (!website) {
    errors.push('Contato não possui website associado');
    result.errors = errors;
    return result;
  }

  result.website = website;

  // Buscar email se não tiver
  if (!contact.email && website) {
    try {
      console.log(`    📧 Buscando email no site: ${website}`);
      const email = await tryFindEmailFromWebsite(website);
      if (email && isValidEmail(email)) {
        console.log(`    ✅ Email encontrado: ${email}`);
        result.email = email;
        result.emailFound = true;
        
        // Atualizar contato
        await prisma.contact.update({
          where: { id: contactId },
          data: { email },
        });
        console.log(`    ✅ Contato atualizado com email: ${contact.name}`);
      } else {
        console.log(`    ❌ Nenhum email válido encontrado no site: ${website}`);
        console.log(`    💡 Dica: Site pode usar formulário de contato ou proteger email contra spam`);
        errors.push('Email não encontrado no site');
      }
    } catch (error: any) {
      console.error(`    ❌ Erro ao buscar email: ${error.message}`);
      errors.push(`Erro ao buscar email: ${error.message}`);
    }
  } else if (!website) {
    console.log(`    ⚠️  Contato não tem website, pulando busca de email`);
  } else if (contact.email) {
    console.log(`    ℹ️  Contato já tem email: ${contact.email}`);
  }

  // Buscar telefone/WhatsApp se não tiver
  if (!contact.phone && website) {
    try {
      console.log(`    📱 Buscando telefone/WhatsApp no site: ${website}`);
      // Tentar buscar WhatsApp do site
      const whatsapp = await findWhatsAppBusiness(website);
      if (whatsapp) {
        console.log(`    ✅ Telefone encontrado: ${whatsapp}`);
        result.whatsapp = whatsapp;
        result.phone = whatsapp;
        result.phoneFound = true;
        
        // Atualizar contato
        await prisma.contact.update({
          where: { id: contactId },
          data: { 
            phone: whatsapp,
            whatsappDetected: true as any,
          },
        });
        console.log(`    ✅ Contato atualizado com telefone: ${contact.name}`);
      } else {
        console.log(`    ❌ Nenhum telefone encontrado no site: ${website}`);
        errors.push('Telefone não encontrado no site');
      }
    } catch (error: any) {
      console.error(`    ❌ Erro ao buscar telefone: ${error.message}`);
      errors.push(`Erro ao buscar telefone: ${error.message}`);
    }
  } else if (!website) {
    console.log(`    ⚠️  Contato não tem website, pulando busca de telefone`);
  } else if (contact.phone) {
    console.log(`    ℹ️  Contato já tem telefone: ${contact.phone}`);
  }

  if (errors.length > 0) {
    result.errors = errors;
  }

  return result;
}

/**
 * Enriquecer múltiplos contatos em massa
 */
export async function enrichContactsBulk(
  filters?: {
    missingEmail?: boolean;
    missingPhone?: boolean;
    hasWebsite?: boolean;
    limit?: number;
  }
): Promise<{
  total: number;
  processed: number;
  enriched: number;
  results: EnrichmentResult[];
  errors: string[];
}> {
  const where: any = {};

  // Filtrar contatos que precisam de enriquecimento
  if (filters?.missingEmail) {
    where.email = null;
  }

  if (filters?.missingPhone) {
    where.phone = null;
  }

  // Buscar contatos
  const contacts = await prisma.contact.findMany({
    where,
    take: filters?.limit || 100,
  });

  // Buscar empresas com website para os contatos
  const companyNames = [...new Set(contacts.map(c => c.company).filter(Boolean))] as string[];
  const companies = await prisma.company.findMany({
    where: {
      name: { in: companyNames },
      website: { not: null },
    },
    select: { name: true, website: true },
  });

  const companyWebsiteMap = new Map(companies.map(c => [c.name, c.website]));

  // Filtrar apenas os que têm website
  const contactsWithWebsite = contacts.filter(
    (c) => c.company && companyWebsiteMap.has(c.company) && companyWebsiteMap.get(c.company)
  );

  const results: EnrichmentResult[] = [];
  const errors: string[] = [];
  let enriched = 0;

  // Processar em lotes para não sobrecarregar
  const BATCH_SIZE = 10;
  console.log(`🔍 Iniciando enriquecimento de ${contactsWithWebsite.length} contatos...`);
  
  for (let i = 0; i < contactsWithWebsite.length; i += BATCH_SIZE) {
    const batch = contactsWithWebsite.slice(i, i + BATCH_SIZE);
    console.log(`📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} contatos)...`);

    // Processar em paralelo (mas com limite)
    const batchPromises = batch.map(async (contact) => {
      try {
        console.log(`  🔎 Enriquecendo: ${contact.name} (${contact.company})`);
        const result = await enrichContactFromWebsite(contact.id);
        
        if (result.emailFound) {
          console.log(`    ✅ Email encontrado: ${result.email}`);
        } else if (result.errors?.some(e => e.includes('website'))) {
          console.log(`    ⚠️  Sem website: ${contact.name}`);
        } else if (!contact.email) {
          console.log(`    ❌ Email não encontrado no site`);
        }
        
        if (result.phoneFound) {
          console.log(`    ✅ Telefone encontrado: ${result.phone}`);
        }
        
        // Contar apenas uma vez por contato enriquecido
        if (result.emailFound || result.phoneFound) {
          enriched++;
        }
        return result;
      } catch (error: any) {
        console.error(`    ❌ Erro: ${error.message}`);
        errors.push(`Erro ao enriquecer ${contact.name}: ${error.message}`);
        return {
          contactId: contact.id,
          name: contact.name,
          emailFound: false,
          phoneFound: false,
          errors: [error.message],
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay entre lotes para não sobrecarregar os sites
    if (i + BATCH_SIZE < contactsWithWebsite.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`✅ Enriquecimento concluído: ${enriched} contatos enriquecidos de ${contactsWithWebsite.length} processados`);

  return {
    total: contacts.length,
    processed: contactsWithWebsite.length,
    enriched,
    results,
    errors,
  };
}

/**
 * Estatísticas de contatos que precisam de enriquecimento
 */
export async function getEnrichmentStats() {
  const total = await prisma.contact.count();
  
  const missingEmail = await prisma.contact.count({
    where: { email: null },
  });

  const missingPhone = await prisma.contact.count({
    where: { phone: null },
  });

  // Buscar empresas com website
  const companiesWithWebsite = await prisma.company.findMany({
    where: { website: { not: null } },
    select: { name: true },
  });
  const companyNamesWithWebsite = new Set(companiesWithWebsite.map(c => c.name));

  // Contatos com empresa que tem website (podem ser enriquecidos)
  const canEnrich = await prisma.contact.count({
    where: {
      company: { in: Array.from(companyNamesWithWebsite) },
    },
  });

  const canEnrichWithEmail = await prisma.contact.count({
    where: {
      email: null,
      company: { in: Array.from(companyNamesWithWebsite) },
    },
  });

  const canEnrichWithPhone = await prisma.contact.count({
    where: {
      phone: null,
      company: { in: Array.from(companyNamesWithWebsite) },
    },
  });

  return {
    total,
    missingEmail,
    missingPhone,
    canEnrich,
    canEnrichWithEmail,
    canEnrichWithPhone,
  };
}

