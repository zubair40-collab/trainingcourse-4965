import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PublicLayout } from '../../components/Layout'
import { getCourse, saveRegistration } from '../../lib/db'
import { sendRegistrationConfirmation } from '../../lib/email'
import { Calendar, Clock, MapPin, Users, CheckCircle, ArrowLeft, ChevronRight } from 'lucide-react'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', businessName: '', jobTitle: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCourse(id).then(c => { setCourse(c); setLoading(false) })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await saveRegistration({ ...form, courseId: id })
    if (result?.error === 'already_registered') {
      setError('You have already registered your interest for this course.')
      setSubmitting(false)
      return
    }
    await sendRegistrationConfirmation(form, course)
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return <PublicLayout><div style={{ textAlign: 'center', padding: '5rem' }}><span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div></PublicLayout>

  if (!course) return (
    <PublicLayout>
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Courses</Link>
      </div>
    </PublicLayout>
  )

  if (submitted) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: 600, margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--green-800)' }}>
            <CheckCircle size={36} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--blue-900)', marginBottom: '1rem' }}>Registration Received!</h1>
          <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            Thank you, <strong>{form.firstName}</strong>. Your interest in <strong>{course.name}</strong> has been registered.
          </p>
          <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '2rem' }}>
            We will review all registrations and email you at <strong>{form.email}</strong> to confirm whether you have been accepted or placed on the waiting list.
          </p>
          <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <strong>What happens next?</strong><br />
            Our team will review your registration. As we have limited classroom space (max {course.maxAttendees} attendees), places are allocated at our discretion. You will receive a confirmation email either way.
          </div>
          <Link to="/courses" className="btn btn-primary">Browse Other Courses</Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '3rem 2rem', color: 'white' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Link to="/courses" style={{ color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <ArrowLeft size={14} /> Back to Courses
          </Link>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: '0.875rem', display: 'inline-flex' }}>Classroom Course</span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, lineHeight: 1.3 }}>{course.name}</h1>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, color: 'var(--blue-900)', marginBottom: '1rem' }}>About This Course</h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>{course.description}</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontWeight: 700, color: 'var(--blue-900)', marginBottom: '1rem' }}>Course Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {course.date && <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Calendar size={18} style={{ color: 'var(--blue-600)', flexShrink: 0 }} /><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Date</div><div style={{ color: 'var(--gray-500)' }}>{course.date}</div></div></div>}
                  {course.time && <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Clock size={18} style={{ color: 'var(--blue-600)', flexShrink: 0 }} /><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Start Time</div><div style={{ color: 'var(--gray-500)' }}>{course.time}</div></div></div>}
                  {course.duration && <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Clock size={18} style={{ color: 'var(--blue-600)', flexShrink: 0 }} /><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Duration</div><div style={{ color: 'var(--gray-500)' }}>{course.duration}</div></div></div>}
                  {course.venue && <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><MapPin size={18} style={{ color: 'var(--blue-600)', flexShrink: 0 }} /><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Venue</div><div style={{ color: 'var(--gray-500)' }}>{course.venue}</div></div></div>}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Users size={18} style={{ color: 'var(--blue-600)', flexShrink: 0 }} /><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Class Size</div><div style={{ color: 'var(--gray-500)' }}>Maximum {course.maxAttendees} attendees</div></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-header">
              <h3 style={{ fontWeight: 700, color: 'var(--blue-900)' }}>Register Your Interest</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Fill in your details below. We'll contact you with your outcome.</p>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Smith" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@yourcompany.co.uk" />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input className="form-input" required value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="Your Company Ltd" />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" required value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} placeholder="HR Manager" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="07700 900000" />
                </div>
                <div style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: '0.5rem', padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--blue-800)' }}>
                  <strong>Note:</strong> Submitting this form registers your interest only. Acceptance is not guaranteed.
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : <>Submit Registration <ChevronRight size={18} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
