// Email layer — sends via Resend through the local API server
// All HTML templates live here

import { logEmail } from './db'

const FROM = 'Consulting Direct UK <zubi@consultingdirect.ai>'
const API_URL = '/api/send-email'

const sendEmail = async ({ to, subject, html, type }) => {
  // Always log to DB
  await logEmail({ to, subject, type, from: FROM, preview: html.slice(0, 200) })

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      console.error(`Email failed (${type}):`, data.error)
      return { success: false, error: data.error }
    }

    return { success: true, id: data.id }
  } catch (err) {
    console.error(`Email send error (${type}):`, err.message)
    return { success: false, error: err.message }
  }
}

// ── TEMPLATES ─────────────────────────────────────────────────────────────────

const baseWrap = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body { margin:0; padding:0; background:#f3f4f6; font-family: Arial, sans-serif; }
    .wrap { max-width:600px; margin:2rem auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .header { background:#0c2461; padding:1.5rem 2rem; }
    .header h1 { color:white; margin:0; font-size:1.125rem; }
    .header p { color:rgba(255,255,255,0.65); margin:0.25rem 0 0; font-size:0.85rem; }
    .body { padding:2rem; color:#374151; line-height:1.7; }
    .body h2 { color:#0c2461; margin-top:0; }
    .highlight { background:#eff6ff; border-left:4px solid #2563eb; padding:1rem; border-radius:4px; margin:1rem 0; }
    .highlight.green { background:#dcfce7; border-color:#22c55e; }
    .highlight.amber { background:#fef3c7; border-color:#f59e0b; }
    .code-box { background:#0c2461; color:white; font-size:2rem; font-weight:800; text-align:center; padding:1.5rem; border-radius:8px; letter-spacing:0.5rem; margin:1rem 0; }
    .footer { background:#f9fafb; border-top:1px solid #e5e7eb; padding:1.25rem 2rem; text-align:center; font-size:0.8rem; color:#9ca3af; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Consulting Direct UK Limited</h1>
      <p>Professional Business Courses</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">Consulting Direct UK Limited &nbsp;·&nbsp; zubi@consultingdirect.ai</div>
  </div>
</body>
</html>`

// ── EMAIL SENDERS ─────────────────────────────────────────────────────────────

export const sendRegistrationConfirmation = (registration, course) => sendEmail({
  to: registration.email,
  subject: `Registration Received – ${course.name}`,
  type: 'registration_confirmation',
  html: baseWrap(`
    <h2>Thank You for Your Interest!</h2>
    <p>Dear ${registration.firstName} ${registration.lastName},</p>
    <p>We have received your registration of interest for:</p>
    <div class="highlight">
      <strong>${course.name}</strong><br/>
      ${course.date ? `Date: ${course.date}` : ''} ${course.time ? `| Time: ${course.time}` : ''}
    </div>
    <p>We will review all registrations and notify you whether you have been <strong>accepted</strong> or placed on our <strong>waiting list</strong>.</p>
    <p>As we have limited classroom space (max ${course.maxAttendees} attendees), places are allocated at our discretion.</p>
    <p>Kind regards,<br/><strong>Consulting Direct UK Limited</strong></p>
  `)
})

export const sendAcceptanceEmail = (registration, course) => sendEmail({
  to: registration.email,
  subject: `Accepted – ${course.name}`,
  type: 'acceptance',
  html: baseWrap(`
    <h2 style="color:#166534">🎉 Congratulations — You Have Been Accepted!</h2>
    <p>Dear ${registration.firstName} ${registration.lastName},</p>
    <p>We are pleased to inform you that you have been <strong>accepted</strong> to attend:</p>
    <div class="highlight green">
      <strong>${course.name}</strong><br/>
      ${course.date ? `Date: ${course.date}` : ''} ${course.time ? `| Time: ${course.time}` : ''}<br/>
      ${course.venue ? `Venue: ${course.venue}` : ''}
    </div>
    <p>You are a <strong>Successful Candidate</strong>. Joining instructions will follow in a separate email.</p>
    <p>Kind regards,<br/><strong>Consulting Direct UK Limited</strong></p>
  `)
})

export const sendWaitingListEmail = (registration, course) => sendEmail({
  to: registration.email,
  subject: `Waiting List – ${course.name}`,
  type: 'waiting_list',
  html: baseWrap(`
    <h2 style="color:#92400e">Waiting List Notification</h2>
    <p>Dear ${registration.firstName} ${registration.lastName},</p>
    <p>Thank you for your interest in attending:</p>
    <div class="highlight amber">
      <strong>${course.name}</strong><br/>
      ${course.date ? `Date: ${course.date}` : ''} ${course.time ? `| Time: ${course.time}` : ''}
    </div>
    <p>Unfortunately our classroom is currently at full capacity. You have been placed on our <strong>Waiting List</strong>.</p>
    <p>Should a place become available, we will contact you immediately. We will also keep your details on file for future course announcements.</p>
    <p>Kind regards,<br/><strong>Consulting Direct UK Limited</strong></p>
  `)
})

export const sendJoiningInstructions = (registration, course, joiningSet) => sendEmail({
  to: registration.email,
  subject: `Joining Instructions – ${course.name}`,
  type: 'joining_instructions',
  html: baseWrap(`
    <h2>Joining Instructions</h2>
    <p>Dear ${registration.firstName} ${registration.lastName},</p>
    <p>Please find your joining instructions for <strong>${course.name}</strong>:</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:1.5rem;margin:1rem 0;border-radius:8px;white-space:pre-wrap;font-family:monospace;font-size:0.875rem;line-height:1.8">${joiningSet.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <p>Kind regards,<br/><strong>Consulting Direct UK Limited</strong></p>
  `)
})

export const sendCertificate = (account, course) => sendEmail({
  to: account.email,
  subject: `Certificate of Completion – ${course.name}`,
  type: 'certificate',
  html: baseWrap(`
    <h2>🎓 Certificate of Completion</h2>
    <p>Dear ${account.firstName} ${account.lastName},</p>
    <p>Congratulations on successfully completing:</p>
    <div class="highlight green">
      <strong>${course.name}</strong>
    </div>
    <p>Your certificate of completion is attached to this email and has also been saved to your account for future reference.</p>
    <p>You can access your account and download your certificate at any time by visiting the <strong>My Account</strong> section of our website.</p>
    <p>Kind regards,<br/><strong>Consulting Direct UK Limited</strong></p>
  `)
})

export const sendNewCourseAnnouncement = (recipient, course) => sendEmail({
  to: recipient.email,
  subject: `New Course – ${course.name}`,
  type: 'new_course_announcement',
  html: baseWrap(`
    <h2>New Course Announcement</h2>
    <p>Dear ${recipient.firstName} ${recipient.lastName},</p>
    <p>We have a new course available that may be of interest to you:</p>
    <div class="highlight">
      <strong>${course.name}</strong><br/>
      ${course.date ? `Date: ${course.date}` : ''} ${course.time ? `| Time: ${course.time}` : ''}<br/>
      <br/>${course.description?.slice(0, 250)}${course.description?.length > 250 ? '…' : ''}
    </div>
    <p>To register your interest, please visit our website.</p>
    <p>Kind regards,<br/><strong>Consulting Direct UK Limited</strong></p>
  `)
})

export const sendVerificationCode = (email, code) => sendEmail({
  to: email,
  subject: 'Email Verification Code – Consulting Direct UK',
  type: 'email_verification',
  html: baseWrap(`
    <h2>Verify Your Email Address</h2>
    <p>Your 6-digit verification code is:</p>
    <div class="code-box">${code}</div>
    <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
  `)
})
