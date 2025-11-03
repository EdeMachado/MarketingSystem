import * as fs from 'fs';
import * as path from 'path';

interface ChannelUsage {
  email: {
    sentToday: number;
    limitPerDay: number;
    resetAt: string; // ISO date
  };
  whatsapp: {
    sentThisMonth: number;
    costThisMonth: number;
    costPerMessage: number; // em USD
    monthlyLimit: number; // em USD
    resetAt: string; // ISO date
  };
  instagram: {
    postsThisMonth: number;
  };
  facebook: {
    postsThisMonth: number;
  };
  linkedin: {
    postsThisMonth: number;
  };
  telegram: {
    messagesThisMonth: number;
  };
  googlePlaces: {
    // Já existe em api-usage-tracker.service.ts
  };
}

interface ChannelCostConfig {
  whatsapp: {
    costPerMessage: number; // USD por mensagem
    monthlyLimit: number; // USD por mês
  };
  email: {
    limitPerDay: number; // Emails por dia
  };
}

const USAGE_FILE = path.join(__dirname, '../../channel-usage-tracker.json');
const CONFIG_FILE = path.join(__dirname, '../../channel-cost-config.json');

// Carregar configurações de custo
export const loadCostConfig = (): ChannelCostConfig => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Erro ao carregar config de custos:', error);
  }

  // Configuração padrão
  return {
    whatsapp: {
      costPerMessage: 0.01, // $0.01 por mensagem (ajustar conforme seu plano)
      monthlyLimit: 50, // $50/mês limite
    },
    email: {
      limitPerDay: 500, // Gmail free limit
    },
  };
};

// Salvar configurações de custo
export const saveCostConfig = (config: ChannelCostConfig) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Erro ao salvar config de custos:', error);
  }
};

// Carregar uso dos canais
export const loadChannelUsage = (): ChannelUsage => {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Erro ao carregar uso de canais:', error);
  }

  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Uso padrão (zerado)
  return {
    email: {
      sentToday: 0,
      limitPerDay: 500,
      resetAt: tomorrow.toISOString(),
    },
    whatsapp: {
      sentThisMonth: 0,
      costThisMonth: 0,
      costPerMessage: 0.01,
      monthlyLimit: 50,
      resetAt: resetDate,
    },
    instagram: {
      postsThisMonth: 0,
    },
    facebook: {
      postsThisMonth: 0,
    },
    linkedin: {
      postsThisMonth: 0,
    },
    telegram: {
      messagesThisMonth: 0,
    },
    googlePlaces: {
      // Gerenciado separadamente em api-usage-tracker.service.ts
    },
  };
};

// Salvar uso dos canais
export const saveChannelUsage = (usage: ChannelUsage) => {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
  } catch (error) {
    console.error('Erro ao salvar uso de canais:', error);
  }
};

// Resetar contadores diários/mensais se necessário
export const resetIfNeeded = () => {
  const usage = loadChannelUsage();
  const now = new Date();
  let updated = false;

  // Reset email diário
  if (new Date(usage.email.resetAt) <= now) {
    usage.email.sentToday = 0;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    usage.email.resetAt = tomorrow.toISOString();
    updated = true;
  }

  // Reset WhatsApp mensal
  if (new Date(usage.whatsapp.resetAt) <= now) {
    usage.whatsapp.sentThisMonth = 0;
    usage.whatsapp.costThisMonth = 0;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    usage.whatsapp.resetAt = nextMonth.toISOString();
    updated = true;
  }

  if (updated) {
    saveChannelUsage(usage);
  }

  return usage;
};

// Registrar envio de email
export const trackEmailSent = (count: number = 1) => {
  const usage = resetIfNeeded();
  usage.email.sentToday += count;
  saveChannelUsage(usage);
  return usage.email;
};

// Registrar envio de WhatsApp
export const trackWhatsAppSent = (count: number = 1) => {
  const usage = resetIfNeeded();
  const config = loadCostConfig();
  
  usage.whatsapp.sentThisMonth += count;
  usage.whatsapp.costThisMonth += count * config.whatsapp.costPerMessage;
  usage.whatsapp.costPerMessage = config.whatsapp.costPerMessage;
  usage.whatsapp.monthlyLimit = config.whatsapp.monthlyLimit;
  
  saveChannelUsage(usage);
  return usage.whatsapp;
};

