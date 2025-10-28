# 📥 Como Importar 75.000 Emails

## 🚀 Passo a Passo Simples

### 1️⃣ Prepare sua planilha Excel/CSV

Formato mínimo necessário:
```
Nome          | Email
--------------|-------------------
João Silva    | joao@email.com
Maria Santos  | maria@email.com
```

**Importante:**
- ✅ Primeira linha deve ter cabeçalho (Nome, Email)
- ✅ Pelo menos uma coluna Nome ou Email
- ✅ Arquivo pode ter até 100MB
- ✅ Formatos aceitos: .xlsx, .xls, .csv

### 2️⃣ Via Interface (Mais Fácil)

1. **Acesse**: http://localhost:3002
2. **Clique em**: "Contatos" no menu
3. **Clique em**: "📥 Importar" (botão verde)
4. **Selecione** seu arquivo
5. **Aguarde** - Sistema mostra progresso
6. **Veja resultado** com estatísticas completas

### 3️⃣ O que acontece?

- ✅ Sistema processa em **lotes de 1000** (otimizado)
- ✅ **Detecta duplicatas** automaticamente
- ✅ **Valida emails** automaticamente
- ✅ Mostra **progresso** a cada 10k registros
- ✅ **Relatório final** completo

### 4️⃣ Tempo Estimado

Para 75.000 contatos:
- ⏱️ **5-10 minutos** (depende do servidor)
- 💾 **Processamento em memória** eficiente
- 📊 **Logs no console** do backend

### 5️⃣ Resultado Esperado

```
✅ Importação Concluída!
📊 Total processado: 75.000
✅ Inseridos: 72.345 (novos)
⏭️ Pulados: 2.550 (duplicados)
❌ Erros: 105 (inválidos)
```

### 6️⃣ Dicas Importantes

#### Se der erro de memória:
- Divida em arquivos de 20-30k cada
- Importe um por vez

#### Se demorar muito:
- Normal para grandes volumes
- Veja progresso no console do backend
- Não feche o navegador

#### Validar antes de usar:
- Vá em "Contatos"
- Verifique o total
- Use filtros para validar

### 7️⃣ Verificar Importação

Após importar:
1. Vá em "Contatos"
2. Veja total no topo
3. Use busca/filtros
4. Pronto para criar campanhas!

## 🎯 Exemplo Prático

**Sua planilha tem:**
```
Nome | Email
-----|------------------
João | joao@email.com
Maria| maria@email.com
... (75.000 linhas)
```

**Processo:**
1. Upload → 30 segundos
2. Validação → 2 minutos  
3. Inserção → 5-7 minutos
4. **Total: ~8 minutos**

## ✅ Pronto!

Sistema otimizado para lidar com 75k+ contatos sem problemas! 🚀

---

**Dúvidas? Veja o console do backend para logs detalhados!**

