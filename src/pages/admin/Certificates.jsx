import { useState, useEffect, useRef } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getCourses, getRegistrations, getAttendance, saveCertificate, getCertificates, getCertTemplate, saveCertTemplate } from '../../lib/db'
import { sendCertificate } from '../../lib/email'
import { Award, Upload, Image, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Certificates() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [attendants, setAttendants] = useState([])
  const [certs, setCerts] = useState([])
  const [template, setTemplate] = useState(null)
  const [selected, setSelected] = useState([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef()

  const load = async (cid) => {
    const cs = await getCourses()
    setCourses(cs)
    const courseId = cid || selectedCourse || cs[0]?.id
    if (!selectedCourse && cs.length > 0) setSelectedCourse(cs[0].id)
    if (courseId) {
      const [attendance, regs, certsData, tmpl] = await Promise.all([
        getAttendance(courseId),
        getRegistrations(courseId),
        getCertificates(courseId),
        getCertTemplate(courseId)
      ])
      const attendedIds = attendance.filter(a => a.attended).map(a => a.registrationId)
      setAttendants(regs.filter(r => attendedIds.includes(r.id)))
      setCerts(certsData)
      setTemplate(tmpl)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (selectedCourse) load(selectedCourse) }, [selectedCourse])

  const hasCert = (reg) => certs.some(c => c.attendeeEmail === reg.email)

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      await saveCertTemplate(selectedCourse, file.name, ev.target.result)
      setTemplate(await getCertTemplate(selectedCourse))
      toast.success('Template uploaded!')
    }
    reader.readAsDataURL(file)
  }

  const generateCertificate = async (reg) => {
    if (template?.dataUrl) return template.dataUrl
    const canvas = document.createElement('canvas')
    canvas.width = 1200; canvas.height = 840
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1200, 840)
    ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 8; ctx.strokeRect(20, 20, 1160, 800)
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.strokeRect(32, 32, 1136, 776)
    ctx.fillStyle = '#0c2461'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center'
    ctx.fillText('CONSULTING DIRECT UK LIMITED', 600, 100)
    ctx.fillStyle = '#2563eb'; ctx.font = 'bold 42px Arial'
    ctx.fillText('Certificate of Completion', 600, 175)
    ctx.fillStyle = '#374151'; ctx.font = '22px Arial'
    ctx.fillText('This is to certify that', 600, 260)
    ctx.fillStyle = '#0c2461'; ctx.font = 'bold 52px Arial'
    ctx.fillText(`${reg.firstName} ${reg.lastName}`, 600, 340)
    ctx.fillStyle = '#374151'; ctx.font = '22px Arial'
    ctx.fillText('has successfully completed the course', 600, 400)
    ctx.fillStyle = '#1e3a8a'; ctx.font = 'bold 26px Arial'
    const course = courses.find(c => c.id === selectedCourse)
    const words = (course?.name || '').split(' ')
    let line = '', y = 460
    for (const word of words) {
      const test = line + word + ' '
      if (ctx.measureText(test).width > 900 && line !== '') { ctx.fillText(line.trim(), 600, y); line = word + ' '; y += 36 }
      else line = test
    }
    if (line) ctx.fillText(line.trim(), 600, y)
    ctx.fillStyle = '#6b7280'; ctx.font = '18px Arial'
    ctx.fillText(`Issued on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 600, y + 60)
    ctx.fillStyle = '#374151'; ctx.font = '16px Arial'
    ctx.fillText('Consulting Direct UK Limited  |  zubi@consultingdirect.ai', 600, 780)
    return canvas.toDataURL('image/png')
  }

  const sendCerts = async () => {
    if (selected.length === 0) { toast.error('Select at least one attendant'); return }
    setSending(true)
    const course = courses.find(c => c.id === selectedCourse)
    for (const regId of selected) {
      const reg = attendants.find(r => r.id === regId)
      if (!reg) continue
      const certData = await generateCertificate(reg)
      await saveCertificate({ courseId: selectedCourse, attendeeEmail: reg.email, attendeeName: `${reg.firstName} ${reg.lastName}`, dataUrl: certData })
      if (course) await sendCertificate(reg, course, certData)
    }
    setCerts(await getCertificates(selectedCourse))
    setSelected([])
    setSending(false)
    toast.success(`Certificates issued to ${selected.length} attendant(s)!`)
  }

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  return (
    <AdminLayout>
      <div className="page-header"><h1>Certificates</h1><p>Upload templates and issue certificates to successful attendants</p></div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <label className="form-label" style={{ margin: 0 }}>Course:</label>
        <select className="form-input form-select" style={{ maxWidth: 450 }} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontWeight: 700 }}>Certificate Template</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Upload a blank certificate (PNG/JPG). If none uploaded, a default styled certificate is generated.</p>
            </div>
            <div className="card-body">
              {template ? (
                <div>
                  <div style={{ background: 'var(--green-100)', border: '1px solid var(--green-500)', borderRadius: '0.5rem', padding: '0.875rem', marginBottom: '1rem', display: 'flex', gap: '0.625rem', alignItems: 'center', color: 'var(--green-800)' }}>
                    <Check size={16} /><div><div style={{ fontWeight: 600 }}>Template uploaded</div><div style={{ fontSize: '0.8125rem' }}>{template.fileName}</div></div>
                  </div>
                  <img src={template.dataUrl} alt="Template" style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }} />
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={() => fileRef.current?.click()}>
                    <Upload size={16} /> Replace Template
                  </button>
                </div>
              ) : (
                <div>
                  <div className="upload-area" onClick={() => fileRef.current?.click()}>
                    <Image size={40} style={{ color: 'var(--blue-400)', margin: '0 auto 0.875rem' }} />
                    <p style={{ fontWeight: 600, color: 'var(--blue-700)' }}>Click to upload template</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '0.375rem' }}>PNG or JPG · Blank certificate with space for name</p>
                  </div>
                  <div className="alert alert-info" style={{ marginTop: '1rem', fontSize: '0.8125rem' }}>
                    No template yet. A default styled certificate will be auto-generated.
                  </div>
                </div>
              )}
              <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handleTemplateUpload} />
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700 }}>Successful Attendants</h3>
              {selected.length > 0 && (
                <button className="btn btn-primary btn-sm" onClick={sendCerts} disabled={sending}>
                  {sending ? <span className="spinner" /> : <><Award size={14} /> Issue {selected.length} Certificate(s)</>}
                </button>
              )}
            </div>
            <div style={{ padding: 0 }}>
              {attendants.length === 0 ? (
                <div className="empty-state"><Award size={40} /><p>No attendants marked yet. Mark attendance first.</p></div>
              ) : (
                <div>
                  <div style={{ padding: '0.875rem 1.25rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={selected.length === attendants.length && attendants.length > 0} onChange={() => setSelected(selected.length === attendants.length ? [] : attendants.map(r => r.id))} />
                    <span style={{ color: 'var(--gray-500)' }}>Select all ({attendants.length})</span>
                  </div>
                  {attendants.map(reg => {
                    const issued = hasCert(reg)
                    return (
                      <div key={reg.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '0.875rem', background: issued ? 'var(--green-100)' : undefined }}>
                        <input type="checkbox" checked={selected.includes(reg.id)} onChange={() => toggleSelect(reg.id)} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{reg.firstName} {reg.lastName}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{reg.email} · {reg.businessName}</div>
                        </div>
                        <span className={`badge ${issued ? 'badge-success' : 'badge-gray'}`}>{issued ? '✓ Issued' : 'Pending'}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
