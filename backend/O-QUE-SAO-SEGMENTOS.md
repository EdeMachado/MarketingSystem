# 🗂️ O que são SEGMENTOS?

## 📖 Definição Simples

**Segmento** = Grupo de contatos com características em comum

É uma forma de **organizar seus contatos** por critérios específicos (filtros) para enviar campanhas mais direcionadas.

---

## 🎯 Exemplo Prático

### Cenário:
Você tem **500 contatos** na sua base:
- 200 têm email válido
- 150 têm WhatsApp
- 50 fizeram opt-out
- 100 são de empresas de saúde
- 50 são clientes VIP

### Como segmentar:
1. **"Clientes com Email Válido"**
   - Filtro: `emailValid = true`
   - Resultado: 200 contatos

2. **"Empresas de Saúde"**
   - Filtro: `company contém "saúde" ou "health"`
   - Resultado: 100 contatos

3. **"Clientes VIP Sem Opt-out"**
   - Filtro: `tags contém "vip"` E `optOut = false`
   - Resultado: 45 contatos

---

## ✅ O que está funcionando:

### 1. **Criar Segmento**
- ✅ Botão "+ Novo Segmento"
- ✅ Formulário com filtros:
  - Status (ativo, unsubscribed, bounced)
  - Email válido (sim/não)
  - Opt-out (sim/não)
  - Tem email (sim/não)
  - Tem telefone (sim/não)
  - Empresa contém...
  - Tags (separadas por vírgula)
  - Data de criação (após/antes)
- ✅ Contagem automática de contatos
- ✅ Tipo (Dinâmico ou Estático)

### 2. **Listar Segmentos**
- ✅ Tabela com todos os segmentos
- ✅ Mostra nome, tipo, contagem de contatos
- ✅ Botões de ação:
  - ✅ Ver contatos
  - ✅ Exportar
  - ✅ Excluir

### 3. **Ver Contatos do Segmento**
- ✅ Modal mostrando todos os contatos
- ✅ Lista completa com nome, email, telefone, empresa

### 4. **Usar Segmentos em Campanhas**
- ✅ Backend suporta `segmentFilters` nas campanhas
- ⚠️ Frontend ainda não permite selecionar segmento existente

---

## ❌ O que está FALTANDO:

### 1. **EDITAR Segmento**
- ❌ Não tem botão "Editar"
- ❌ Não pode alterar nome, descrição ou filtros
- ❌ Precisa deletar e criar de novo

### 2. **ATUALIZAR Contagem**
- ❌ Contagem só é feita quando cria
- ❌ Se novos contatos entram, não atualiza automaticamente
- ❌ Não tem botão "Atualizar Contagem"

### 3. **Selecionar Segmento na Campanha**
- ❌ Ao criar campanha, não pode escolher um segmento existente
- ❌ Precisa aplicar filtros manualmente toda vez
- ❌ Não aproveita segmentos já criados

---

## 🔧 Como Funciona (Técnico)

### Backend:
```typescript
Segment {
  id: string
  name: string
  description?: string
  filters: string  // JSON com filtros
  contactCount: number  // Quantidade de contatos
  type: 'dynamic' | 'static'
}
```

### Filtros Disponíveis:
```typescript
{
  status?: 'active' | 'unsubscribed' | 'bounced'
  emailValid?: true | false
  optOut?: true | false
  hasEmail?: true | false
  hasPhone?: true | false
  company?: string  // busca parcial
  tags?: string[]   // array de tags
  createdAfter?: Date
  createdBefore?: Date
}
```

### Como Aplicar Filtros:
```typescript
// Backend aplica filtros automaticamente
const contacts = await applyFilters(filters);
// Retorna lista de contatos que atendem aos critérios
```

---

## 💡 Tipos de Segmento

### 1. **Dinâmico** (default)
- ✅ Atualiza automaticamente quando novos contatos entram
- ✅ Sempre reflete os filtros atuais
- ✅ Exemplo: "Clientes com email válido" - sempre inclui novos

### 2. **Estático**
- ✅ Salva lista de contatos no momento da criação
- ✅ Não muda mesmo se novos contatos entram
- ✅ Exemplo: "Clientes de janeiro 2024" - fixo na data

---

## 🎯 Como Usar (Fluxo Completo)

### 1. Criar Segmento:
1. Vá em "Segmentos"
2. Clique em "+ Novo Segmento"
3. Dê um nome (ex: "Clientes VIP")
4. Configure filtros:
   - Marque "Apenas com email"
   - Marque "Sem opt-out"
   - Digite tags: "vip, cliente"
5. Clique em "Criar"
6. Sistema conta automaticamente: "45 contatos"

### 2. Ver Contatos:
1. Na lista de segmentos
2. Clique em "Ver contatos"
3. Modal mostra todos os 45 contatos

### 3. Usar em Campanha:
1. Vá em "Campanhas"
2. Crie nova campanha
3. **FALTA:** Selecionar segmento "Clientes VIP"
4. **HOJE:** Precisa aplicar filtros manualmente

---

## 📊 Exemplos de Segmentos Úteis

### 1. **"Clientes Ativos"**
- Status: `active`
- Opt-out: `false`
- Email válido: `true`

### 2. **"Leads com Email"**
- Tem email: `true`
- Status: `active`
- Email válido: `true`

### 3. **"Empresas de Saúde"**
- Empresa contém: `"saúde"` ou `"health"`
- Tem email: `true`

### 4. **"Novos Contatos (últimos 30 dias)"**
- Criados após: `hoje - 30 dias`
- Status: `active`

### 5. **"Clientes VIP"**
- Tags: `["vip", "cliente"]`
- Opt-out: `false`

---

## ✅ Próximos Passos (Melhorias)

1. **Botão "Editar"** - Alterar nome, descrição e filtros
2. **Botão "Atualizar Contagem"** - Recalcular quantidade de contatos
3. **Selecionar Segmento na Campanha** - Dropdown para escolher segmento existente
4. **Duplicar Segmento** - Criar cópia com outro nome
5. **Preview em Tempo Real** - Ver quantos contatos antes de salvar

---

## 🎯 Resumo

### Segmento = Grupo de contatos com filtros

**O que tem:**
- ✅ Criar segmento
- ✅ Ver contatos
- ✅ Excluir segmento
- ✅ Exportar contatos

**O que falta:**
- ❌ Editar segmento
- ❌ Atualizar contagem
- ❌ Usar segmento na campanha (frontend)

**Por que é útil:**
- 🎯 Campanhas mais direcionadas
- 📊 Organização melhor dos contatos
- ⚡ Reutilização de filtros
- 📈 Melhor performance (enviar só para quem interessa)

