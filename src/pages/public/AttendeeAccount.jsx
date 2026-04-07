import { useState } from 'react'
import { PublicLayout } from '../../components/Layout'
import {
  getAttendeeAccount, createAttendeeAccount, updateAttendeeAccount,
  getCertificates, getCourses
} from '../../lib/db'
import { sendVerificationCode as sendVerificationEmail } from '../../lib/email'
import { Award, User, Phone, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function AttendeeAccount() {
  const [mode, setMode] = useState('login')
  const [account, setAccount] = useState(null)
  const [certs, setCerts] = useState([])
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', employer: '', mobile: '' })
  const [signupStep, setSignupStep] = useState(1)
  const [emailCode, setEmailCode] = useState('')
  const [mobileCode, setMobileCode] = useState('')
  const [pendingAccount, setPendingAccount] = useState(null)
  const [showPw, setShowPw] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const found = await getAttendeeAccount(loginForm.email)
    if (!found || found.password !== loginForm.password) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    const [c, cs] = await Promise.all([
      getCertificates().then(all => all.filter(c => c.attendeeEmail === found.email)),
      getCourses()
    ])
    setCerts(c); setCourses(cs)
    setAccount(found)
    setMode('dashboard')
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (signupForm.password !== signupForm.confirmPassword) { setError('Passwords do not match.'); return }
    if (signupForm.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const result = await createAttendeeAccount(signupForm)
    if (result?.error === 'email_taken') { setError('An account with this email already exists.'); setLoading(false); return }
    if (result?.error) { setError('Something went wrong. Please try again.'); setLoading(false); return }
    setPendingAccount(result)
    await sendVerificationEmail(result.email, result.verificationCode)
    setLoading(false)
    setSignupStep(2)
  }

  const handleEmailVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (emailCode !== pendingAccount.verificationCode) { setError('Incorrect code. Please try again.'); return }
    const updated = await updateAttendeeAccount(pendingAccount.id, { emailVerified: true })
    setPendingAccount(updated)
    setSignupStep(3)
  }

  const handleMobileVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (mobileCode !== pendingAccount.mobileCode) { setError('Incorrect code. Please try again.'); return }
    const updated = await updateAttendeeAccount(pendingAccount.id, { mobileVerified: true })
    const [c, cs] = await Promise.all([
      getCertificates().then(all => all.filter(c => c.attendeeEmail === updated.email)),
      getCourses()
    ])
    setCerts(c); setCourses(cs)
    setAccount(updated)
    setMode('dashboard')
  }

  return (
    <PublicLayout>
      <div style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '3rem 2rem', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Account</h1>
        <p style={{ opacity: 0.85 }}>Access your certificates and course history</p>
      </div>

      <div style={{ maxWidth: 600, margin: '2.5rem auto', padding: '0 1.5rem' }}>
        {mode === 'dashboard' && account && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-700)' }}>
                    <User size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontWeight: 700, color: 'var(--blue-900)' }}>{account.firstName} {account.lastName}</h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{account.employer}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                    <Mail size={15} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
                    {account.email}
                    {account.emailVerified && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✓ Verified</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                    <Phone size={15} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
                    {account.mobile}
                    {account.mobileVerified && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✓ Verified</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, color: 'var(--blue-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} style={{ color: 'var(--blue-600)' }} /> My Certificates
                </h3>
              </div>
              <div className="card-body">
                {certs.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}><Award size={40} /><p>No certificates yet.</p></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {certs.map(cert => {
                      const course = courses.find(c => c.id === cert.courseId)
                      return (
                        <div key={cert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--blue-50)', borderRadius: '0.5rem', border: '1px solid var(--blue-100)' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--blue-900)', fontSize: '0.9375rem' }}>{course?.name || 'Certificate'}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>Issued: {new Date(cert.issuedAt).toLocaleDateString('en-GB')}</div>
                          </div>
                          {cert.dataUrl && (
                            <a href={cert.dataUrl} download={`Certificate_${course?.name || 'Course'}.png`} className="btn btn-primary btn-sm">Download</a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => { setAccount(null); setMode('login') }}>Sign Out</button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="card">
            <div className="card-header"><h2 style={{ fontWeight: 700, color: 'var(--blue-900)' }}>Sign In to Your Account</h2></div>
            <div className="card-body">
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPw ? 'text' : 'password'} required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={{ paddingRight: '2.75rem' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Sign In'}
                </button>
              </form>
              <div className="divider" />
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                New attendee?{' '}
                <button onClick={() => { setMode('signup'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--blue-600)', fontWeight: 600, cursor: 'pointer' }}>Create an account</button>
              </p>
            </div>
          </div>
        )}

        {mode === 'signup' && signupStep === 1 && (
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontWeight: 700, color: 'var(--blue-900)' }}>Create Your Account</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>For successful course attendees only</p>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSignup}>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" required value={signupForm.firstName} onChange={e => setSignupForm({ ...signupForm, firstName: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" required value={signupForm.lastName} onChange={e => setSignupForm({ ...signupForm, lastName: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" required value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Employer Name *</label><input className="form-input" required value={signupForm.employer} onChange={e => setSignupForm({ ...signupForm, employer: e.target.value })} placeholder="Your Company Ltd" /></div>
                <div className="form-group"><label className="form-label">Mobile Number *</label><input className="form-input" type="tel" required value={signupForm.mobile} onChange={e => setSignupForm({ ...signupForm, mobile: e.target.value })} placeholder="07700 900000" /></div>
                <div className="form-group">
                  <label className="form-label">Password * (min 8 characters)</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPw ? 'text' : 'password'} required value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} style={{ paddingRight: '2.75rem' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Confirm Password *</label><input className="form-input" type="password" required value={signupForm.confirmPassword} onChange={e => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} /></div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Continue – Verify Email'}
                </button>
              </form>
              <div className="divider" />
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--blue-600)', fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
              </p>
            </div>
          </div>
        )}

        {mode === 'signup' && signupStep === 2 && (
          <div className="card">
            <div className="card-header"><h2 style={{ fontWeight: 700, color: 'var(--blue-900)' }}>Verify Your Email</h2></div>
            <div className="card-body">
              <div className="alert alert-info">A 6-digit code has been sent to <strong>{pendingAccount?.email}</strong><br /><em style={{ fontSize: '0.8125rem' }}>(Demo: code is {pendingAccount?.verificationCode})</em></div>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleEmailVerify}>
                <div className="form-group">
                  <label className="form-label">Enter Verification Code</label>
                  <input className="form-input" required maxLength={6} value={emailCode} onChange={e => setEmailCode(e.target.value)} placeholder="000000" style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', fontWeight: 700 }} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Verify Email</button>
              </form>
            </div>
          </div>
        )}

        {mode === 'signup' && signupStep === 3 && (
          <div className="card">
            <div className="card-header"><h2 style={{ fontWeight: 700, color: 'var(--blue-900)' }}>Verify Your Mobile Number</h2></div>
            <div className="card-body">
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={16} style={{ display: 'inline', marginRight: '0.375rem' }} />Email verified!</div>
              <div className="alert alert-info">A 6-digit code has been sent to <strong>{pendingAccount?.mobile}</strong><br /><em style={{ fontSize: '0.8125rem' }}>(Demo: code is {pendingAccount?.mobileCode})</em></div>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleMobileVerify}>
                <div className="form-group">
                  <label className="form-label">Enter Mobile Verification Code</label>
                  <input className="form-input" required maxLength={6} value={mobileCode} onChange={e => setMobileCode(e.target.value)} placeholder="000000" style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', fontWeight: 700 }} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Verify Mobile & Access Account</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
