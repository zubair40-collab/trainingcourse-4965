import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getCourses, getRegistrations, updateRegistrationStatus, bulkUpdateStatus, getJoiningInstructions } from '../../lib/db'
import { sendAcceptanceEmail, sendWaitingListEmail, sendJoiningInstructions } from '../../lib/email'
import { Users, CheckCircle, Clock, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Registrations() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [registrations, setRegistrations] = useState([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState([])
  const [showJIModal, setShowJIModal] = useState(false)
  const [jiSets, setJiSets] = useState([])
  const [selectedJI, setSelectedJI] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const cs = await getCourses()
    setCourses(cs)
    const regs = selectedCourse === 'all' ? await getRegistrations() : await getRegistrations(selectedCourse)
    setRegistrations(regs)
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedCourse])

  const course = courses.find(c => c.id === selectedCourse)
  const filtered = filter === 'all' ? registrations : registrations.filter(r => r.status === filter)
  const acceptedCount = registrations.filter(r => r.status === 'successful').length

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(r => r.id))

  const handleBulkAction = async (action) => {
    if (selected.length === 0) { toast.error('Select at least one registration'); return }
    const targetRegs = registrations.filter(r => selected.includes(r.id))

    if (action === 'successful') {
      const cap = course?.maxAttendees || 12
      const currentAccepted = registrations.filter(r => r.status === 'successful' && !selected.includes(r.id)).length
      if (currentAccepted + selected.length > cap) { toast.error(`Only ${cap - currentAccepted} places remain.`); return }
    }

    setBusy(true)
    await bulkUpdateStatus(selected, action)
    if (action === 'successful' && course) {
      for (const reg of targetRegs) await sendAcceptanceEmail(reg, course)
      toast.success(`${selected.length} accepted — emails sent`)
    } else if (action === 'waiting_list' && course) {
      for (const reg of targetRegs) await sendWaitingListEmail(reg, course)
      toast.success(`${selected.length} placed on waiting list — emails sent`)
    } else {
      toast.success(`${selected.length} updated`)
    }
    setSelected([])
    setBusy(false)
    load()
  }

  const openSendJI = async () => {
    if (selected.length === 0) { toast.error('Select recipients first'); return }
    const courseId = registrations.find(r => r.id === selected[0])?.courseId
    if (!courseId) return
    const sets = await getJoiningInstructions(courseId)
    setJiSets(sets)
    setSelectedJI('')
    setShowJIModal(true)
  }

  const handleSendJI = async () => {
    const ji = jiSets.find(j => j.id === selectedJI)
    if (!ji) { toast.error('Select a set'); return }
    setBusy(true)
    const targetRegs = registrations.filter(r => selected.includes(r.id))
    for (const reg of targetRegs) {
      const c = courses.find(c => c.id === reg.courseId)
      if (c) await sendJoiningInstructions(reg, c, ji)
    }
    toast.success(`Joining instructions sent to ${selected.length} candidates`)
    setBusy(false)
    setShowJIModal(false)
    setSelected([])
  }

  const statusColor = { pending: 'badge-warning', successful: 'badge-success', waiting_list: 'badge-info' }
  const statusLabel = { pending: 'Pending', successful: 'Successful', waiting_list: 'Waiting List' }

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>Registrations</h1><p>Review and manage course applicants</p></div>
        <select className="form-input form-select" style={{ width: 'auto' }} value={selectedCourse}
          onChange={e => { setSelectedCourse(e.target.value); setSelected([]) }}>
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: registrations.length, status: 'all' },
          { label: 'Pending Review', value: registrations.filter(r => r.status === 'pending').length, status: 'pending' },
          { label: 'Successful', value: registrations.filter(r => r.status === 'successful').length, status: 'successful' },
          { label: 'Waiting List', value: registrations.filter(r => r.status === 'waiting_list').length, status: 'waiting_list' },
        ].map(({ label, value, status }) => (
          <button key={label} onClick={() => setFilter(status)} className="stat-card" style={{ cursor: 'pointer', border: filter === status ? '2px solid var(--blue-500)' : undefined }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: '1.625rem' }}>{value}</div>
          </button>
        ))}
      </div>

      {course && (
        <div className={`alert ${acceptedCount >= course.maxAttendees ? 'alert-warning' : 'alert-info'}`} style={{ marginBottom: '1rem' }}>
          Places filled: <strong>{acceptedCount}/{course.maxAttendees}</strong> — {Math.max(0, course.maxAttendees - acceptedCount)} remaining
        </div>
      )}

      {selected.length > 0 && (
        <div style={{ background: 'var(--blue-900)', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '0.625rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selected.length} selected</span>
          <div style={{ flex: 1 }} />
          <button className="btn btn-success btn-sm" onClick={() => handleBulkAction('successful')} disabled={busy}><CheckCircle size={14} /> Accept + Email</button>
          <button className="btn btn-sm" style={{ background: 'var(--amber-100)', color: 'var(--amber-800)' }} onClick={() => handleBulkAction('waiting_list')} disabled={busy}><Clock size={14} /> Waiting List + Email</button>
          <button className="btn btn-primary btn-sm" onClick={openSendJI} disabled={busy}><Send size={14} /> Send Joining Instructions</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.7)' }} onClick={() => setSelected([])}><X size={14} /> Clear</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="pill-tabs">
            {[['all', 'All'], ['pending', 'Pending'], ['successful', 'Successful'], ['waiting_list', 'Waiting List']].map(([v, l]) => (
              <button key={v} className={`pill-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><Users size={40} /><p>No registrations found.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Job Title</th>
                  <th>Email</th>
                  <th>Phone</th>
                  {selectedCourse === 'all' && <th>Course</th>}
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(reg => {
                  const c = courses.find(c => c.id === reg.courseId)
                  return (
                    <tr key={reg.id}>
                      <td><input type="checkbox" checked={selected.includes(reg.id)} onChange={() => toggleSelect(reg.id)} /></td>
                      <td style={{ fontWeight: 600 }}>{reg.firstName} {reg.lastName}</td>
                      <td>{reg.businessName}</td>
                      <td>{reg.jobTitle}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{reg.email}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{reg.phone}</td>
                      {selectedCourse === 'all' && <td style={{ fontSize: '0.8rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.name || '—'}</td>}
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{new Date(reg.createdAt).toLocaleDateString('en-GB')}</td>
                      <td><span className={`badge ${statusColor[reg.status] || 'badge-gray'}`}>{statusLabel[reg.status] || reg.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {reg.status !== 'successful' && (
                            <button className="btn btn-success btn-sm" onClick={async () => {
                              await updateRegistrationStatus(reg.id, 'successful')
                              if (c) await sendAcceptanceEmail(reg, c)
                              toast.success('Accepted + email sent')
                              load()
                            }}>✓ Accept</button>
                          )}
                          {reg.status !== 'waiting_list' && (
                            <button className="btn btn-sm" style={{ background: 'var(--amber-100)', color: 'var(--amber-800)' }} onClick={async () => {
                              await updateRegistrationStatus(reg.id, 'waiting_list')
                              if (c) await sendWaitingListEmail(reg, c)
                              toast.success('Waiting list + email sent')
                              load()
                            }}>⏳ Waitlist</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showJIModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Send Joining Instructions</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowJIModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', fontSize: '0.9rem' }}>Sending to <strong>{selected.length}</strong> candidate(s). Choose which set:</p>
              {jiSets.length === 0 ? (
                <div className="alert alert-warning">No joining instruction sets found. Add them under "Joining Instructions" first.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {jiSets.map(ji => (
                    <label key={ji.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem', border: `2px solid ${selectedJI === ji.id ? 'var(--blue-500)' : 'var(--gray-200)'}`, borderRadius: '0.5rem', cursor: 'pointer', background: selectedJI === ji.id ? 'var(--blue-50)' : 'white' }}>
                      <input type="radio" name="ji" value={ji.id} checked={selectedJI === ji.id} onChange={() => setSelectedJI(ji.id)} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--blue-900)' }}>Set {ji.setNumber} – {ji.title}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{ji.content.slice(0, 100)}…</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowJIModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendJI} disabled={!selectedJI || busy}>
                {busy ? <span className="spinner" /> : <><Send size={14} /> Send Instructions</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
