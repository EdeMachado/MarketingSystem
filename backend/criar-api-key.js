// Script para verificar e criar Google Places API Key
require('dotenv').config();
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   🔑 CRIAR/CONFIGURAR GOOGLE PLACES API KEY            ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

const envPath = path.join(__dirname, '.env');
let envContent = '';

// Ler arquivo .env se existir
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Arquivo .env encontrado\n');
} else {
  console.log('⚠️  Arquivo .env não encontrado. Criando...\n');
  envContent = '';
}

// Verificar se já tem API Key
const hasApiKey = envContent.includes('GOOGLE_PLACES_API_KEY=') && 
                  envContent.match(/GOOGLE_PLACES_API_KEY=(.+)/)?.[1]?.trim() &&
                  !envContent.match(/GOOGLE_PLACES_API_KEY=(.+)/)?.[1].includes('sua-chave');

if (hasApiKey) {
  const currentKey = envContent.match(/GOOGLE_PLACES_API_KEY=(.+)/)?.[1].trim();
  console.log('📍 API Key atual encontrada:', currentKey.substring(0, 20) + '...\n');
  
  rl.question('Deseja criar uma nova API Key? (s/N): ', (answer) => {
    if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'sim') {
      console.log('\n✅ Mantendo API Key atual.\n');
      rl.close();
      return;
    }
    showInstructions();
  });
} else {
  showInstructions();
}

function showInstructions() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 PASSO A PASSO PARA CRIAR API KEY\n');
  
  console.log('1️⃣  ACESSE O LINK DIRETO:');
  console.log('   🔗 https://console.cloud.google.com/apis/credentials\n');
  
  console.log('2️⃣  OU SIGA ESTES PASSOS:');
  console.log('   a) Acesse: https://console.cloud.google.com/');
  console.log('   b) Selecione seu projeto (ou crie um novo)');
  console.log('   c) Menu: "APIs e Serviços" > "Credenciais"');
  console.log('   d) Clique em "+ CRIAR CREDENCIAIS"');
  console.log('   e) Escolha "Chave de API"\n');
  
  console.log('3️⃣  ATIVE A API PRIMEIRO (IMPORTANTE!):');
  console.log('   Menu: "APIs e Serviços" > "Biblioteca"');
  console.log('   Busque e ATIVE: "Places API" e "Places API (New)"');
  console.log('   🔗 https://console.cloud.google.com/apis/library?q=places\n');
  
  console.log('4️⃣  VINCULE FATURAMENTO (se ainda não fez):');
  console.log('   🔗 https://console.cloud.google.com/project/_/billing/enable\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  rl.question('Cole aqui a API Key que você criou: ', (apiKey) => {
    apiKey = apiKey.trim();
    
    if (!apiKey || apiKey.length < 20) {
      console.log('\n❌ API Key inválida. Deve ter pelo menos 20 caracteres.\n');
      rl.close();
      return;
    }
    
    if (!apiKey.startsWith('AIza')) {
      console.log('\n⚠️  Atenção: API Keys do Google geralmente começam com "AIza"');
      console.log('   Você tem certeza que esta é a chave correta?');
      
      rl.question('   Continuar mesmo assim? (s/N): ', (confirm) => {
        if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
          console.log('\n❌ Cancelado.\n');
          rl.close();
          return;
        }
        saveApiKey(apiKey);
      });
    } else {
      saveApiKey(apiKey);
    }
  });
}

function saveApiKey(apiKey) {
  console.log('\n💾 Salvando API Key...\n');
  
  // Verificar se já existe a linha
  if (envContent.includes('GOOGLE_PLACES_API_KEY=')) {
    // Substituir a linha existente
    envContent = envContent.replace(/GOOGLE_PLACES_API_KEY=.*/g, `GOOGLE_PLACES_API_KEY=${apiKey}`);
  } else {
    // Adicionar nova linha
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `# Google Places API (para busca de empresas)\nGOOGLE_PLACES_API_KEY=${apiKey}\n`;
  }
  
  // Salvar arquivo
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('✅ API Key salva com sucesso!');
  console.log('   Arquivo: backend/.env');
  console.log('   Chave: ' + apiKey.substring(0, 20) + '...\n');
  
  // Testar a chave
  console.log('🧪 Testando API Key...\n');
  
  const axios = require('axios');
  axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
    params: {
      query: 'clinicas saude São Paulo',
      key: apiKey,
      language: 'pt-BR',
    },
  })
    .then((response) => {
      if (response.data.status === 'OK') {
        console.log('✅ SUCESSO! API Key está funcionando!');
        console.log('   Resultados encontrados:', response.data.results?.length || 0);
        console.log('\n🎉 Tudo pronto! Você pode usar a busca de empresas.\n');
      } else if (response.data.status === 'REQUEST_DENIED') {
        console.log('⚠️  API Key criada, mas requer faturamento ativado.');
        console.log('   Acesse: https://console.cloud.google.com/project/_/billing/enable');
        console.log('   (Você ganha $200 grátis por mês!)\n');
      } else {
        console.log('⚠️  Status:', response.data.status);
        console.log('   Mensagem:', response.data.error_message || 'Sem mensagem');
      }
      rl.close();
    })
    .catch((error) => {
      if (error.response && error.response.data?.status === 'REQUEST_DENIED') {
        console.log('⚠️  API Key criada, mas requer faturamento ativado.');
        console.log('   Acesse: https://console.cloud.google.com/project/_/billing/enable\n');
      } else {
        console.log('❌ Erro ao testar:', error.message);
      }
      rl.close();
    });
}




