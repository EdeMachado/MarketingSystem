// Script de diagnóstico completo do sistema
require('dotenv').config();
const axios = require('axios');

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   🔍 DIAGNÓSTICO COMPLETO DO SISTEMA                   ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Verificar arquivo .env
console.log('1️⃣  Verificando configurações...\n');

const hasSMTP = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const hasGooglePlaces = !!process.env.GOOGLE_PLACES_API_KEY;

if (hasSMTP) {
  success.push('✅ SMTP configurado no .env');
  console.log('   ✅ SMTP: Configurado');
  console.log('      Host:', process.env.SMTP_HOST);
  console.log('      User:', process.env.SMTP_USER.substring(0, 3) + '***');
} else {
  errors.push('❌ SMTP não configurado');
  console.log('   ❌ SMTP: Não configurado');
}

console.log('');

if (hasGooglePlaces) {
  success.push('✅ Google Places API Key encontrada');
  console.log('   ✅ Google Places API Key: Encontrada');
  console.log('      Chave:', process.env.GOOGLE_PLACES_API_KEY.substring(0, 20) + '...');
} else {
  errors.push('❌ Google Places API Key não encontrada');
  console.log('   ❌ Google Places API Key: Não encontrada');
}

console.log('\n2️⃣  Testando conexões...\n');

// 2. Testar Google Places API
if (hasGooglePlaces) {
  console.log('   🧪 Testando Google Places API...');
  
  axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
    params: {
      query: 'clinicas saude São Paulo',
      key: process.env.GOOGLE_PLACES_API_KEY,
      language: 'pt-BR',
    },
    timeout: 10000,
  })
    .then((response) => {
      if (response.data.status === 'OK') {
        success.push('✅ Google Places API funcionando');
        console.log('      ✅ API funcionando!');
        console.log('      Resultados:', response.data.results?.length || 0);
      } else if (response.data.status === 'REQUEST_DENIED') {
        errors.push('❌ Faturamento não ativado no Google Cloud');
        console.log('      ❌ ERRO: Faturamento não ativado');
        console.log('      🔗 Ative aqui: https://console.cloud.google.com/project/_/billing/enable');
        console.log('      Mensagem:', response.data.error_message || 'Sem mensagem');
      } else if (response.data.status === 'INVALID_REQUEST') {
        errors.push('❌ Places API não ativada no projeto');
        console.log('      ❌ ERRO: Places API não está ativada');
        console.log('      🔗 Ative aqui: https://console.cloud.google.com/apis/library?q=places');
      } else {
        warnings.push(`⚠️ Google Places API: ${response.data.status}`);
        console.log('      ⚠️ Status:', response.data.status);
        if (response.data.error_message) {
          console.log('      Mensagem:', response.data.error_message);
        }
      }
      
      printResults();
    })
    .catch((error) => {
      if (error.response) {
        const data = error.response.data;
        if (data?.status === 'REQUEST_DENIED') {
          errors.push('❌ Faturamento não ativado no Google Cloud');
          console.log('      ❌ ERRO: Faturamento não ativado');
          console.log('      🔗 https://console.cloud.google.com/project/_/billing/enable');
        } else {
          errors.push('❌ Erro ao conectar Google Places API');
          console.log('      ❌ Erro:', data?.error_message || error.message);
        }
      } else {
        errors.push('❌ Erro de conexão com Google Places API');
        console.log('      ❌ Erro de conexão:', error.message);
      }
      printResults();
    });
} else {
  printResults();
}

// 3. Testar backend
console.log('\n3️⃣  Verificando backend...\n');

axios.get('http://localhost:3001/health', { timeout: 3000 })
  .then(() => {
    success.push('✅ Backend está rodando');
    console.log('   ✅ Backend: Rodando na porta 3001\n');
  })
  .catch(() => {
    errors.push('❌ Backend não está rodando');
    console.log('   ❌ Backend: Não está rodando');
    console.log('   💡 Execute: cd backend && npm run dev\n');
  });

// 4. Testar endpoint de busca
if (hasGooglePlaces) {
  setTimeout(() => {
    console.log('4️⃣  Testando endpoint de busca...\n');
    
    axios.post('http://localhost:3001/api/company-search/search', {
      query: 'clinicas',
      location: 'São Paulo',
      maxResults: 5,
    }, { timeout: 10000 })
      .then((response) => {
        if (response.data.success) {
          success.push('✅ Endpoint de busca funcionando');
          console.log('   ✅ Endpoint: Funcionando');
          console.log('   Empresas encontradas:', response.data.data?.total || 0);
        } else {
          warnings.push('⚠️ Endpoint retornou sucesso=false');
          console.log('   ⚠️ Endpoint: Retornou erro');
        }
      })
      .catch((error) => {
        if (error.code === 'ECONNREFUSED') {
          warnings.push('⚠️ Backend não está rodando para testar endpoint');
        } else {
          errors.push('❌ Erro no endpoint de busca');
          console.log('   ❌ Erro:', error.response?.data?.message || error.message);
        }
      });
  }, 2000);
}

function printResults() {
  setTimeout(() => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO DO DIAGNÓSTICO\n');
    
    if (success.length > 0) {
      console.log('✅ SUCESSOS:');
      success.forEach(s => console.log('   ' + s));
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  AVISOS:');
      warnings.forEach(w => console.log('   ' + w));
      console.log('');
    }
    
    if (errors.length > 0) {
      console.log('❌ ERROS:');
      errors.forEach(e => console.log('   ' + e));
      console.log('');
    }
    
    if (errors.length === 0) {
      console.log('🎉 Tudo funcionando perfeitamente!\n');
    } else {
      console.log('💡 Ações recomendadas:\n');
      
      if (errors.some(e => e.includes('Faturamento'))) {
        console.log('   1. Ative o faturamento:');
        console.log('      https://console.cloud.google.com/project/_/billing/enable\n');
      }
      
      if (errors.some(e => e.includes('Places API não está ativada'))) {
        console.log('   2. Ative a Places API:');
        console.log('      https://console.cloud.google.com/apis/library?q=places\n');
      }
      
      if (errors.some(e => e.includes('Backend não está rodando'))) {
        console.log('   3. Inicie o backend:');
        console.log('      cd backend && npm run dev\n');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }, 1000);
}

