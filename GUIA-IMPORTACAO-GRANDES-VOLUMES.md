# 📥 Guia: Importar 75.000+ Contatos

## 🚀 Processo Otimizado para Grandes Volumes

### 1️⃣ Preparar sua planilha

A planilha deve ter pelo menos uma destas colunas:
- **Nome** (obrigatório)
- **Email** (opcional, mas pelo menos email OU telefone)
- **Telefone** (opcional)
- **Empresa** (opcional)
- **Origem** (opcional)

**Formato Excel ou CSV**

### 2️⃣ Formato Recomendado

```
Nome          | Email              | Telefone      | Empresa
--------------|-------------------|--------------|------------
João Silva    | joao@email.com    | 11999999999  | Empresa A
Maria Santos  | maria@email.com   | 11888888888  | Empresa B
```

### 3️⃣ Via Interface Web

1. Acesse: http://localhost:3002
2. Vá em **"Contatos"**
3. Clique em **"📥 Importar"**
4. Selecione seu arquivo (CSV ou Excel)
5. Aguarde o processamento (pode levar alguns minutos)
6. Veja o relatório final com:
   - Total processado
   - Quantos foram inseridos
   - Quantos foram pulados (duplicados)
   - Erros encontrados

### 4️⃣ Otimizações para 75k Registros

O sistema está otimizado para:
- ✅ **Processamento em lotes** (1000 por vez)
- ✅ **createMany** (inserção em massa)
- ✅ **Detecção de duplicatas** em lote
- ✅ **Logs de progresso** a cada 10k registros
- ✅ **Limite de arquivo** aumentado para 100MB

### 5️⃣ Tempo Estimado

- **75.000 contatos**: ~5-10 minutos
- Depende da velocidade do banco e processamento

### 6️⃣ Recomendações

#### Se sua planilha for muito grande (>50MB):
1. Divida em arquivos menores (10-20k cada)
2. Importe um por vez
3. Ou use o método direto via API (abaixo)

#### Antes de importar:
- ✅ Remova duplicatas na planilha (facultativo, sistema detecta)
- ✅ Valide emails inválidos (sistema valida automaticamente)
- ✅ Garanta que tem nome em todas as linhas

### 7️⃣ Importação via API (Avançado)

Para volumes muito grandes, pode usar a API diretamente:

```bash
curl -X POST http://localhost:3001/api/import/contacts \
  -F "file=@sua-planilha.xlsx"
```

### 8️⃣ Monitoramento

Durante a importação:
- Console do backend mostra progresso
- Frontend mostra contador
- Relatório final com estatísticas

### 9️⃣ Pós-Importação

Após importar:
1. Verifique a página de Contatos
2. Use filtros para validar
3. Crie segmentos se necessário
4. Comece suas campanhas!

## ⚠️ Importante

- **Primeira importação grande**: Pode demorar mais (indexação do banco)
- **Duplicatas**: Sistema detecta automaticamente (pelo email ou telefone)
- **Erros**: Veja apenas os primeiros 50 no relatório (existem mais)
- **Memória**: Sistema usa processamento em lote para não sobrecarregar

## 📊 Exemplo de Resultado

```
✅ Importação Concluída!
- Total processado: 75.000
- Inseridos: 72.345
- Pulados (duplicados): 2.550
- Erros: 105
```

---

**Pronto para importar seus 75k contatos! 🚀**

