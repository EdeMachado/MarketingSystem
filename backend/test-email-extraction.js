require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');

// Teste de extração de email de um site específico
const testSite = process.argv[2] || 'http://www.facobras.com.br/';

console.log(`🔍 Testando extração de email do site: ${testSite}\n`);

async function testEmailExtraction(website) {
  try {
    // Normalizar URL
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Páginas de contato
    const contactPages = [
      '',
      '/contato',
      '/contact',
      '/fale-conosco',
      '/contact-us',
      '/sobre',
      '/sobre-nos',
    ];

    for (const page of contactPages) {
      try {
        const pageUrl = url.replace(/\/$/, '') + page;
        console.log(`📄 Tentando: ${pageUrl}`);
        
        const response = await axios.get(pageUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const html = response.data.toString();
        console.log(`   ✅ Página carregada (${html.length} caracteres)`);

        // Método 1: Regex simples
        const emailRegex = /[\w\.\-+]+@[\w\.\-]+\.[\w]{2,}/g;
        const emailsRegex = html.match(emailRegex);
        console.log(`   📧 Emails encontrados (regex): ${emailsRegex ? emailsRegex.length : 0}`);
        if (emailsRegex) {
          emailsRegex.forEach(e => console.log(`      - ${e}`));
        }

        // Método 2: Cheerio (parsing HTML)
        try {
          const $ = cheerio.load(html);
          
          // Buscar em links mailto:
          const mailtoLinks = [];
          $('a[href^="mailto:"]').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
              const email = href.replace('mailto:', '').split('?')[0];
              mailtoLinks.push(email);
            }
          });
          console.log(`   📧 Links mailto: encontrados: ${mailtoLinks.length}`);
          if (mailtoLinks.length > 0) {
            mailtoLinks.forEach(e => console.log(`      - ${e}`));
          }

          // Buscar em textos visíveis
          const textEmails = [];
          $('body').find('*').each((i, el) => {
            const text = $(el).text();
            const matches = text.match(emailRegex);
            if (matches) {
              matches.forEach(m => {
                if (!textEmails.includes(m)) {
                  textEmails.push(m);
                }
              });
            }
          });
          console.log(`   📧 Emails no texto: ${textEmails.length}`);
          if (textEmails.length > 0) {
            textEmails.forEach(e => console.log(`      - ${e}`));
          }

          // Buscar em atributos (data-email, etc)
          const attrEmails = [];
          $('[data-email], [data-contact], [data-info]').each((i, el) => {
            const email = $(el).attr('data-email') || $(el).attr('data-contact') || $(el).attr('data-info');
            if (email && email.includes('@')) {
              attrEmails.push(email);
            }
          });
          console.log(`   📧 Emails em atributos: ${attrEmails.length}`);
          if (attrEmails.length > 0) {
            attrEmails.forEach(e => console.log(`      - ${e}`));
          }

          // Buscar em meta tags
          const metaEmails = [];
          $('meta').each((i, el) => {
            const content = $(el).attr('content');
            if (content && content.includes('@')) {
              const matches = content.match(emailRegex);
              if (matches) {
                matches.forEach(m => metaEmails.push(m));
              }
            }
          });
          console.log(`   📧 Emails em meta tags: ${metaEmails.length}`);
          if (metaEmails.length > 0) {
            metaEmails.forEach(e => console.log(`      - ${e}`));
          }

        } catch (cheerioError) {
          console.log(`   ⚠️  Erro ao processar com Cheerio: ${cheerioError.message}`);
        }

        // Se encontrou algo, retornar
        if (emailsRegex && emailsRegex.length > 0) {
          console.log(`\n✅ Email encontrado na página: ${pageUrl}`);
          return emailsRegex[0];
        }

      } catch (pageError) {
        console.log(`   ❌ Erro ao acessar página: ${pageError.message}`);
        continue;
      }
    }

    console.log(`\n❌ Nenhum email encontrado no site`);
    return null;

  } catch (error) {
    console.error(`❌ Erro geral: ${error.message}`);
    return null;
  }
}

testEmailExtraction(testSite).then(email => {
  if (email) {
    console.log(`\n✅ Email encontrado: ${email}`);
  } else {
    console.log(`\n❌ Nenhum email encontrado`);
  }
  process.exit(0);
}).catch(console.error);