// Registrar post no Instagram
export const trackInstagramPost = (count: number = 1) => {
  const usage = resetIfNeeded();
  usage.instagram.postsThisMonth += count;
  saveChannelUsage(usage);
  return usage.instagram;
};

// Registrar post no Facebook
export const trackFacebookPost = (count: number = 1) => {
  const usage = resetIfNeeded();
  usage.facebook.postsThisMonth += count;
  saveChannelUsage(usage);
  return usage.facebook;
};

// Registrar post no LinkedIn
export const trackLinkedInPost = (count: number = 1) => {
  const usage = resetIfNeeded();
  usage.linkedin.postsThisMonth += count;
  saveChannelUsage(usage);
  return usage.linkedin;
};

// Registrar mensagem no Telegram
export const trackTelegramMessage = (count: number = 1) => {
  const usage = resetIfNeeded();
  usage.telegram.messagesThisMonth += count;
  saveChannelUsage(usage);
  return usage.telegram;
};

// Obter estatísticas de uso
export const getUsageStats = () => {
  const usage = resetIfNeeded();
  const config = loadCostConfig();

  return {
    email: {
      sent: usage.email.sentToday,
      limit: usage.email.limitPerDay,
      remaining: Math.max(0, usage.email.limitPerDay - usage.email.sentToday),
      percentageUsed: (usage.email.sentToday / usage.email.limitPerDay) * 100,
      resetAt: usage.email.resetAt,
    },
    whatsapp: {
      sent: usage.whatsapp.sentThisMonth,
      cost: usage.whatsapp.costThisMonth,
      limit: config.whatsapp.monthlyLimit,
      remaining: Math.max(0, config.whatsapp.monthlyLimit - usage.whatsapp.costThisMonth),
      percentageUsed: (usage.whatsapp.costThisMonth / config.whatsapp.monthlyLimit) * 100,
      costPerMessage: config.whatsapp.costPerMessage,
      resetAt: usage.whatsapp.resetAt,
    },
    instagram: {
      posts: usage.instagram.postsThisMonth,
      cost: 0, // Gratuito
    },
    facebook: {
      posts: usage.facebook.postsThisMonth,
      cost: 0, // Gratuito
    },
    linkedin: {
      posts: usage.linkedin.postsThisMonth,
      cost: 0, // Gratuito
    },
    telegram: {
      messages: usage.telegram.messagesThisMonth,
      cost: 0, // Gratuito
    },
  };
};

// Obter alertas
export const getChannelAlerts = () => {
  const stats = getUsageStats();
  const alerts: Array<{
    channel: string;
    type: 'warning' | 'critical';
    message: string;
    percentage: number;
  }> = [];

  // Alerta Email
  if (stats.email.percentageUsed >= 90) {
    alerts.push({
      channel: 'email',
      type: 'critical',
      message: `⚠️ CRÍTICO: ${stats.email.sent}/${stats.email.limit} emails enviados hoje (${Math.round(stats.email.percentageUsed)}%). Limite quase atingido!`,
      percentage: stats.email.percentageUsed,
    });
  } else if (stats.email.percentageUsed >= 70) {
    alerts.push({
      channel: 'email',
      type: 'warning',
      message: `⚠️ Atenção: ${stats.email.sent}/${stats.email.limit} emails enviados hoje (${Math.round(stats.email.percentageUsed)}%).`,
      percentage: stats.email.percentageUsed,
    });
  }

  // Alerta WhatsApp
  if (stats.whatsapp.percentageUsed >= 90) {
    alerts.push({
      channel: 'whatsapp',
      type: 'critical',
      message: `🚨 CRÍTICO: $${stats.whatsapp.cost.toFixed(2)}/${stats.whatsapp.limit} gasto no WhatsApp este mês (${Math.round(stats.whatsapp.percentageUsed)}%). Limite quase atingido!`,
      percentage: stats.whatsapp.percentageUsed,
    });
  } else if (stats.whatsapp.percentageUsed >= 70) {
    alerts.push({
      channel: 'whatsapp',
      type: 'warning',
      message: `⚠️ Atenção: $${stats.whatsapp.cost.toFixed(2)}/${stats.whatsapp.limit} gasto no WhatsApp este mês (${Math.round(stats.whatsapp.percentageUsed)}%).`,
      percentage: stats.whatsapp.percentageUsed,
    });
  }

  return alerts;
};

