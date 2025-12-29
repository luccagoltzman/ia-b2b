import { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import BottomNav from '../BottomNav/BottomNav'
import './Layout.scss'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default Layout

