import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import Configuracoes from './pages/Configuracoes';
import CompanySearch from './pages/CompanySearch';
import Automations from './pages/Automations';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campanhas" element={<Campaigns />} />
        <Route path="/contatos" element={<Contacts />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/buscar-empresas" element={<CompanySearch />} />
        <Route path="/automacoes" element={<Automations />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Routes>
    </Layout>
  );
}

export default App;

