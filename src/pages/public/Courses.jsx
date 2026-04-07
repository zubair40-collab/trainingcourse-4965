import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../../components/Layout'
import { getCourses } from '../../lib/db'
import { Calendar, Clock, MapPin, Users, BookOpen, ChevronRight } from 'lucide-react'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourses().then(all => {
      setCourses(all.filter(c => c.status === 'active'))
      setLoading(false)
    })
  }, [])

  return (
    <PublicLayout>
      <div style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '3rem 2rem', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Available Courses</h1>
        <p style={{ opacity: 0.85, maxWidth: 520, margin: '0 auto' }}>Browse our upcoming classroom-based courses designed specifically for UK small and medium businesses.</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
        ) : courses.length === 0 ? (
          <div className="empty-state"><BookOpen size={48} /><p>No courses available at the moment. Please check back soon.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {courses.map(course => (
              <div key={course.id} className="card" style={{ display: 'flex', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(180deg, var(--blue-800), var(--blue-600))', width: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className="badge badge-info">Classroom Course</span>
                        <span className="badge badge-success">Open for Registration</span>
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--blue-900)', marginBottom: '0.75rem' }}>{course.name}</h2>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{course.description}</p>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {course.date && <div className="course-meta-item"><Calendar size={14} style={{ color: 'var(--blue-600)' }} /><span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{course.date}</span></div>}
                        {course.time && <div className="course-meta-item"><Clock size={14} style={{ color: 'var(--blue-600)' }} /><span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{course.time}</span></div>}
                        {course.venue && <div className="course-meta-item"><MapPin size={14} style={{ color: 'var(--blue-600)' }} /><span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{course.venue}</span></div>}
                        <div className="course-meta-item"><Users size={14} style={{ color: 'var(--blue-600)' }} /><span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Max {course.maxAttendees} attendees</span></div>
                      </div>
                    </div>
                    <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ flexShrink: 0 }}>Register Interest <ChevronRight size={16} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
