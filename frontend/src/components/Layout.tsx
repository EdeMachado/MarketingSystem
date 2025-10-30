import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/buscar-empresas', label: 'Buscar Empresas', icon: '🔍' },
    { path: '/empresas', label: 'Empresas', icon: '🏢' },
    { path: '/campanhas', label: 'Campanhas', icon: '📧' },
    { path: '/automacoes', label: 'Automações', icon: '⚙️' },
    { path: '/contatos', label: 'Contatos', icon: '👥' },
    { path: '/segmentos', label: 'Segmentos', icon: '🗂️' },
    { path: '/producao', label: 'Produção', icon: '🎬' },
    { path: '/ativos', label: 'Ativos', icon: '🎛️' },
    { path: '/relatorios', label: 'Relatórios', icon: '📈' },
    { path: '/insights', label: 'Insights', icon: '💡' },
    { path: '/templates', label: 'Templates', icon: '📝' },
    { path: '/configuracoes', label: 'Configurações', icon: '🔧' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar em azul marinho */}
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-900 text-white">
        <div className="h-16 flex items-center px-4 border-b border-blue-800">
          <div>
            <div className="text-lg font-bold">Grupo Biomed</div>
            <div className="text-xs text-blue-200">Marketing System</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      active
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-3 text-xs text-blue-200 border-t border-blue-800">
          © {new Date().getFullYear()} Grupo Biomed
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {/* Topbar em telas pequenas */}
        <div className="md:hidden bg-blue-900 text-white px-4 py-3">Grupo Biomed - Marketing</div>
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

