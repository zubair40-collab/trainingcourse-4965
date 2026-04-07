import { Link, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export function PublicLayout({ children }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="public-nav">
        <Link to="/" className="nav-logo">Consulting Direct UK</Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>Courses</Link>
          <Link to="/account" className={`nav-link ${isActive('/account') ? 'active' : ''}`}>My Account</Link>
          <Link to="/admin" className="btn btn-primary btn-sm" style={{ marginLeft: '0.5rem' }}>Admin</Link>
        </div>
      </nav>
      <main style={{ flex: 1 }}>{children}</main>
      <footer className="public-footer">
        <p><strong>Consulting Direct UK Limited</strong></p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.8125rem' }}>
          Empowering small and medium businesses with expert knowledge
        </p>
      </footer>
    </div>
  )
}
