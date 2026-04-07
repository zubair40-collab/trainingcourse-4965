import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getCourses, getRegistrations, getAttendance, markAttendance } from '../../lib/db'
import { ClipboardCheck, Check, X, Users, Tablet } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Attendance() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [successfulRegs, setSuccessfulRegs] = useState([])
  const [attendance, setAttendance] = useState([])
  const [tabletMode, setTabletMode] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async (courseId) => {
    const cs = await getCourses()
    setCourses(cs)
    const cid = courseId || selectedCourse || cs[0]?.id
    if (!selectedCourse && cs.length > 0) setSelectedCourse(cs[0].id)
    if (cid) {
      const regs = await getRegistrations(cid)
      setSuccessfulRegs(regs.filter(r => r.status === 'successful'))
      setAttendance(await getAttendance(cid))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (selectedCourse) {
      getRegistrations(selectedCourse).then(regs => setSuccessfulRegs(regs.filter(r => r.status === 'successful')))
      getAttendance(selectedCourse).then(setAttendance)
    }
  }, [selectedCourse])

  const isAttended = (regId) => attendance.find(a => a.registrationId === regId)?.attended === true

  const toggle = async (regId) => {
    const current = isAttended(regId)
    await markAttendance(selectedCourse, regId, !current)
    setAttendance(await getAttendance(selectedCourse))
    if (!current) toast.success('Attendance marked ✓')
  }

  const attendedCount = attendance.filter(a => a.attended && successfulRegs.some(r => r.id === a.registrationId)).length

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>Mark Attendance</h1><p>Record which successful candidates attended on the day</p></div>
        <button className={`btn ${tabletMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTabletMode(!tabletMode)}>
          <Tablet size={16} /> {tabletMode ? 'Exit Tablet Mode' : 'Tablet Mode'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="form-label" style={{ margin: 0 }}>Course:</label>
        <select className="form-input form-select" style={{ maxWidth: 450 }} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="stat-label">Successful Candidates</div><div className="stat-value">{successfulRegs.length}</div></div>
        <div className="stat-card"><div className="stat-label">Attended Today</div><div className="stat-value" style={{ color: 'var(--green-500)' }}>{attendedCount}</div></div>
        <div className="stat-card"><div className="stat-label">Not Yet Marked</div><div className="stat-value" style={{ color: 'var(--amber-500)' }}>{successfulRegs.length - attendedCount}</div></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : successfulRegs.length === 0 ? (
        <div className="card"><div className="empty-state"><Users size={48} /><p>No successful candidates yet. Accept registrations first.</p></div></div>
      ) : tabletMode ? (
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '2px solid var(--blue-200)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--blue-900)', fontSize: '1.5rem', fontWeight: 800 }}>Attendance Register</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {successfulRegs.map(reg => {
              const present = isAttended(reg.id)
              return (
                <button key={reg.id} onClick={() => toggle(reg.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: present ? 'var(--green-100)' : 'var(--gray-50)', borderLeft: `5px solid ${present ? 'var(--green-500)' : 'var(--gray-300)'}`, transition: 'all 0.2s' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', color: present ? 'var(--green-800)' : 'var(--gray-900)' }}>{reg.firstName} {reg.lastName}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{reg.businessName} · {reg.jobTitle}</div>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: present ? 'var(--green-500)' : 'var(--gray-300)', color: 'white' }}>
                    {present ? <Check size={24} /> : <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>○</span>}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', background: 'var(--blue-50)', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-900)' }}>{attendedCount} / {successfulRegs.length} attended</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Business</th><th>Job Title</th><th>Email</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {successfulRegs.map(reg => {
                  const present = isAttended(reg.id)
                  return (
                    <tr key={reg.id} style={{ background: present ? 'var(--green-100)' : undefined }}>
                      <td style={{ fontWeight: 600 }}>{reg.firstName} {reg.lastName}</td>
                      <td>{reg.businessName}</td>
                      <td>{reg.jobTitle}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{reg.email}</td>
                      <td><span className={`badge ${present ? 'badge-success' : 'badge-warning'}`}>{present ? '✓ Attended' : 'Not marked'}</span></td>
                      <td>
                        <button className={`btn btn-sm ${present ? 'btn-danger' : 'btn-success'}`} onClick={() => toggle(reg.id)}>
                          {present ? <><X size={13} /> Remove</> : <><Check size={13} /> Mark Present</>}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
