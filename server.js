// Email API server — runs alongside Vite dev server
// In production: deploy this as a serverless function or standalone Node server

import { Resend } from 'resend'
import { createServer } from 'http'
import { readFileSync } from 'fs'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = new Resend(RESEND_API_KEY)
const PORT = 3738

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (req.method !== 'POST' || req.url !== '/api/send-email') {
    res.writeHead(404); res.end('Not found'); return
  }

  let body = ''
  req.on('data', chunk => body += chunk)
  req.on('end', async () => {
    try {
      const { to, subject, html } = JSON.parse(body)

      const result = await resend.emails.send({
        from: 'Consulting Direct UK <zubi@send.consultingdirect.ai>',
        to,
        subject,
        html
      })

      if (result.error) {
        console.error('Resend error:', result.error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: result.error.message }))
        return
      }

      console.log(`✅ Email sent → ${to} | ${subject} | id: ${result.data?.id}`)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, id: result.data?.id }))
    } catch (err) {
      console.error('Server error:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`📧 Email API server running on http://localhost:${PORT}`)
})
