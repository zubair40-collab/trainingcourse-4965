// ============================================================
// Database layer – Supabase
// All functions are async and return data directly
// ============================================================

import { supabase } from './supabase'

// ── COURSES ──────────────────────────────────────────────────

export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data.map(camelCourse)
}

export const getCourse = async (id) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return camelCourse(data)
}

export const saveCourse = async (course) => {
  const row = snakeCourse(course)
  if (course.id) {
    const { data, error } = await supabase
      .from('courses')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', course.id)
      .select()
      .single()
    if (error) { console.error(error); return null }
    return camelCourse(data)
  } else {
    const { data, error } = await supabase
      .from('courses')
      .insert(row)
      .select()
      .single()
    if (error) { console.error(error); return null }
    return camelCourse(data)
  }
}

export const deleteCourse = async (id) => {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) console.error(error)
}

// ── REGISTRATIONS ─────────────────────────────────────────────

export const getRegistrations = async (courseId) => {
  let query = supabase.from('registrations').select('*').order('created_at', { ascending: false })
  if (courseId) query = query.eq('course_id', courseId)
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data.map(camelReg)
}

export const saveRegistration = async (reg) => {
  // Check duplicate
  const { data: existing } = await supabase
    .from('registrations')
    .select('id')
    .eq('course_id', reg.courseId)
    .ilike('email', reg.email)
    .single()
  if (existing) return { error: 'already_registered' }

  const { data, error } = await supabase
    .from('registrations')
    .insert({
      course_id: reg.courseId,
      first_name: reg.firstName,
      last_name: reg.lastName,
      email: reg.email,
      business_name: reg.businessName,
      job_title: reg.jobTitle,
      phone: reg.phone,
      status: 'pending'
    })
    .select()
    .single()
  if (error) { console.error(error); return { error: 'insert_failed' } }
  return camelReg(data)
}

export const updateRegistrationStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('registrations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error(error); return null }
  return camelReg(data)
}

export const bulkUpdateStatus = async (ids, status) => {
  const { error } = await supabase
    .from('registrations')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids)
  if (error) console.error(error)
}

// ── JOINING INSTRUCTIONS ──────────────────────────────────────

export const getJoiningInstructions = async (courseId) => {
  let query = supabase.from('joining_instructions').select('*').order('set_number', { ascending: true })
  if (courseId) query = query.eq('course_id', courseId)
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data.map(camelJI)
}

export const saveJoiningInstruction = async (ji) => {
  if (ji.id) {
    const { data, error } = await supabase
      .from('joining_instructions')
      .update({ title: ji.title, content: ji.content, updated_at: new Date().toISOString() })
      .eq('id', ji.id)
      .select()
      .single()
    if (error) { console.error(error); return null }
    return camelJI(data)
  } else {
    // Get next set number
    const { data: existing } = await supabase
      .from('joining_instructions')
      .select('set_number')
      .eq('course_id', ji.courseId)
      .order('set_number', { ascending: false })
      .limit(1)
    const nextSet = existing?.length ? existing[0].set_number + 1 : 1

    const { data, error } = await supabase
      .from('joining_instructions')
      .insert({ course_id: ji.courseId, set_number: nextSet, title: ji.title, content: ji.content })
      .select()
      .single()
    if (error) { console.error(error); return null }
    return camelJI(data)
  }
}

export const deleteJoiningInstruction = async (id) => {
  const { error } = await supabase.from('joining_instructions').delete().eq('id', id)
  if (error) console.error(error)
}

// ── ATTENDANCE ────────────────────────────────────────────────

export const getAttendance = async (courseId) => {
  let query = supabase.from('attendance').select('*')
  if (courseId) query = query.eq('course_id', courseId)
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data.map(r => ({
    id: r.id,
    courseId: r.course_id,
    registrationId: r.registration_id,
    attended: r.attended,
    createdAt: r.created_at
  }))
}

