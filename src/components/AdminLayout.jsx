import { useNavigate, useLocation } from 'react-router-dom'
import { adminLogout, isAdminLoggedIn } from '../lib/db'
import {
  LayoutDashboard, BookOpen, Users, ClipboardCheck,
  Award, Send, Settings, LogOut, FileText, ChevronRight
} from 'lucide-react'

export function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!isAdminLoggedIn()) {
    navigate('/admin/login')
    return null
  }

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const NavLink = ({ to, icon: Icon, label }) => (
    <button
      className={`sidebar-link ${isActive(to) ? 'active' : ''}`}
      onClick={() => navigate(to)}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Consulting Direct UK</h2>
          <span>Admin Portal</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Overview</div>
          <NavLink to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />

          <div className="sidebar-section">Courses</div>
          <NavLink to="/admin/courses" icon={BookOpen} label="Manage Courses" />
          <NavLink to="/admin/registrations" icon={Users} label="Registrations" />
          <NavLink to="/admin/joining-instructions" icon={FileText} label="Joining Instructions" />

          <div className="sidebar-section">On The Day</div>
          <NavLink to="/admin/attendance" icon={ClipboardCheck} label="Mark Attendance" />

          <div className="sidebar-section">Post-Course</div>
          <NavLink to="/admin/certificates" icon={Award} label="Certificates" />
          <NavLink to="/admin/communications" icon={Send} label="Communications" />

          <div className="sidebar-section">System</div>
          <NavLink to="/admin/email-log" icon={FileText} label="Email Log" />
          <NavLink to="/admin/settings" icon={Settings} label="Settings" />
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="sidebar-link" onClick={handleLogout} style={{ color: 'rgba(255,100,100,0.8)', width: '100%' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            <span>Admin</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>
              {location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
            </span>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>zubi@consultingdirect.ai</span>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  )
}
