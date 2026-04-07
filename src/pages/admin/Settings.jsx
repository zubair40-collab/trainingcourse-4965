import { useState } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getAdminPassword, setAdminPassword } from '../../lib/db'
import { Settings as SettingsIcon, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const handleChangePw = (e) => {
    e.preventDefault()
    if (oldPw !== getAdminPassword()) { toast.error('Current password is incorrect'); return }
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    setAdminPassword(newPw)
    setOldPw(''); setNewPw(''); setConfirmPw('')
    toast.success('Password updated successfully')
  }

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Settings</h1>
        <p>System configuration</p>
      </div>

      <div style={{ maxWidth: 480 }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700 }}>Change Admin Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleChangePw}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Update Password
              </button>
            </form>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header"><h3 style={{ fontWeight: 700 }}>System Info</h3></div>
          <div className="card-body">
            <table style={{ fontSize: '0.9rem' }}>
              <tbody>
                {[
                  ['Organisation', 'Consulting Direct UK Limited'],
                  ['Admin Email', 'zubi@consultingdirect.ai'],
                  ['Default Class Size', '12 attendees'],
                  ['Version', '1.0.0'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: 'var(--gray-500)', padding: '0.5rem 0.75rem 0.5rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>{k}</td>
                    <td style={{ padding: '0.5rem 0' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
