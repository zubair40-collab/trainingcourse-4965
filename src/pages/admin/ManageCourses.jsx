import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { getCourses, saveCourse, deleteCourse } from '../../lib/db'
import { Plus, Edit, Trash2, BookOpen, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const empty = { name: '', description: '', date: '', time: '', venue: '', duration: '', maxAttendees: 12, status: 'active' }

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const cs = await getCourses()
    setCourses(cs)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(empty); setEditingId(null); setShowModal(true) }
  const openEdit = (course) => { setForm(course); setEditingId(course.id); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = editingId ? { ...form, id: editingId } : form
    await saveCourse(data)
    await load()
    setSaving(false)
    setShowModal(false)
    toast.success(editingId ? 'Course updated' : 'Course created')
  }

  const handleDelete = async (id) => {
    await deleteCourse(id)
    setDeleteConfirm(null)
    await load()
    toast.success('Course deleted')
  }

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Manage Courses</h1><p>Create and edit your classroom courses</p></div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add New Course</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : courses.length === 0 ? (
        <div className="card"><div className="empty-state"><BookOpen size={48} /><p>No courses yet. Click "Add New Course" to get started.</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.map(course => (
            <div key={course.id} className="card">
              <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className={`badge ${course.status === 'active' ? 'badge-success' : 'badge-gray'}`}>{course.status}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, color: 'var(--blue-900)', fontSize: '1.0625rem', marginBottom: '0.375rem' }}>{course.name}</h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {course.description?.slice(0, 180)}{course.description?.length > 180 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    {course.date && <span>📅 {course.date}</span>}
                    {course.time && <span>🕐 {course.time}</span>}
                    {course.venue && <span>📍 {course.venue}</span>}
                    <span>👥 Max {course.maxAttendees}</span>
                    {course.duration && <span>⏱ {course.duration}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(course)}><Edit size={14} /> Edit</button>
                  {deleteConfirm === course.id ? (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}><Check size={14} /> Confirm</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}><X size={14} /></button>
                    </div>
                  ) : (
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(course.id)}><Trash2 size={14} /> Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Course' : 'New Course'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Changes in Employment Legislation UK – April 2026" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-input form-textarea" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Full course description…" />
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Start Time</label><input className="form-input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Venue</label><input className="form-input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Address or TBC" /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Duration</label><input className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. Full day (9:30 – 16:30)" /></div>
                  <div className="form-group"><label className="form-label">Max Attendees</label><input className="form-input" type="number" min={1} max={100} value={form.maxAttendees} onChange={e => setForm({ ...form, maxAttendees: parseInt(e.target.value) })} /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active – Open for Registration</option>
                    <option value="draft">Draft – Not yet visible</option>
                    <option value="closed">Closed – Registration Closed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : editingId ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
