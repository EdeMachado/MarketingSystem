import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import Configuracoes from './pages/Configuracoes';
import CompanySearch from './pages/CompanySearch';
import Automations from './pages/Automations';
import Companies from './pages/Companies';
import Segments from './pages/Segments';
import Reports from './pages/Reports';
import Insights from './pages/Insights';
import Projects from './pages/Projects';
import Assets from './pages/Assets';
import Tasks from './pages/Tasks';
import Producao from './pages/Producao';
import ApiUsage from './pages/ApiUsage';
import SEO from './pages/SEO';
import AutoPublish from './pages/AutoPublish';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campanhas" element={<Campaigns />} />
        <Route path="/contatos" element={<Contacts />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/buscar-empresas" element={<CompanySearch />} />
        <Route path="/empresas" element={<Companies />} />
        <Route path="/automacoes" element={<Automations />} />
        <Route path="/segmentos" element={<Segments />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/ativos" element={<Assets />} />
        <Route path="/tarefas" element={<Tasks />} />
        <Route path="/producao" element={<Producao />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/api-usage" element={<ApiUsage />} />
        <Route path="/seo" element={<SEO />} />
        <Route path="/publicar" element={<AutoPublish />} />
      </Routes>
    </Layout>
  );
}

export default App;

