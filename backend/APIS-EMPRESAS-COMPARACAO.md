# 🚀 APIs Mais Poderosas para Buscar Empresas

## 📊 Comparação: Google Places vs Alternativas

### 1. **Google Places API** (Atual) ✅
**Custo:** $0.032 por busca de texto + $0.017 por detalhes
**Limite grátis:** $200 créditos/mês

**Vantagens:**
- ✅ Muitos dados (milhões de empresas)
- ✅ Atualizado constantemente
- ✅ Tem website, telefone, endereço
- ✅ Avaliações e fotos
- ✅ Já está integrado no sistema

**Desvantagens:**
- ❌ Não tem email diretamente
- ❌ Não tem dados financeiros
- ❌ Não tem informações de funcionários
- ❌ Não tem redes sociais

---

### 2. **Clearbit Enrichment API** ⭐ RECOMENDADO
**Custo:** $99/mês (1000 enriquecimentos/mês) ou $299/mês (10k)
**Site:** https://clearbit.com

**Vantagens:**
- ✅ **Tem EMAIL** da empresa (taxa alta de sucesso)
- ✅ Dados completos: telefone, endereço, website
- ✅ Informações financeiras (receita, funcionários)
- ✅ Tecnologias usadas pela empresa
- ✅ Redes sociais (LinkedIn, Twitter, Facebook)
- ✅ Dados de funcionários (nomes, emails)
- ✅ Categorização por setor

**Dados que retorna:**
```json
{
  "name": "Empresa ABC",
  "domain": "empresa.com.br",
  "email": "contato@empresa.com.br",  // ✅ TEM EMAIL!
  "phone": "+55 11 1234-5678",
  "address": "Rua XYZ, 123",
  "city": "São Paulo",
  "state": "SP",
  "revenue": 5000000,
  "employees": 50,
  "linkedin": "linkedin.com/company/empresa",
  "twitter": "@empresa",
  "technologies": ["WordPress", "Google Analytics"],
  "category": "Manufacturing"
}
```

**Integração:**
```typescript
// Exemplo de uso
const company = await clearbit.enrichment.find({
  domain: 'empresa.com.br'
});
```

---

### 3. **Hunter.io API** ⭐ BOA PARA EMAILS
**Custo:** $49/mês (500 pesquisas/mês) ou $149/mês (5000)
**Site:** https://hunter.io

**Vantagens:**
- ✅ **Especializado em encontrar emails**
- ✅ Busca emails por domínio
- ✅ Verifica se email existe
- ✅ Taxa de sucesso: 70-80%
- ✅ Encontra emails de funcionários

**Dados que retorna:**
```json
{
  "domain": "empresa.com.br",
  "emails": [
    {
      "value": "contato@empresa.com.br",
      "type": "generic",
      "confidence": 95,
      "sources": [...]
    }
  ]
}
```

**Integração:**
```typescript
// Buscar emails de um domínio
const result = await hunter.domainSearch({
  domain: 'empresa.com.br'
});
```

---

### 4. **Apify Google Maps Scraper** 💪 PODEROSO
**Costo:** $0.25 por 1000 empresas
**Site:** https://apify.com

**Vantagens:**
- ✅ Extrai dados do Google Maps (mais completo que Places API)
- ✅ Inclui reviews, fotos, horários
- ✅ Pode extrair emails de reviews/comentários
- ✅ Mais barato que Places API para volumes grandes
- ✅ Não precisa API key do Google

**Desvantagens:**
- ⚠️ Pode violar termos de uso do Google
- ⚠️ Pode ser bloqueado

---

### 5. **LinkedIn API** (Dados Empresariais)
**Custo:** Gratuito (limitado) ou LinkedIn Sales Navigator
**Site:** https://developer.linkedin.com

**Vantagens:**
- ✅ Dados profissionais
- ✅ Funcionários da empresa
- ✅ Informações de negócios
- ✅ Contatos diretos

**Desvantagens:**
- ❌ Limitações de uso
- ❌ Requer autenticação OAuth
- ❌ Rate limiting restritivo

---

### 6. **Outscraper** (Google Maps Scraper)
**Custo:** $0.005 por empresa (muito barato!)
**Site:** https://outscraper.com

**Vantagens:**
- ✅ Extrai dados do Google Maps
- ✅ Muito barato
- ✅ Inclui reviews, ratings
- ✅ Pode incluir emails se disponíveis

