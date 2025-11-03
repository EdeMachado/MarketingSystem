import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';

interface NavCard {
  path: string;
  icon: string;
  title: string;
}

interface Section {
  title: string;
  icon: string;
  cards: NavCard[];
}

export default function Home() {
  // Buscar estatísticas rápidas
  const { data: campaigns } = useQuery('home-campaigns', async () => {
    const res = await api.get('/campaigns');
    return res.data.data;
  });

  const { data: contacts } = useQuery('home-contacts', async () => {
    const res = await api.get('/contacts?limit=10000');
    return res.data.data;
  });

  const totalCampaigns = campaigns?.length || 0;
  const totalContacts = contacts?.length || 0;

  // Organizar cards em seções
  const sections: Section[] = [
    {
      title: 'Gestão de Base',
      icon: '📋',
      cards: [
        {
          path: '/buscar-empresas',
          icon: '🔍',
          title: 'Buscar Empresas',
        },
        {
          path: '/empresas',
          icon: '🏢',
          title: 'Empresas',
        },
        {
          path: '/contatos',
          icon: '👥',
          title: 'Contatos',
        },
        {
          path: '/segmentos',
          icon: '🗂️',
          title: 'Segmentos',
        },
      ],
    },
    {
      title: 'Campanhas & Marketing',
      icon: '📧',
      cards: [
        {
          path: '/publicar',
          icon: '🚀',
          title: 'Publicar',
        },
        {
          path: '/campanhas',
          icon: '📧',
          title: 'Campanhas',
        },
        {
          path: '/automacoes',
          icon: '⚙️',
          title: 'Automações',
        },
        {
          path: '/templates',
          icon: '📝',
          title: 'Templates',
        },
      ],
    },
    {
      title: 'Análises & Relatórios',
      icon: '📊',
      cards: [
        {
          path: '/dashboard',
          icon: '📊',
          title: 'Dashboard',
        },
        {
          path: '/relatorios',
          icon: '📈',
          title: 'Relatórios',
        },
        {
          path: '/insights',
          icon: '💡',
          title: 'Insights',
        },
      ],
    },
    {
      title: 'Produção & Ativos',
      icon: '🎬',
      cards: [
        {
          path: '/producao',
          icon: '🎬',
          title: 'Produção',
        },
        {
          path: '/ativos',
          icon: '🎛️',
          title: 'Ativos',
        },
      ],
    },
    {
      title: 'SEO & Otimização',
      icon: '🔍',
      cards: [
        {
          path: '/seo',
          icon: '🔍',
          title: 'SEO',
        },
      ],
    },
    {
      title: 'Configurações',
      icon: '⚙️',
      cards: [
        {
          path: '/configuracoes',
          icon: '🔧',
          title: 'Configurações',
        },
        {
          path: '/api-usage',
          icon: '💰',
          title: 'Controle de Custos',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header com Branding */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Marketing System
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 font-medium">
              Sistema completo de gestão de marketing - Grupo Biomed
            </p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/50 text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalCampaigns}</div>
            <div className="text-xs text-gray-600 mt-1">Campanhas</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/50 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalContacts}</div>
            <div className="text-xs text-gray-600 mt-1">Contatos</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/50 text-center">
            <div className="text-2xl font-bold text-green-600">
              {sections.reduce((acc, section) => acc + section.cards.length, 0)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Módulos</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/50 text-center">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-xs text-gray-600 mt-1">Disponível</div>
          </div>
        </div>

        {/* Cards Organizados em Seções - Preenchendo espaços */}
        <div className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {sections.map((section) =>
              section.cards.map((card) => (
                <Link
                  key={card.path}
                  to={card.path}
                  className="group bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/80 hover:border-indigo-400 hover:bg-white hover:-translate-y-1"
                >
                  {/* Card Content */}
                  <div className="p-6 h-36 flex flex-col items-center justify-center text-center">
                    {/* Ícone simples */}
                    <div className="mb-3 text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {card.icon}
                    </div>
                    
                    {/* Título */}
                    <h3 className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">
                      {card.title}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Footer informativo */}
        <div className="text-center pt-8 border-t border-gray-200/50">
          <p className="text-gray-500 text-sm mb-2">
            Selecione um módulo acima para começar
          </p>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Grupo Biomed - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

