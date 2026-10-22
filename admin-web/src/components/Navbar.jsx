import { useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ onLogout }) {
  const navigate = useNavigate()
  const userEmail = localStorage.getItem('userEmail') || 'Admin'

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🎀 DC Brand Admin</h1>
      </div>
      <div className="navbar-user">
        <span className="user-email">{userEmail}</span>
        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>
      </div>
    </nav>
  )
}
