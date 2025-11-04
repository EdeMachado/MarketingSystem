# 🔍 Debug - Enriquecimento Não Está Funcionando

## ❌ Problema Reportado:
- Clica em "Buscar Emails"
- Processo roda
- Mas nada acontece - contatos continuam sem email

---

## 🔍 Como Debugar:

### 1. **Verificar Logs do Backend**

Quando você executar o enriquecimento, veja o terminal do backend. Deve aparecer:

```
🚀 Iniciando enriquecimento em massa com filtros: {...}
🔍 Iniciando enriquecimento de X contatos...
📦 Processando lote 1 (10 contatos)...
  🔎 Enriquecendo: Nome do Contato (Empresa)
    ✅ Email encontrado: email@exemplo.com
    OU
    ❌ Email não encontrado no site
    OU
    ⚠️  Sem website: Nome do Contato
```

### 2. **Executar Script de Debug**

```bash
cd backend
node debug-enrichment.js
```

Isso vai mostrar:
- Quais contatos sem email existem
- Se as empresas têm website
- Por que não podem ser enriquecidos

### 3. **Verificar Console do Navegador**

Abra o console do navegador (F12) e veja:
- Se há erros na requisição
- Qual resposta está vindo da API
- Se os dados estão sendo atualizados

---

## 🐛 Possíveis Causas:

### 1. **Empresas não têm website**
- Contato precisa ter empresa associada
- Empresa precisa ter website cadastrado
- Se não tiver, não pode enriquecer

### 2. **Sites não têm email visível**
- Alguns sites não mostram email na página de contato
- Email pode estar em JavaScript (requer Puppeteer)
- Site pode bloquear scraping

### 3. **Empresa não encontrada**
- Nome da empresa no contato não bate com nome da empresa no banco
- Diferença de maiúsculas/minúsculas
- Espaços extras

### 4. **Problema na busca**
- Site pode estar bloqueando requisições
- Timeout muito curto
- Página de contato não existe

---

## ✅ Soluções:

### Verificar se empresas têm website:
```bash
node debug-enrichment.js
```

### Testar busca manualmente:
1. Pegue um contato que deveria ter email
2. Veja qual empresa está associada
3. Verifique se a empresa tem website
4. Acesse o website manualmente
5. Veja se tem email visível na página de contato

### Se não encontrar:
- Pode ser que o site use JavaScript para mostrar email
- Pode ser que o email esteja em imagem
- Pode ser que o site bloqueie scraping

---

## 📝 Próximos Passos:

1. **Execute o debug:**
   ```bash
   cd backend
   node debug-enrichment.js
   ```

2. **Execute o enriquecimento novamente** e veja os logs no terminal do backend

3. **Me diga:**
   - O que aparece nos logs?
   - Quantos contatos foram processados?
   - Quantos emails foram encontrados?
   - Há algum erro específico?

---

## 💡 Melhorias Futuras:

- [ ] Adicionar Puppeteer para sites com JavaScript
- [ ] Melhorar busca de emails (mais padrões)
- [ ] Cache de resultados
- [ ] Retry automático
- [ ] Validação mais robusta

