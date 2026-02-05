import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Analises from './pages/Analises/Analises'
import Propostas from './pages/Propostas/Propostas'
import Visitas from './pages/Visitas/Visitas'
import PosVenda from './pages/PosVenda/PosVenda'
import Configuracoes from './pages/Configuracoes/Configuracoes'
import Clientes from './pages/Clientes/Clientes'
import SimularRetorno from './pages/SimularRetorno/SimularRetorno'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analises" element={<Analises />} />
          <Route path="/propostas" element={<Propostas />} />
          <Route path="/visitas" element={<Visitas />} />
          <Route path="/pos-venda" element={<PosVenda />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/simular-retorno" element={<SimularRetorno />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
