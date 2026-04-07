import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getCourses, getJoiningInstructions, saveJoiningInstruction, deleteJoiningInstruction } from '../../lib/db'
import { Plus, Edit, Trash2, FileText, X, Check, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const empty = { courseId: '', title: '', content: '' }

export default function JoiningInstructions() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [instructions, setInstructions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async (courseId) => {
    const cs = await getCourses()
    setCourses(cs)
    const cid = courseId || selectedCourse || cs[0]?.id
    if (!selectedCourse && cs.length > 0) setSelectedCourse(cs[0].id)
    if (cid) {
      setInstructions(await getJoiningInstructions(cid))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (selectedCourse) getJoiningInstructions(selectedCourse).then(setInstructions) }, [selectedCourse])

  const openNew = () => { setForm({ ...empty, courseId: selectedCourse }); setEditingId(null); setShowModal(true) }
  const openEdit = (ji) => { setForm(ji); setEditingId(ji.id); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = editingId ? { ...form, id: editingId } : form
    await saveJoiningInstruction(data)
    setInstructions(await getJoiningInstructions(selectedCourse))
    setSaving(false)
    setShowModal(false)
    toast.success(editingId ? 'Updated' : 'New set added')
  }

  const handleDelete = async (id) => {
    await deleteJoiningInstruction(id)
    setDeleteConfirm(null)
    setInstructions(await getJoiningInstructions(selectedCourse))
    toast.success('Deleted')
  }

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>Joining Instructions</h1><p>Manage multiple sets of joining instructions per course</p></div>
        <button className="btn btn-primary" onClick={openNew} disabled={!selectedCourse}><Plus size={16} /> Add New Set</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Course:</label>
        <select className="form-input form-select" style={{ maxWidth: 400 }} value={selectedCourse}
          onChange={e => { setSelectedCourse(e.target.value); setPreviewId(null) }}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <strong>How this works:</strong> Create multiple sets (Set 1, Set 2…). When sending to successful candidates from the Registrations page, you choose which set to send.
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : instructions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={48} />
            <p>No joining instruction sets for this course yet.</p>
            <button className="btn btn-primary" onClick={openNew} style={{ marginTop: '1rem' }}><Plus size={16} /> Add First Set</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {instructions.map(ji => (
            <div key={ji.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-info">Set {ji.setNumber}</span>
                      <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--blue-900)', display: 'inline' }}>{ji.title}</h3>
                    </div>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.6 }}>{ji.content.slice(0, 200)}{ji.content.length > 200 ? '…' : ''}</p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Created: {new Date(ji.createdAt).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPreviewId(ji.id === previewId ? null : ji.id)}><Eye size={14} /> Preview</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ji)}><Edit size={14} /> Edit</button>
                    {deleteConfirm === ji.id ? (
                      <><button className="btn btn-danger btn-sm" onClick={() => handleDelete(ji.id)}><Check size={14} /></button><button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}><X size={14} /></button></>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(ji.id)}><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
                {previewId === ji.id && (
                  <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--gray-50)', borderRadius: '0.5rem', border: '1px solid var(--gray-200)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    {ji.content}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Joining Instructions' : 'New Set'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Set 1 – Standard Instructions" />
                </div>
                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea className="form-input form-textarea" required style={{ minHeight: 300 }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Enter the full joining instructions text…" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : editingId ? 'Save Changes' : 'Add Set'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