**Dados que retorna:**
```json
{
  "name": "Empresa ABC",
  "address": "Rua XYZ",
  "phone": "+55 11 1234-5678",
  "website": "https://empresa.com.br",
  "rating": 4.5,
  "reviews": 150,
  "category": "Manufacturing"
}
```

---

### 7. **ZoomInfo** (Empresarial Completo)
**Custo:** $15.000+/ano (muito caro!)
**Site:** https://zoominfo.com

**Vantagens:**
- ✅ Banco de dados gigante
- ✅ Emails, telefones, funcionários
- ✅ Dados financeiros
- ✅ Tecnologias, setores

**Desvantagens:**
- ❌ MUITO CARO
- ❌ Focado em B2B enterprise

---

## 🎯 Recomendação para Você

### **Opção 1: Clearbit** (Melhor para dados completos) ⭐
- **Custo:** $99/mês (1000 empresas/mês)
- **Tem email:** ✅ Sim
- **Dados completos:** ✅ Sim
- **Fácil de integrar:** ✅ Sim

**Quando usar:**
- Você precisa de emails
- Quer dados financeiros
- Quer informações completas

---

### **Opção 2: Hunter.io** (Melhor só para emails) ⭐
- **Custo:** $49/mês (500 pesquisas/mês)
- **Tem email:** ✅ Sim (especializado)
- **Dados completos:** ❌ Não (só emails)

**Quando usar:**
- Foco principal é encontrar emails
- Não precisa de outros dados

---

### **Opção 3: Outscraper** (Mais barato) 💰
- **Custo:** $0.005 por empresa (muito barato!)
- **Tem email:** ⚠️ Às vezes (se disponível)
- **Dados completos:** ✅ Sim (via Google Maps)

**Quando usar:**
- Volume grande de empresas
- Orçamento limitado
- Não precisa garantir email

---

### **Opção 4: Combinar Google Places + Hunter.io** 🎯
- **Google Places:** Buscar empresas (já tem)
- **Hunter.io:** Enriquecer com emails ($49/mês)

**Vantagem:**
- Mantém Google Places (já funciona)
- Adiciona emails via Hunter.io
- Custo total: $49/mês + custo Google Places

---

## 📊 Comparação Rápida

| API | Custo/Mês | Tem Email? | Dados Completos? | Recomendado? |
|-----|-----------|-----------|------------------|--------------|
| **Google Places** (atual) | $0-$50 | ❌ | ✅ | ✅ Já está |
| **Clearbit** | $99 | ✅ | ✅✅✅ | ⭐⭐⭐ Melhor |
| **Hunter.io** | $49 | ✅✅✅ | ❌ | ⭐⭐ Só emails |
| **Outscraper** | $0.005/emp | ⚠️ | ✅ | ⭐ Barato |
| **Apify** | $0.25/1000 | ⚠️ | ✅ | ⭐ Barato |

---

## 🔧 Como Integrar

### Integrar Clearbit (Recomendado):

1. **Criar conta:** https://clearbit.com
2. **Obter API Key**
3. **Instalar SDK:**
   ```bash
   npm install clearbit
   ```
4. **Adicionar ao .env:**
   ```env
   CLEARBIT_API_KEY=sua-key-aqui
   ```

### Integrar Hunter.io:

1. **Criar conta:** https://hunter.io
2. **Obter API Key**
3. **Adicionar ao .env:**
   ```env
   HUNTER_API_KEY=sua-key-aqui
   ```

---

## 💡 Minha Recomendação

Para seu caso (buscar empresas com email e telefone):

1. **Mantenha Google Places** (já funciona bem)
2. **Adicione Clearbit OU Hunter.io** para emails
3. **Custo adicional:** $49-99/mês

**Clearbit é melhor** porque:
- Tem email + dados completos
- Taxa de sucesso alta
- Fácil de integrar
- Dados profissionais

**Hunter.io é melhor** se:
- Só precisa de emails
- Quer economizar ($49 vs $99)

---

## 🚀 Quer que eu integre?

Posso integrar:
- ✅ Clearbit (mais completo)
- ✅ Hunter.io (só emails, mais barato)
- ✅ Outscraper (mais barato, scraping)

Qual você prefere? Ou quer que eu mostre como integrar?

