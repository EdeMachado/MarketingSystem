# 🔧 Como Integrar Clearbit no Sistema

## 📋 Passo a Passo

### 1. Criar Conta no Clearbit

1. Acesse: https://clearbit.com
2. Clique em "Sign Up"
3. Escolha plano:
   - **Starter:** $99/mês (1000 enriquecimentos)
   - **Growth:** $299/mês (10.000 enriquecimentos)
4. Faça o cadastro

### 2. Obter API Key

1. Após login, vá em **Settings** → **API Keys**
2. Clique em **"Create API Key"**
3. Copie a API Key (aparece só uma vez!)

### 3. Configurar no Sistema

1. Adicione no arquivo `.env`:
   ```env
   CLEARBIT_API_KEY=sua-api-key-aqui
   ```

2. Instalar dependência:
   ```bash
   cd backend
   npm install clearbit
   ```

### 4. Usar no Sistema

Após integrar, você pode:
- Buscar empresa por domínio
- Enriquecer contatos com dados completos
- Obter emails, telefones, dados financeiros

---

## 📊 O que o Clearbit retorna:

```json
{
  "name": "Empresa ABC",
  "domain": "empresa.com.br",
  "email": "contato@empresa.com.br",  // ✅ EMAIL!
  "phone": "+55 11 1234-5678",
  "address": "Rua XYZ, 123",
  "city": "São Paulo",
  "state": "SP",
  "revenue": 5000000,
  "employees": 50,
  "linkedin": "linkedin.com/company/empresa",
  "technologies": ["WordPress", "Google Analytics"],
  "category": "Manufacturing"
}
```

---

## 💰 Custo

- **$99/mês:** 1000 empresas enriquecidas
- **$299/mês:** 10.000 empresas enriquecidas
- **Pay-as-you-go:** $0.10 por empresa

---

## ✅ Vantagens

- ✅ **Tem email** (taxa de sucesso alta)
- ✅ Dados completos
- ✅ Atualizado constantemente
- ✅ Fácil de integrar

---

## 🎯 Quer que eu integre agora?

Posso criar:
1. Serviço de integração com Clearbit
2. Rota para enriquecer empresas
3. Interface para usar

Me diga se quer que eu integre!

