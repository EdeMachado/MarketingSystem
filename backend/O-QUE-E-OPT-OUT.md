# 🛡️ O que é Opt-Out?

## 📖 Definição Simples

**Opt-Out** = "Não quero mais receber emails/mensagens"

É quando uma pessoa **pede para ser removida** da sua lista de contatos e não receber mais campanhas.

---

## 🔍 Como Funciona no Sistema

### 1. **Contato faz Opt-Out**
- Recebe um email
- Clica em "Descadastrar" ou "Não quero mais receber"
- Sistema marca como `optOut = true`

### 2. **Sistema Respeita**
- Quando você cria uma campanha, o sistema **automaticamente exclui** contatos com opt-out
- Não envia email/WhatsApp para quem pediu para sair
- Respeita a escolha da pessoa

### 3. **Status no Banco**
```typescript
Contact {
  optOut: true,        // ✅ Marcado como opt-out
  optOutAt: "2025-11-03", // Data que pediu para sair
}
```

---

## 📋 Exemplo Prático

### Cenário:
1. Você tem **100 contatos** na lista
2. **5 pessoas** fizeram opt-out
3. Você cria uma campanha para os **100 contatos**

### O que acontece:
- ✅ Sistema envia para **95 contatos** (100 - 5)
- ❌ **NÃO envia** para os 5 que pediram opt-out
- ✅ Automaticamente respeitado

---

## ⚖️ LGPD (Lei Geral de Proteção de Dados)

### Por que é importante?

**LGPD exige:**
- ✅ Você **DEVE** oferecer opção de descadastramento
- ✅ Você **DEVE** respeitar quando alguém pede para sair
- ✅ Você **NÃO pode** enviar para quem pediu opt-out

### No seu sistema:
- ✅ Campo `optOut` no banco
- ✅ Sistema **filtra automaticamente** opt-outs
- ✅ Botão "Opt-out em Massa" na interface
- ✅ Respeita a LGPD automaticamente

---

## 🔧 Como Usar no Sistema

### 1. **Ver quem está em Opt-Out**
- Na página de Contatos
- Filtre por status ou veja a coluna

### 2. **Colocar em Opt-Out Manualmente**
- Edite o contato
- Marque "Opt-Out"
- Salve

### 3. **Opt-Out em Massa**
- Botão "🛡️ Opt-out em Massa" na página de Contatos
- Cole uma lista de emails
- Clique em "Aplicar Opt-Out"
- Todos são marcados automaticamente

### 4. **Opt-Out Automático**
- Quando alguém clica em "Descadastrar" no email
- Sistema marca automaticamente
- Não precisa fazer nada

---

## 📊 No Banco de Dados

```sql
Contact {
  optOut: Boolean,      // false = pode receber, true = NÃO pode receber
  optOutAt: DateTime?, // Quando pediu para sair
}
```

### Quando optOut = false:
- ✅ **Pode receber** campanhas
- ✅ Incluído nas buscas de contatos
- ✅ Email/WhatsApp será enviado

### Quando optOut = true:
- ❌ **NÃO pode receber** campanhas
- ❌ **Excluído automaticamente** das campanhas
- ❌ Sistema **não envia** nada

---

## 🔍 Como o Sistema Filtra

### No código (automaticamente):

```typescript
// Buscar contatos válidos (sem opt-out)
const validContacts = await prisma.contact.findMany({
  where: {
    status: 'active',
    optOut: false,  // ✅ Apenas quem NÃO pediu opt-out
  }
});
```

### Quando envia email:

```typescript
// Filtra automaticamente opt-outs
const allowedEmails = contacts.filter(c => !c.optOut);
```

---

## 💡 Exemplo Real

### Situação:
- **João** está na sua lista
- Você envia campanha para ele
- Ele clica em "Descadastrar" no rodapé do email

### O que acontece:
1. ✅ Sistema marca: `optOut = true`
2. ✅ Data registrada: `optOutAt = hoje`
3. ✅ Próxima campanha: **João NÃO recebe**
4. ✅ Sistema respeita automaticamente

---

## 🎯 Resumo

### Opt-Out = "Não quero mais receber"

- ✅ **Respeitado automaticamente** pelo sistema
- ✅ **Obrigatório por lei** (LGPD)
- ✅ **Protege você** de problemas legais
- ✅ **Mantém boa reputação** (não spamma quem não quer)

### No seu sistema:
- Campo `optOut` no banco
- Filtro automático nas campanhas
- Botão para opt-out em massa
- Interface para gerenciar

---

## ✅ Está tudo configurado!

O sistema já respeita opt-out automaticamente. Você não precisa fazer nada - quando alguém pede para sair, o sistema **não envia mais** para aquela pessoa.

