import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Constantes de custo da Google Places API
const GOOGLE_API_COSTS = {
  TEXT_SEARCH: 0.005, // $0.005 por busca de texto
  PLACE_DETAILS: 0.017, // $0.017 por busca de detalhes
  FREE_CREDITS: 200, // $200 USD grátis por mês
};

// Caminho do arquivo de tracking (JSON simples)
const TRACKING_FILE = path.join(process.cwd(), 'api-usage-tracker.json');

interface UsageData {
  currentMonth: string; // YYYY-MM
  textSearches: number;
  placeDetails: number;
  lastReset: string; // ISO date
  history: Array<{
    date: string;
    textSearches: number;
    placeDetails: number;
    cost: number;
  }>;
}

// Carregar dados de uso
const loadUsageData = (): UsageData => {
  try {
    if (fs.existsSync(TRACKING_FILE)) {
      const data = fs.readFileSync(TRACKING_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Verificar se precisa resetar para novo mês
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      if (parsed.currentMonth !== currentMonth) {
        // Novo mês - resetar contadores
        return {
          currentMonth,
          textSearches: 0,
          placeDetails: 0,
          lastReset: now.toISOString(),
          history: parsed.history || [],
        };
      }
      
      return parsed;
    }
  } catch (error) {
    console.error('Erro ao carregar dados de uso:', error);
  }
  
  // Inicializar se não existir
  const now = new Date();
  return {
    currentMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    textSearches: 0,
    placeDetails: 0,
    lastReset: now.toISOString(),
    history: [],
  };
};

// Salvar dados de uso
const saveUsageData = (data: UsageData): void => {
  try {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao salvar dados de uso:', error);
  }
};

// Registrar uma busca de texto
export const trackTextSearch = (): void => {
  const data = loadUsageData();
  data.textSearches += 1;
  saveUsageData(data);
};

// Registrar uma busca de detalhes
export const trackPlaceDetails = (): void => {
  const data = loadUsageData();
  data.placeDetails += 1;
  saveUsageData(data);
};

// Registrar múltiplas buscas
export const trackMultipleSearches = (textSearches: number, placeDetails: number): void => {
  const data = loadUsageData();
  data.textSearches += textSearches;
  data.placeDetails += placeDetails;
  saveUsageData(data);
};

// Calcular custo atual
const calculateCost = (textSearches: number, placeDetails: number): number => {
  return textSearches * GOOGLE_API_COSTS.TEXT_SEARCH + placeDetails * GOOGLE_API_COSTS.PLACE_DETAILS;
};

// Obter estatísticas de uso
export const getUsageStats = () => {
  const data = loadUsageData();
  const cost = calculateCost(data.textSearches, data.placeDetails);
  const remainingCredits = GOOGLE_API_COSTS.FREE_CREDITS - cost;
  const percentageUsed = (cost / GOOGLE_API_COSTS.FREE_CREDITS) * 100;
  
  // Calcular projeção mensal (baseado em dias decorridos do mês)
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = Math.floor((now.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const projectedCost = daysPassed > 0 ? (cost / daysPassed) * daysInMonth : 0;
  
  return {
    currentMonth: data.currentMonth,
    textSearches: data.textSearches,
    placeDetails: data.placeDetails,
    totalSearches: data.textSearches + data.placeDetails,
    cost: parseFloat(cost.toFixed(4)),
    freeCredits: GOOGLE_API_COSTS.FREE_CREDITS,
    remainingCredits: parseFloat(remainingCredits.toFixed(2)),
    percentageUsed: parseFloat(percentageUsed.toFixed(2)),
    projectedCost: parseFloat(projectedCost.toFixed(2)),
    daysPassed,
    daysInMonth,
    lastReset: data.lastReset,
    isNearLimit: percentageUsed >= 70, // 70% = $140 usado - alerta preventivo
    isAtLimit: percentageUsed >= 90, // 90% = $180 usado - alerta crítico
    history: data.history,
  };
};

// Obter alertas
export const getAlerts = () => {
  const stats = getUsageStats();
  const alerts: Array<{ type: 'warning' | 'danger'; message: string }> = [];
  
  // Alerta crítico - 90% usado ($180)
  if (stats.isAtLimit) {
    alerts.push({
      type: 'danger',
      message: `🚨 CRÍTICO: Você usou ${stats.percentageUsed.toFixed(1)}% dos créditos grátis! Restam apenas $${stats.remainingCredits.toFixed(2)} de $${GOOGLE_API_COSTS.FREE_CREDITS}. PARE DE FAZER BUSCAS para evitar custos!`,
    });
  } 
  // Alerta de atenção - 70% usado ($140)
  else if (stats.isNearLimit) {
    alerts.push({
      type: 'warning',
      message: `⚠️ ATENÇÃO: Você já usou ${stats.percentageUsed.toFixed(1)}% dos créditos grátis ($${stats.cost.toFixed(2)}). Restam $${stats.remainingCredits.toFixed(2)}. Monitore seu uso na página "Controle de Custos".`,
    });
  }
  
  // Alerta de projeção - se vai ultrapassar
  if (stats.projectedCost > GOOGLE_API_COSTS.FREE_CREDITS) {
    const excess = stats.projectedCost - GOOGLE_API_COSTS.FREE_CREDITS;
    alerts.push({
      type: 'danger',
      message: `🚨 PROJEÇÃO CRÍTICA: Se continuar nesse ritmo, você ultrapassará os créditos grátis em ~$${excess.toFixed(2)} neste mês. Reduza o uso!`,
    });
  }
  
  // Alerta preventivo - se a projeção está acima de 80%
  if (stats.projectedCost > 160 && stats.projectedCost <= GOOGLE_API_COSTS.FREE_CREDITS) {
    alerts.push({
      type: 'warning',
      message: `📊 Projeção mensal: $${stats.projectedCost.toFixed(2)}. Você está usando os créditos rapidamente. Continue monitorando.`,
    });
  }
  
  return alerts;
};

