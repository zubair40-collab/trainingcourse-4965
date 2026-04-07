import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { seedDemoData } from './lib/db'

// Public pages
import Home from './pages/public/Home'
import Courses from './pages/public/Courses'
import CourseDetail from './pages/public/CourseDetail'
import AttendeeAccount from './pages/public/AttendeeAccount'

// Admin pages
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ManageCourses from './pages/admin/ManageCourses'
import Registrations from './pages/admin/Registrations'
import JoiningInstructions from './pages/admin/JoiningInstructions'
import Attendance from './pages/admin/Attendance'
import Certificates from './pages/admin/Certificates'
import Communications from './pages/admin/Communications'
import EmailLog from './pages/admin/EmailLog'
import Settings from './pages/admin/Settings'

export default function App() {
  useEffect(() => {
    seedDemoData()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/account" element={<AttendeeAccount />} />

        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/courses" element={<ManageCourses />} />
        <Route path="/admin/courses/new" element={<ManageCourses />} />
        <Route path="/admin/registrations" element={<Registrations />} />
        <Route path="/admin/joining-instructions" element={<JoiningInstructions />} />
        <Route path="/admin/attendance" element={<Attendance />} />
        <Route path="/admin/certificates" element={<Certificates />} />
        <Route path="/admin/communications" element={<Communications />} />
        <Route path="/admin/email-log" element={<EmailLog />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
