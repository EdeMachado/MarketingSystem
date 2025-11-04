# 🔍 Enriquecimento de Contatos - Buscar Emails e Telefones

## ✅ Sistema Implementado!

O sistema **JÁ ESTÁ PRONTO** para buscar emails e telefones faltantes dos sites das empresas!

---

## 🎯 O que o sistema faz:

### 1. **Busca Email no Site**
- Procura em páginas de contato (`/contato`, `/contact`, `/fale-conosco`)
- Procura na página principal
- Valida o email encontrado
- Filtra emails inválidos (example, test, etc)

### 2. **Busca Telefone/WhatsApp no Site**
- Procura WhatsApp Business no site
- Extrai números de telefone
- Normaliza formato internacional

### 3. **Atualiza Contatos Automaticamente**
- Atualiza contatos com informações encontradas
- Marca como enriquecido
- Registra quando foi enriquecido

---

## 📋 Como Usar

### Opção 1: Via API (Recomendado)

#### 1. Verificar Estatísticas
```bash
GET http://localhost:3001/api/enrichment/stats
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "missingEmail": 45,
    "missingPhone": 30,
    "canEnrich": 35,
    "canEnrichWithEmail": 25,
    "canEnrichWithPhone": 20
  }
}
```

#### 2. Enriquecer Contatos em Massa
```bash
POST http://localhost:3001/api/enrichment/contacts/bulk
Content-Type: application/json

{
  "missingEmail": true,
  "missingPhone": true,
  "hasWebsite": true,
  "limit": 100
}
```

**Parâmetros:**
- `missingEmail`: true = buscar apenas contatos sem email
- `missingPhone`: true = buscar apenas contatos sem telefone
- `hasWebsite`: true = apenas contatos com empresa que tem website
- `limit`: máximo de contatos a processar (default: 100)

**Resposta:**
```json
{
  "success": true,
  "message": "Processados 35 contatos, 12 enriquecidos",
  "data": {
    "total": 150,
    "processed": 35,
    "enriched": 12,
    "results": [
      {
        "contactId": "xxx",
        "name": "Empresa ABC",
        "emailFound": true,
        "phoneFound": false,
        "email": "contato@empresa.com",
        "website": "https://empresa.com"
      }
    ],
    "errors": []
  }
}
```

#### 3. Enriquecer Um Contato Específico
```bash
POST http://localhost:3001/api/enrichment/contact/{id}
```

---

### Opção 2: Via Frontend (Próximo Passo)

Ainda não tem interface, mas pode criar uma página ou botão para executar.

---

## ⚙️ Como Funciona

### Processo de Busca:

1. **Identifica contatos que precisam:**
   - Sem email OU sem telefone
   - Com empresa associada
   - Empresa tem website

2. **Para cada contato:**
   - Acessa o website da empresa
   - Busca em páginas de contato
   - Extrai emails e telefones
   - Valida os dados encontrados

3. **Atualiza o banco:**
   - Adiciona email encontrado
   - Adiciona telefone encontrado
   - Marca como enriquecido

4. **Rate Limiting:**
   - Processa em lotes de 10
   - Delay de 2 segundos entre lotes
   - Não sobrecarrega os sites

---

## 📊 Estatísticas

### Ver quantos contatos podem ser enriquecidos:
```bash
GET /api/enrichment/stats
```

Mostra:
- Total de contatos
- Contatos sem email
- Contatos sem telefone
- Contatos que podem ser enriquecidos (têm website)

---

## 🚀 Exemplo de Uso Completo

### 1. Verificar estatísticas:
```bash
curl http://localhost:3001/api/enrichment/stats
```

### 2. Enriquecer contatos sem email:
```bash
curl -X POST http://localhost:3001/api/enrichment/contacts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "missingEmail": true,
    "missingPhone": false,
    "hasWebsite": true,
    "limit": 50
  }'
```

### 3. Enriquecer contatos sem telefone:
```bash
curl -X POST http://localhost:3001/api/enrichment/contacts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "missingEmail": false,
    "missingPhone": true,
    "hasWebsite": true,
    "limit": 50
  }'
```

### 4. Enriquecer tudo de uma vez:
```bash
curl -X POST http://localhost:3001/api/enrichment/contacts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "missingEmail": true,
    "missingPhone": true,
    "hasWebsite": true,
    "limit": 100
  }'
```

---

## ⚠️ Limitações

1. **Precisa ter website:**
   - Contato deve ter empresa associada
   - Empresa deve ter website cadastrado

2. **Nem sempre encontra:**
   - Alguns sites não têm email/telefone visível
   - Sites podem bloquear scraping
   - Páginas podem estar em JavaScript (requer Puppeteer)

3. **Rate Limiting:**
   - Processa em lotes para não sobrecarregar
   - Delay entre requisições
   - Limite de 100 por execução (configurável)

---

## 🔧 Melhorias Futuras

- [ ] Adicionar interface no frontend
- [ ] Agendamento automático de enriquecimento
- [ ] Suporte a JavaScript (Puppeteer)
- [ ] Mais fontes de dados (LinkedIn, Yellow Pages)
- [ ] Validação mais robusta de emails
- [ ] Cache de resultados

---

## ✅ Status

- ✅ Busca email no site
- ✅ Busca telefone/WhatsApp no site
- ✅ Enriquecimento em massa
- ✅ Estatísticas
- ✅ API completa
- ⏳ Interface no frontend (próximo passo)

---

## 🎯 Próximos Passos

1. **Testar agora:**
   ```bash
   # Ver estatísticas
   curl http://localhost:3001/api/enrichment/stats
   
   # Enriquecer contatos
   curl -X POST http://localhost:3001/api/enrichment/contacts/bulk \
     -H "Content-Type: application/json" \
     -d '{"missingEmail": true, "missingPhone": true, "limit": 10}'
   ```

2. **Criar interface no frontend** (se quiser)

3. **Agendar enriquecimento automático** (opcional)

---

## 💡 Dica

Execute o enriquecimento **após importar** empresas do Google Places, pois elas já vêm com website e podem ser enriquecidas automaticamente!

