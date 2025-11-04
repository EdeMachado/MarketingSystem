require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEnrichment() {
  console.log('🔍 Debug: Verificando contatos e empresas...\n');

  // Contatos sem email
  const contactsWithoutEmail = await prisma.contact.findMany({
    where: { email: null },
    take: 5,
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
    },
  });

  console.log(`📋 Contatos sem email (mostrando 5 de ${contactsWithoutEmail.length}):`);
  for (const contact of contactsWithoutEmail) {
    console.log(`  - ${contact.name} (Empresa: ${contact.company || 'N/A'})`);
    
    // Verificar se a empresa tem website
    if (contact.company) {
      const company = await prisma.company.findFirst({
        where: { name: contact.company },
        select: { name: true, website: true },
      });
      
      if (company) {
        console.log(`    ✅ Empresa encontrada: ${company.name}`);
        if (company.website) {
          console.log(`    ✅ Website: ${company.website}`);
        } else {
          console.log(`    ❌ Empresa NÃO tem website`);
        }
      } else {
        console.log(`    ❌ Empresa "${contact.company}" NÃO encontrada no banco`);
      }
    } else {
      console.log(`    ❌ Contato NÃO tem empresa associada`);
    }
    console.log('');
  }

  // Estatísticas
  const total = await prisma.contact.count();
  const missingEmail = await prisma.contact.count({ where: { email: null } });
  const missingPhone = await prisma.contact.count({ where: { phone: null } });
  
  const companiesWithWebsite = await prisma.company.findMany({
    where: { website: { not: null } },
    select: { name: true },
  });
  const companyNamesWithWebsite = new Set(companiesWithWebsite.map(c => c.name));

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

  console.log('\n📊 Estatísticas:');
  console.log(`  Total de contatos: ${total}`);
  console.log(`  Sem email: ${missingEmail}`);
  console.log(`  Sem telefone: ${missingPhone}`);
  console.log(`  Empresas com website: ${companiesWithWebsite.length}`);
  console.log(`  Contatos que podem ser enriquecidos: ${canEnrich}`);
  console.log(`  Contatos sem email que podem ser enriquecidos: ${canEnrichWithEmail}`);

  await prisma.$disconnect();
}

debugEnrichment().catch(console.error);

