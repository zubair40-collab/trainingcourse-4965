import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getCourses, getRegistrations, getAttendance } from '../../lib/db'
import { sendNewCourseAnnouncement } from '../../lib/email'
import { Send, Users, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Communications() {
  const [courses, setCourses] = useState([])
  const [sourceCourse, setSourceCourse] = useState('')
  const [targetCourse, setTargetCourse] = useState('')
  const [groupFilter, setGroupFilter] = useState([])
  const [recipients, setRecipients] = useState([])
  const [selected, setSelected] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    getCourses().then(cs => { setCourses(cs); if (cs.length > 0) setSourceCourse(cs[0].id) })
  }, [])

  useEffect(() => {
    if (!sourceCourse) return
    Promise.all([getRegistrations(sourceCourse), getAttendance(sourceCourse)]).then(([regs, attendance]) => {
      const attendedIds = attendance.filter(a => a.attended).map(a => a.registrationId)
      let pool = []
      if (groupFilter.length === 0 || groupFilter.includes('successful')) {
        regs.filter(r => r.status === 'successful').forEach(r => {
          if (!pool.find(p => p.email === r.email)) pool.push({ ...r, group: 'Successful Candidate', attended: attendedIds.includes(r.id) })
        })
      }
      if (groupFilter.length === 0 || groupFilter.includes('waiting_list')) {
        regs.filter(r => r.status === 'waiting_list').forEach(r => {
          if (!pool.find(p => p.email === r.email)) pool.push({ ...r, group: 'Waiting List', attended: false })
        })
      }
      setRecipients(pool)
      setSelected([])
    })
  }, [sourceCourse, groupFilter])

  const toggleGroup = (g) => setGroupFilter(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  const toggleSelect = (email) => setSelected(p => p.includes(email) ? p.filter(x => x !== email) : [...p, email])

  const handleSend = async () => {
    if (selected.length === 0) { toast.error('Select at least one recipient'); return }
    if (!targetCourse) { toast.error('Select the new course to announce'); return }
    const course = courses.find(c => c.id === targetCourse)
    if (!course) return
    setSending(true)
    const targets = recipients.filter(r => selected.includes(r.email))
    for (const r of targets) await sendNewCourseAnnouncement(r, course)
    toast.success(`Announcement sent to ${targets.length} recipient(s)!`)
    setSending(false)
    setSelected([])
  }

  return (
    <AdminLayout>
      <div className="page-header"><h1>Communications</h1><p>Send new course announcements to previous attendees and waiting list candidates</p></div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 700 }}>1. Configure</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Source – previous course</label>
              <select className="form-input form-select" value={sourceCourse} onChange={e => setSourceCourse(e.target.value)}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Group</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[{ key: 'successful', label: 'Successful Candidates', icon: CheckCircle }, { key: 'waiting_list', label: 'Waiting List', icon: Clock }].map(({ key, label, icon: Icon }) => (
                  <label key={key} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.625rem 0.875rem', border: `1.5px solid ${groupFilter.includes(key) ? 'var(--blue-500)' : 'var(--gray-300)'}`, borderRadius: '0.5rem', cursor: 'pointer', background: groupFilter.includes(key) ? 'var(--blue-50)' : 'white' }}>
                    <input type="checkbox" checked={groupFilter.includes(key)} onChange={() => toggleGroup(key)} />
                    <Icon size={14} /><span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
                  </label>
                ))}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '0.375rem' }}>Leave unchecked to show all groups</div>
            </div>
            <div className="divider" />
            <div className="form-group">
              <label className="form-label">New Course to Announce</label>
              <select className="form-input form-select" value={targetCourse} onChange={e => setTargetCourse(e.target.value)}>
                <option value="">— Select a course to announce —</option>
                {courses.filter(c => c.id !== sourceCourse).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSend} disabled={sending || selected.length === 0 || !targetCourse}>
              {sending ? <span className="spinner" /> : <><Send size={16} /> Send to {selected.length} Recipient(s)</>}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700 }}>2. Select Recipients ({recipients.length})</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(selected.length === recipients.length ? [] : recipients.map(r => r.email))}>
              {selected.length === recipients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div style={{ maxHeight: 480, overflowY: 'auto' }}>
            {recipients.length === 0 ? (
              <div className="empty-state"><Users size={40} /><p>No recipients found.</p></div>
            ) : (
              recipients.map(reg => (
                <div key={reg.email} onClick={() => toggleSelect(reg.email)} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: '0.875rem', alignItems: 'center', cursor: 'pointer', background: selected.includes(reg.email) ? 'var(--blue-50)' : 'white' }}>
                  <input type="checkbox" checked={selected.includes(reg.email)} onChange={() => {}} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{reg.firstName} {reg.lastName}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{reg.email} · {reg.businessName}</div>
                  </div>
                  <span className={`badge ${reg.group === 'Successful Candidate' ? 'badge-success' : 'badge-info'}`}>{reg.group}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
