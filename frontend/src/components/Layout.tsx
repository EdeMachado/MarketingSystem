import { ReactNode, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const shownAlerts = useRef<Set<string>>(new Set());

  // Verificar alertas de uso da API globalmente (Google Places)
  const { data: apiAlertsData } = useQuery(
    'api-usage-alerts',
    async () => {
      try {
        const res = await api.get('/api-usage/alerts');
        return res.data.data;
      } catch {
        return { alerts: [] };
      }
    },
    {
      refetchInterval: 30000, // Verificar a cada 30 segundos
      refetchOnWindowFocus: true,
    }
  );

  // Verificar alertas de custos dos canais
  const { data: channelAlertsData } = useQuery(
    'channel-costs-alerts',
    async () => {
      try {
        const res = await api.get('/channel-costs/alerts');
        return res.data.data || [];
      } catch {
        return [];
      }
    },
    {
      refetchInterval: 30000, // Verificar a cada 30 segundos
      refetchOnWindowFocus: true,
    }
  );

  // Mostrar alertas como notificações (sem duplicar)
  useEffect(() => {
    // Alertas do Google Places API
    if (apiAlertsData?.alerts && apiAlertsData.alerts.length > 0) {
      apiAlertsData.alerts.forEach((alert: any) => {
        const alertKey = `api-${alert.type}-${alert.message.substring(0, 50)}`;
        
        if (!shownAlerts.current.has(alertKey)) {
          shownAlerts.current.add(alertKey);
          
          if (alert.type === 'danger') {
            toast.error(alert.message, { 
              duration: 20000,
              icon: '🚨',
              position: 'top-center',
            });
          } else if (alert.type === 'warning') {
            toast(alert.message, {
              icon: '⚠️',
              duration: 12000,
              position: 'top-center',
            });
          }
        }
      });
    }

    // Alertas de custos dos canais (Email, WhatsApp, etc)
    if (channelAlertsData && channelAlertsData.length > 0) {
      channelAlertsData.forEach((alert: any) => {
        const alertKey = `channel-${alert.channel}-${alert.type}-${alert.message.substring(0, 50)}`;
        
        if (!shownAlerts.current.has(alertKey)) {
          shownAlerts.current.add(alertKey);
          
          if (alert.type === 'critical') {
            toast.error(alert.message, { 
              duration: 20000,
              icon: '🚨',
              position: 'top-center',
            });
          } else if (alert.type === 'warning') {
            toast(alert.message, {
              icon: '⚠️',
              duration: 12000,
              position: 'top-center',
            });
          }
        }
      });
    }
    
    // Limpar alertas antigos após 5 minutos
    const cleanup = setTimeout(() => {
      shownAlerts.current.clear();
    }, 300000);
    
    return () => clearTimeout(cleanup);
  }, [apiAlertsData?.alerts, channelAlertsData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conteúdo - Sem menu lateral */}
      <div className="w-full">
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

