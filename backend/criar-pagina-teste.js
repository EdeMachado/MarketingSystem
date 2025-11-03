/**
 * Script para criar página SEO de teste
 * Executa: node criar-pagina-teste.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function criarPaginaTeste() {
  try {
    console.log('🎯 Criando página SEO de teste...\n');

    // Dados da página de teste
    const paginaData = {
      title: 'Exame Admissional ASO - Tudo que você precisa saber | Grupo Biomed',
      metaDescription: 'Exame admissional ASO completo. Entenda a importância, documentos necessários e como realizar. Grupo Biomed oferece exames ocupacionais de qualidade.',
      slug: 'exame-admissional-aso',
      h1: 'Exame Admissional ASO: Guia Completo',
      h2s: [
        'O que é Exame Admissional?',
        'Importância do ASO na Contratação',
        'Documentos Necessários',
        'Como Realizar o Exame',
        'Grupo Biomed - Sua Melhor Escolha'
      ],
      content: `# Exame Admissional ASO - Tudo que você precisa saber

O **exame admissional ASO** (Atestado de Saúde Ocupacional) é uma etapa obrigatória no processo de contratação de funcionários no Brasil. Este documento é essencial para garantir a saúde e segurança dos trabalhadores desde o primeiro dia de trabalho.

## O que é Exame Admissional?

O exame admissional é realizado **antes** do funcionário começar a trabalhar na empresa. Ele avalia as condições de saúde do trabalhador para verificar se está apto para exercer a função para a qual foi contratado.

### Importância do ASO na Contratação

O ASO é **obrigatório** por lei (NR-7 - Programa de Controle Médico de Saúde Ocupacional) e tem como objetivos:

- **Proteger a saúde do trabalhador**: Identificar condições de saúde que possam ser agravadas pela função
- **Avaliar aptidão**: Verificar se o funcionário está apto para exercer a atividade
- **Prevenir acidentes**: Reduzir riscos no ambiente de trabalho
- **Cumprir a legislação**: Atender exigências trabalhistas e previdenciárias

### Documentos Necessários

Para realizar o exame admissional, você precisará:

- **Documento de identidade** (RG ou CNH)
- **CPF**
- **Carteira de trabalho** (CTPS)
- **Declaração da função** a ser exercida
- **Exames complementares** (se solicitados pelo médico)

### Como Realizar o Exame

O processo é simples:

1. **Agendamento**: Entre em contato conosco e agende seu exame
2. **Comparecimento**: Vá até nossa clínica no horário agendado
3. **Avaliação médica**: O médico ocupacional realizará a avaliação
4. **Emissão do ASO**: Receba seu atestado no mesmo dia

### Grupo Biomed - Sua Melhor Escolha

O **Grupo Biomed** é especializado em medicina ocupacional e oferece:

✅ Exames admissional, periódico e demissional
✅ Atendimento rápido e eficiente
✅ Equipamentos modernos
✅ Médicos especializados
✅ Preços competitivos

**Não deixe para a última hora!** Realize seu exame admissional com antecedência e garanta sua contratação sem problemas.

Entre em contato conosco e agende seu exame hoje mesmo!`,
      keywords: ['exame admissional', 'ASO', 'atestado de saúde ocupacional', 'exame admissional ASO', 'medicina ocupacional', 'grupo biomed'],
      contentType: 'article',
      status: 'published',
      wordCount: 350,
      readabilityScore: 85
    };

    console.log('📝 Enviando dados para API...');
    
    const response = await axios.post(`${API_URL}/api/seo/pages`, paginaData);

    if (response.data.success) {
      const page = response.data.data;
      console.log('\n✅ Página criada com sucesso!\n');
      console.log('📄 Detalhes da página:');
      console.log(`   Título: ${page.title}`);
      console.log(`   Slug: ${page.slug}`);
      console.log(`   URL: ${API_URL}/api/seo/pages/slug/${page.slug}/html`);
      console.log(`   Status: ${page.status}`);
      console.log('\n🔗 URLs disponíveis:');
      console.log(`   HTML completo: ${API_URL}/api/seo/pages/slug/${page.slug}/html`);
      console.log(`   Apenas conteúdo: ${API_URL}/api/seo/pages/slug/${page.slug}/content`);
      console.log(`   Preview: ${API_URL}/api/seo/pages/slug/${page.slug}/preview`);
      console.log('\n💡 Como usar no seu site:');
      console.log(`   <iframe src="${API_URL}/api/seo/pages/slug/${page.slug}/html" style="width:100%;height:600px;border:none;"></iframe>`);
    } else {
      console.error('❌ Erro ao criar página:', response.data);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro da API:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('❌ Erro de conexão:');
      console.error('   - O backend está rodando?');
      console.error('   - URL:', API_URL);
      console.error('   - Execute: cd backend && npm run dev');
    } else {
      console.error('❌ Erro:', error.message);
    }
    process.exit(1);
  }
}

// Executar
criarPaginaTeste();


