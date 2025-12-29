import { NavLink } from 'react-router-dom'
import './BottomNav.scss'

const BottomNav = () => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/analises', label: 'Análises', icon: '📈' },
    { path: '/propostas', label: 'Propostas', icon: '📝' },
    { path: '/visitas', label: 'Visitas', icon: '📍' },
    { path: '/configuracoes', label: 'Config', icon: '⚙️' },
  ]

  return (
    <nav className="bottom-nav">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav

