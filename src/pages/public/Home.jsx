import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../../components/Layout'
import { getCourses } from '../../lib/db'
import { Calendar, MapPin, Users, CheckCircle, BookOpen, Award, Clock } from 'lucide-react'

export default function Home() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    getCourses().then(all => setCourses(all.filter(c => c.status === 'active').slice(0, 3)))
  }, [])

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="hero">
        <h1>Classroom Courses<br />Built for UK Businesses</h1>
        <p>Expert-led, in-person training sessions tailored for small and medium-sized businesses. Stay compliant, stay informed, and grow with confidence.</p>
        <div className="hero-badges">
          <span className="hero-badge">✓ UK Employment Law</span>
          <span className="hero-badge">✓ Max 12 Attendees</span>
          <span className="hero-badge">✓ Certificate of Completion</span>
          <span className="hero-badge">✓ SMB Focused</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/courses" className="btn btn-lg" style={{ background: 'white', color: 'var(--blue-800)', fontWeight: 700 }}>View Courses</Link>
          <Link to="/courses" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)' }}>Register Interest</Link>
        </div>
      </section>

      {/* Why us */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'var(--blue-900)', marginBottom: '2.5rem' }}>Why Choose Our Courses?</h2>
          <div className="grid-3">
            {[
              { icon: Users, title: 'Intimate Class Sizes', desc: 'Maximum 12 attendees per session ensures personal attention and meaningful discussion.' },
              { icon: CheckCircle, title: 'Expert-Led Training', desc: 'All sessions delivered by experienced consultants with real-world UK business expertise.' },
              { icon: Award, title: 'Certified Completion', desc: 'Every attendee receives a certificate to evidence their professional development.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-700)', marginBottom: '1rem' }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--blue-900)' }}>{title}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming courses */}
      {courses.length > 0 && (
        <section style={{ padding: '4rem 2rem', background: 'var(--gray-50)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-900)' }}>Upcoming Courses</h2>
              <Link to="/courses" style={{ color: 'var(--blue-600)', fontWeight: 600, fontSize: '0.9rem' }}>View all →</Link>
            </div>
            <div className="grid-3">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <BookOpen size={16} /><span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Classroom Course</span>
                    </div>
                    <h3>{course.name}</h3>
                  </div>
                  <div className="course-card-body">
                    <div className="course-meta">
                      {course.date && <div className="course-meta-item"><Calendar size={14} />{course.date}</div>}
                      {course.time && <div className="course-meta-item"><Clock size={14} />{course.time}</div>}
                      <div className="course-meta-item"><Users size={14} />Max {course.maxAttendees} attendees</div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{course.description}</p>
                    <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Register Interest</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-900)', marginBottom: '2.5rem' }}>How It Works</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { step: '1', title: 'Register Interest', desc: 'Submit your details for any course that interests you.' },
              { step: '2', title: 'Get Notified', desc: 'We review applications and notify you of your status.' },
              { step: '3', title: 'Attend & Learn', desc: 'Attend the classroom session and mark your attendance.' },
              { step: '4', title: 'Receive Certificate', desc: 'Get your certificate of completion sent to your inbox.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ flex: '1 1 160px', maxWidth: 200 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--blue-700)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem', margin: '0 auto 0.875rem' }}>{step}</div>
                <h4 style={{ fontWeight: 700, color: 'var(--blue-900)', marginBottom: '0.375rem' }}>{title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
