import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { getCourses, getRegistrations, getAttendance, getCertificates } from '../../lib/db'
import { BookOpen, Users, ClipboardCheck, Award, ArrowRight, Clock } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ courses: [], regs: [], attended: 0, certs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCourses(), getRegistrations(), getAttendance(), getCertificates()]).then(
      ([courses, regs, attendance, certs]) => {
        setStats({ courses, regs, attended: attendance.filter(a => a.attended).length, certs: certs.length })
        setLoading(false)
      }
    )
  }, [])

  const { courses, regs, attended, certs } = stats
  const pending = regs.filter(r => r.status === 'pending').length
  const successful = regs.filter(r => r.status === 'successful').length
  const waitingList = regs.filter(r => r.status === 'waiting_list').length

  if (loading) return <AdminLayout><div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back. Here's an overview of your courses and registrations.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Active Courses', value: courses.filter(c => c.status === 'active').length, sub: `${courses.length} total`, icon: BookOpen, color: 'var(--blue-600)' },
          { label: 'Total Registrations', value: regs.length, sub: `${pending} pending review`, icon: Users, color: 'var(--amber-500)' },
          { label: 'Successful Candidates', value: successful, sub: `${waitingList} on waiting list`, icon: ClipboardCheck, color: 'var(--green-500)' },
          { label: 'Certificates Issued', value: certs, sub: `${attended} attendances marked`, icon: Award, color: 'var(--blue-600)' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="stat-label">{label}</span>
              <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                <Icon size={18} />
              </div>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Quick Actions</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { label: 'Add New Course', path: '/admin/courses', desc: 'Create a course and start accepting registrations' },
              { label: 'Review Pending Registrations', path: '/admin/registrations', desc: `${pending} applications awaiting your review` },
              { label: 'Mark Attendance', path: '/admin/attendance', desc: "Record attendance for today's session" },
              { label: 'Issue Certificates', path: '/admin/certificates', desc: 'Send certificates to successful attendants' },
              { label: 'Send Announcements', path: '/admin/communications', desc: 'Notify contacts about new courses' },
            ].map(({ label, path, desc }) => (
              <button key={label} onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '0.5rem', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--blue-800)' }}>{label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '0.125rem' }}>{desc}</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Courses Overview</h3></div>
          <div className="card-body">
            {courses.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <BookOpen size={32} />
                <p>No courses yet. <button onClick={() => navigate('/admin/courses')} style={{ background: 'none', border: 'none', color: 'var(--blue-600)', fontWeight: 600, cursor: 'pointer' }}>Create your first →</button></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courses.slice(0, 5).map(course => {
                  const courseRegs = regs.filter(r => r.courseId === course.id)
                  const accepted = courseRegs.filter(r => r.status === 'successful').length
                  return (
                    <div key={course.id} onClick={() => navigate(`/admin/registrations?course=${course.id}`)} style={{ padding: '0.875rem', background: 'var(--gray-50)', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid var(--gray-200)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--blue-900)' }}>{course.name}</div>
                        <span className={`badge ${course.status === 'active' ? 'badge-success' : 'badge-gray'}`}>{course.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                        {course.date && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} />{course.date}</span>}
                        <span><strong>{accepted}</strong>/{course.maxAttendees} filled</span>
                        <span><strong>{courseRegs.length}</strong> registrations</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
