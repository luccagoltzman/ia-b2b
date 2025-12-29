import './Header.scss'

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Dashboard</h1>
        <div className="header-actions">
          <div className="header-user">
            <span className="header-avatar">👤</span>
            <span className="header-name">Representante</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

