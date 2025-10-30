// Script de teste para Google Places API
require('dotenv').config();

const axios = require('axios');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

console.log('\n=== TESTE GOOGLE PLACES API ===\n');

if (!API_KEY) {
  console.error('❌ ERRO: GOOGLE_PLACES_API_KEY não encontrada no .env');
  console.log('Verifique se o arquivo backend/.env contém:');
  console.log('GOOGLE_PLACES_API_KEY=sua-chave-aqui\n');
  process.exit(1);
}

console.log('✅ Chave encontrada:', API_KEY.substring(0, 20) + '...');
console.log('\nTestando busca...\n');

// Teste simples
axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
  params: {
    query: 'clinicas de saude em São Paulo',
    key: API_KEY,
    language: 'pt-BR',
  },
})
  .then((response) => {
    console.log('Status:', response.status);
    console.log('Resultados encontrados:', response.data.results?.length || 0);
    
    if (response.data.status === 'OK') {
      console.log('\n✅ SUCESSO! API está funcionando!\n');
      
      if (response.data.results && response.data.results.length > 0) {
        console.log('Exemplo de resultado:');
        console.log('- Nome:', response.data.results[0].name);
        console.log('- Endereço:', response.data.results[0].formatted_address);
        console.log('- Rating:', response.data.results[0].rating);
      }
    } else {
      console.error('\n❌ ERRO na resposta da API:');
      console.error('Status:', response.data.status);
      console.error('Mensagem:', response.data.error_message || 'Sem mensagem');
      
      if (response.data.status === 'REQUEST_DENIED') {
        console.error('\n⚠️ A API Key foi negada. Possíveis causas:');
        console.error('1. API Key inválida');
        console.error('2. Places API não está ativada no projeto');
        console.error('3. Restrições na API Key bloqueando o uso');
        console.error('\nSolução:');
        console.error('- Verifique se ativou "Places API" e "Places API (New)"');
        console.error('- Verifique as restrições da API Key no console');
        console.error('- Certifique-se que a chave está correta');
      }
    }
  })
  .catch((error) => {
    console.error('\n❌ ERRO ao conectar:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  });


