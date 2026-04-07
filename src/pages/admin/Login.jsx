import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../lib/db'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (adminLogin(password)) {
      navigate('/admin/dashboard')
    } else {
      setError('Incorrect password. Default password is: admin123')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--blue-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '1rem', padding: '2.5rem', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--blue-700)' }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontWeight: 800, color: 'var(--blue-900)', fontSize: '1.375rem' }}>Admin Portal</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Consulting Direct UK Limited</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            Sign In
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
          Default password: <code style={{ background: 'var(--gray-100)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>admin123</code>
          <br />Change in Settings after first login
        </p>
      </div>
    </div>
  )
}
