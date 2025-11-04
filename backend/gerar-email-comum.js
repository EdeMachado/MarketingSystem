require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const dns = require('dns').promises;

const prisma = new PrismaClient();

// Função para validar email (verificar se domínio tem MX)
async function validateEmailDomain(email) {
  try {
    const domain = email.split('@')[1];
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

// Gerar emails comuns e validar
async function generateCommonEmails(domain) {
  const commonPrefixes = [
    'contato',
    'contact',
    'info',
    'comercial',
    'vendas',
    'atendimento',
    'suporte',
    'sac',
    'faleconosco',
    'fale-conosco',
  ];

  return commonPrefixes.map(prefix => `${prefix}@${domain}`);
}

async function enrichWithCommonEmails() {
  console.log('🔍 Gerando emails comuns para contatos sem email...\n');

  // Buscar contatos sem email mas com empresa que tem website
  const contacts = await prisma.contact.findMany({
    where: { email: null },
    take: 100,
  });

  console.log(`📋 Encontrados ${contacts.length} contatos sem email\n`);

  // Buscar empresas com website
  const companiesWithWebsite = await prisma.company.findMany({
    where: { website: { not: null } },
    select: { name: true, website: true },
  });

  const companyWebsiteMap = new Map();
  companiesWithWebsite.forEach(c => {
    if (c.website) {
      try {
        const url = new URL(c.website);
        const domain = url.hostname.replace('www.', '');
        companyWebsiteMap.set(c.name, domain);
      } catch (e) {
        // Ignorar URLs inválidas
      }
    }
  });

  let enriched = 0;
  let tested = 0;

  for (const contact of contacts) {
    if (!contact.company) continue;
    
    const domain = companyWebsiteMap.get(contact.company);
    if (!domain) {
      console.log(`⚠️  ${contact.name}: Empresa "${contact.company}" não tem domínio`);
      continue;
    }

    console.log(`🔎 Testando emails para: ${contact.name} (${domain})`);
    
    const commonEmails = await generateCommonEmails(domain);
    let found = false;

    for (const email of commonEmails) {
      tested++;
      const hasMx = await validateEmailDomain(email);
      
      if (hasMx) {
        console.log(`  ✅ Email válido encontrado: ${email}`);
        
        // Atualizar contato
        await prisma.contact.update({
          where: { id: contact.id },
          data: { email },
        });
        
        enriched++;
        found = true;
        break;
      } else {
        console.log(`  ❌ Email sem MX: ${email}`);
      }
      
      // Delay para não sobrecarregar DNS
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!found) {
      console.log(`  ❌ Nenhum email comum válido para ${domain}`);
    }
    
    console.log('');
  }

  console.log(`\n✅ Enriquecimento concluído:`);
  console.log(`   Testados: ${tested} emails`);
  console.log(`   Encontrados: ${enriched} emails válidos`);
  console.log(`   Taxa de sucesso: ${tested > 0 ? ((enriched / tested) * 100).toFixed(1) : 0}%`);

  await prisma.$disconnect();
}

enrichWithCommonEmails().catch(console.error);

