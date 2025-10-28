# 🚀 Marketing System - Grupo Biomed

Sistema completo de marketing em massa para Email, WhatsApp, Instagram e Facebook.

## 📋 Status do Projeto

- ✅ Sistema funcional e operacional
- ⚠️ **PENDENTE:** Configurar SMTP no arquivo `.env` para enviar emails

## 🚀 Como Começar

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Configurar SMTP

Veja: `backend/README-CONFIGURAR-SMTP.md`

## 📁 Estrutura

- `backend/` - API Node.js + Express + Prisma
- `frontend/` - Interface React + TypeScript + Vite
- `docs/` - Documentação

## 🎯 Funcionalidades

- ✅ Campanhas (Email, WhatsApp, Instagram, Facebook)
- ✅ Gestão de Contatos (CRUD + Importação em massa)
- ✅ Templates personalizados
- ✅ Dashboard com métricas
- ✅ Tracking de emails
- ✅ Agendamento de campanhas

## ⚠️ IMPORTANTE

**Configure o SMTP antes de usar!**

Execute: `node backend/configurar-smtp.js`

Ou veja: `README-CONFIGURAR-SMTP.md`

---

**Desenvolvido para Grupo Biomed - Saúde Ocupacional**
