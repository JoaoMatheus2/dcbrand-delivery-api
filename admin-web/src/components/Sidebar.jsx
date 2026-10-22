import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/produtos" 
          className={`nav-link ${isActive('/produtos') ? 'active' : ''}`}
        >
          📦 Produtos
        </Link>
        <Link 
          to="/estoque" 
          className={`nav-link ${isActive('/estoque') ? 'active' : ''}`}
        >
          📋 Estoque
        </Link>
      </nav>
    </aside>
  )
}
