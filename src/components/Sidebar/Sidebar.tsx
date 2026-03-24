import { NavLink } from 'react-router-dom'
import './Sidebar.scss'

const Sidebar = () => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/analises', label: 'Análises', icon: '📈' },
    { path: '/propostas', label: 'Propostas', icon: '📝' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/produtos', label: 'Produtos', icon: '📦' },
    { path: '/area-cliente', label: 'Área do Cliente', icon: '🏪' },
    { path: '/simular-retorno', label: 'Simular Retorno', icon: '🔄' },
    { path: '/visitas', label: 'Visitas', icon: '📍' },
    { path: '/pos-venda', label: 'Pós-Venda', icon: '📦' },
    { path: '/configuracoes', label: 'Configurações', icon: '⚙️' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">IA B2B</h2>
        <p className="sidebar-subtitle">Representantes Comerciais</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar

