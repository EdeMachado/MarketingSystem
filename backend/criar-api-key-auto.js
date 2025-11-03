// Script AUTOMÁTICO para criar Google Places API Key
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   🔑 ASSISTENTE AUTOMÁTICO - GOOGLE PLACES API KEY     ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

const envPath = path.join(__dirname, '.env');
let envContent = '';

// Ler arquivo .env
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Arquivo .env encontrado\n');
} else {
  console.log('⚠️  Arquivo .env não encontrado. Criando...\n');
  // Criar .env básico
  envContent = `# Database
DATABASE_URL="file:./prisma/dev.db"

# Server
PORT=3001
NODE_ENV=development

`;
  fs.writeFileSync(envPath, envContent, 'utf8');
}

// Verificar API Key atual
const apiKeyMatch = envContent.match(/GOOGLE_PLACES_API_KEY=(.+)/);
const currentKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (currentKey && currentKey.length > 20 && !currentKey.includes('sua-chave')) {
  console.log('📍 API Key encontrada no .env:', currentKey.substring(0, 20) + '...\n');
  console.log('🧪 Testando API Key atual...\n');
  
  // Testar a chave
  testApiKey(currentKey);
} else {
  console.log('❌ API Key não encontrada ou inválida\n');
  showInstructions();
}

function testApiKey(apiKey) {
  axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
    params: {
      query: 'clinicas saude São Paulo',
      key: apiKey,
      language: 'pt-BR',
    },
    timeout: 10000,
  })
    .then((response) => {
      if (response.data.status === 'OK') {
        console.log('✅ SUCESSO! API Key está funcionando perfeitamente!');
        console.log('   Resultados de teste:', response.data.results?.length || 0, 'empresas encontradas\n');
        console.log('🎉 Tudo configurado! Você pode usar a busca de empresas no sistema.\n');
      } else if (response.data.status === 'REQUEST_DENIED') {
        console.log('⚠️  API Key existe mas requer FATURAMENTO ATIVADO\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 PRÓXIMO PASSO OBRIGATÓRIO:\n');
        console.log('1️⃣  ATIVAR FATURAMENTO:');
        console.log('   🔗 https://console.cloud.google.com/project/_/billing/enable\n');
        console.log('2️⃣  Passos:');
        console.log('   - Vincule um cartão (obrigatório, mas você tem $200 grátis!)');
        console.log('   - Aguarde 2-3 minutos');
        console.log('   - Reinicie o backend');
        console.log('   - Teste novamente\n');
        console.log('💰 Lembre-se: Você só paga se passar de $200/mês');
        console.log('   (muito difícil acontecer!)\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else if (response.data.status === 'INVALID_REQUEST') {
        console.log('⚠️  API Key inválida ou Places API não está ativada\n');
        showInstructions();
      } else {
        console.log('⚠️  Status:', response.data.status);
        if (response.data.error_message) {
          console.log('   Mensagem:', response.data.error_message, '\n');
        }
        showInstructions();
      }
    })
    .catch((error) => {
      if (error.response) {
        const data = error.response.data;
        if (data?.status === 'REQUEST_DENIED') {
          console.log('⚠️  API Key existe mas requer FATURAMENTO ATIVADO\n');
          console.log('🔗 Ative aqui: https://console.cloud.google.com/project/_/billing/enable\n');
        } else {
          console.log('❌ Erro ao testar:', data?.error_message || error.message);
          showInstructions();
        }
      } else {
        console.log('❌ Erro de conexão:', error.message);
        console.log('   Verifique sua internet\n');
      }
    });
}

function showInstructions() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 COMO CRIAR SUA API KEY\n');
  
  console.log('🔗 LINKS DIRETOS:\n');
  console.log('1️⃣  Criar Projeto:');
  console.log('   https://console.cloud.google.com/projectcreate\n');
  
  console.log('2️⃣  Ativar Places API (OBRIGATÓRIO!):');
  console.log('   https://console.cloud.google.com/apis/library?q=places');
  console.log('   ✅ Ative: "Places API" e "Places API (New)"\n');
  
  console.log('3️⃣  Criar API Key:');
  console.log('   https://console.cloud.google.com/apis/credentials');
  console.log('   Clique: "+ CRIAR CREDENCIAIS" > "Chave de API"\n');
  
  console.log('4️⃣  Ativar Faturamento (OBRIGATÓRIO para usar!):');
  console.log('   https://console.cloud.google.com/project/_/billing/enable');
  console.log('   💰 Você ganha $200 grátis/mês!\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📝 DEPOIS DE CRIAR:\n');
  console.log('1. Copie a API Key (começa com AIza...)');
  console.log('2. Execute este comando:');
  console.log('   npm run config-api-key');
  console.log('3. Cole a chave quando solicitado\n');
  
  console.log('OU adicione manualmente no arquivo backend/.env:');
  console.log('   GOOGLE_PLACES_API_KEY=sua-chave-aqui\n');
}