export const markAttendance = async (courseId, registrationId, attended) => {
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('course_id', courseId)
    .eq('registration_id', registrationId)
    .single()

  if (existing) {
    await supabase.from('attendance')
      .update({ attended, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('attendance')
      .insert({ course_id: courseId, registration_id: registrationId, attended })
  }
}

// ── ATTENDEE ACCOUNTS ─────────────────────────────────────────

export const getAttendeeAccounts = async () => {
  const { data, error } = await supabase.from('attendee_accounts').select('*')
  if (error) { console.error(error); return [] }
  return data.map(camelAccount)
}

export const getAttendeeAccount = async (email) => {
  const { data, error } = await supabase
    .from('attendee_accounts')
    .select('*')
    .ilike('email', email)
    .single()
  if (error) return null
  return camelAccount(data)
}

export const createAttendeeAccount = async (account) => {
  const emailCode = Math.floor(100000 + Math.random() * 900000).toString()
  const mobileCode = Math.floor(100000 + Math.random() * 900000).toString()

  const { data, error } = await supabase
    .from('attendee_accounts')
    .insert({
      first_name: account.firstName,
      last_name: account.lastName,
      email: account.email,
      password: account.password,
      employer: account.employer,
      mobile: account.mobile,
      email_verified: false,
      mobile_verified: false,
      verification_code: emailCode,
      mobile_code: mobileCode
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'email_taken' }
    console.error(error); return { error: 'insert_failed' }
  }
  return camelAccount(data)
}

export const updateAttendeeAccount = async (id, updates) => {
  const row = {}
  if (updates.emailVerified !== undefined) row.email_verified = updates.emailVerified
  if (updates.mobileVerified !== undefined) row.mobile_verified = updates.mobileVerified
  if (updates.employer !== undefined) row.employer = updates.employer
  if (updates.mobile !== undefined) row.mobile = updates.mobile

  const { data, error } = await supabase
    .from('attendee_accounts')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error(error); return null }
  return camelAccount(data)
}

// ── CERTIFICATES ──────────────────────────────────────────────

export const getCertificates = async (courseId) => {
  let query = supabase.from('certificates').select('*').order('issued_at', { ascending: false })
  if (courseId) query = query.eq('course_id', courseId)
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data.map(r => ({
    id: r.id,
    courseId: r.course_id,
    attendeeEmail: r.attendee_email,
    attendeeName: r.attendee_name,
    dataUrl: r.data_url,
    issuedAt: r.issued_at
  }))
}

export const saveCertificate = async (cert) => {
  const { data: existing } = await supabase
    .from('certificates')
    .select('id')
    .eq('course_id', cert.courseId)
    .eq('attendee_email', cert.attendeeEmail)
    .single()

  if (existing) {
    await supabase.from('certificates')
      .update({ data_url: cert.dataUrl, attendee_name: cert.attendeeName, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('certificates').insert({
      course_id: cert.courseId,
      attendee_email: cert.attendeeEmail,
      attendee_name: cert.attendeeName,
      data_url: cert.dataUrl
    })
  }
}

export const getCertificateTemplates = async () => {
  const { data, error } = await supabase.from('cert_templates').select('*')
  if (error) return []
  return data
}

export const saveCertTemplate = async (courseId, fileName, dataUrl) => {
  const { data: existing } = await supabase
    .from('cert_templates')
    .select('id')
    .eq('course_id', courseId)
    .single()

  if (existing) {
    await supabase.from('cert_templates')
      .update({ file_name: fileName, data_url: dataUrl, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('cert_templates')
      .insert({ course_id: courseId, file_name: fileName, data_url: dataUrl })
  }
}

export const getCertTemplate = async (courseId) => {
  const { data, error } = await supabase
    .from('cert_templates')
    .select('*')
    .eq('course_id', courseId)
    .single()
  if (error) return null
  return { courseId: data.course_id, fileName: data.file_name, dataUrl: data.data_url }
}

// ── EMAIL LOG ─────────────────────────────────────────────────

export const logEmail = async (entry) => {
  await supabase.from('email_log').insert({
    to: entry.to,
    from: entry.from,
    subject: entry.subject,
    type: entry.type,
    preview: entry.preview
  })
}

export const getEmailLog = async () => {
  const { data, error } = await supabase
    .from('email_log')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(200)
  if (error) return []
  return data.map(r => ({
    id: r.id,
    to: r.to,
    from: r.from,
    subject: r.subject,
    type: r.type,
    preview: r.preview,
    sentAt: r.sent_at
  }))
}

// ── ADMIN AUTH (stays in sessionStorage — no DB needed) ───────

export const getAdminPassword = () => localStorage.getItem('admin_password') || 'admin123'
export const setAdminPassword = (pw) => localStorage.setItem('admin_password', pw)
export const adminLogin = (password) => {
  if (password === getAdminPassword()) {
    sessionStorage.setItem('admin_logged_in', 'true')
    return true
  }
  return false
}
export const isAdminLoggedIn = () => sessionStorage.getItem('admin_logged_in') === 'true'
export const adminLogout = () => sessionStorage.removeItem('admin_logged_in')

// ── SEED (no-op — handled by SQL migration) ───────────────────
export const seedDemoData = () => {} // tables seeded via supabase-migration.sql

// ── FIELD MAPPERS ─────────────────────────────────────────────

const camelCourse = (r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  date: r.date,
  time: r.time,
  venue: r.venue,
  duration: r.duration,
  maxAttendees: r.max_attendees,
  status: r.status,
  createdAt: r.created_at
})

const snakeCourse = (c) => ({
  name: c.name,
  description: c.description,
  date: c.date,
  time: c.time,
  venue: c.venue,
  duration: c.duration,
  max_attendees: c.maxAttendees,
  status: c.status
})

const camelReg = (r) => ({
  id: r.id,
  courseId: r.course_id,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  businessName: r.business_name,
  jobTitle: r.job_title,
  phone: r.phone,
  status: r.status,
  createdAt: r.created_at
})

const camelJI = (r) => ({
  id: r.id,
  courseId: r.course_id,
  setNumber: r.set_number,
  title: r.title,
  content: r.content,
  createdAt: r.created_at
})

const camelAccount = (r) => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  password: r.password,
  employer: r.employer,
  mobile: r.mobile,
  emailVerified: r.email_verified,
  mobileVerified: r.mobile_verified,
  verificationCode: r.verification_code,
  mobileCode: r.mobile_code,
  createdAt: r.created_at
})
