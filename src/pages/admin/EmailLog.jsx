import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getEmailLog } from '../../lib/db'
import { Mail, RefreshCw } from 'lucide-react'

const typeLabels = {
  registration_confirmation: 'Registration Received',
  acceptance: 'Acceptance',
  waiting_list: 'Waiting List',
  joining_instructions: 'Joining Instructions',
  certificate: 'Certificate',
  new_course_announcement: 'New Course Announcement',
  email_verification: 'Email Verification',
}

const typeColors = {
  acceptance: 'badge-success',
  waiting_list: 'badge-warning',
  certificate: 'badge-info',
  joining_instructions: 'badge-info',
  registration_confirmation: 'badge-gray',
  new_course_announcement: 'badge-success',
  email_verification: 'badge-gray',
}

export default function EmailLog() {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setLog(await getEmailLog())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><h1>Email Log</h1><p>All emails sent by the system</p></div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : log.length === 0 ? (
        <div className="card"><div className="empty-state"><Mail size={48} /><p>No emails sent yet.</p></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Time</th><th>To</th><th>Subject</th><th>Type</th></tr>
              </thead>
              <tbody>
                {log.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{new Date(entry.sentAt).toLocaleString('en-GB')}</td>
                    <td style={{ fontSize: '0.875rem' }}>{entry.to}</td>
                    <td style={{ fontSize: '0.875rem' }}>{entry.subject}</td>
                    <td><span className={`badge ${typeColors[entry.type] || 'badge-gray'}`}>{typeLabels[entry.type] || entry.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
