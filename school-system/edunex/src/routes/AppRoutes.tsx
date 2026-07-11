import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { roleHome } from '@/constants/navigation'
import { PageStub } from '@/components/shared/PageStub'

import Login from '@/pages/auth/Login'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import OtpVerification from '@/pages/auth/OtpVerification'
import ResetPassword from '@/pages/auth/ResetPassword'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminStudents from '@/pages/admin/AdminStudents'
import HeadteacherDashboard from '@/pages/headteacher/HeadteacherDashboard'
import ClassTeacherDashboard from '@/pages/classteacher/ClassTeacherDashboard'
import SubjectTeacherDashboard from '@/pages/subjectteacher/SubjectTeacherDashboard'
import StudentDashboard from '@/pages/student/StudentDashboard'
import ParentDashboard from '@/pages/parent/ParentDashboard'

const adminStubs = [
  'teachers', 'parents', 'users', 'classes', 'subjects', 'departments',
  'academic-years', 'grading', 'report-templates', 'assignments',
  'timetable', 'analytics', 'reports', 'audit-logs', 'settings',
]
const headteacherStubs = [
  'student-performance', 'teacher-performance', 'attendance', 'subject-analysis',
  'results-approval', 'timetable', 'announcements', 'reports',
]
const classteacherStubs = [
  'classes', 'students', 'attendance', 'discipline', 'performance',
  'results', 'report-cards', 'communication',
]
const subjectteacherStubs = [
  'subjects', 'classes', 'marks-entry', 'assessments', 'scores',
  'analysis', 'reports', 'attendance', 'timetable',
]
const studentStubs = [
  'profile', 'performance', 'report-cards', 'subjects', 'attendance',
  'timetable', 'announcements', 'fees', 'assignments', 'downloads',
]
const parentStubs = [
  'children', 'performance', 'attendance', 'report-cards',
  'fees', 'timetable', 'notifications', 'communication',
]

function toTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={roleHome[user.role]} replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        {adminStubs.map((s) => (
          <Route key={s} path={s} element={<PageStub title={toTitle(s)} />} />
        ))}
      </Route>

      <Route path="/headteacher" element={<DashboardLayout />}>
        <Route index element={<HeadteacherDashboard />} />
        {headteacherStubs.map((s) => (
          <Route key={s} path={s} element={<PageStub title={toTitle(s)} />} />
        ))}
      </Route>

      <Route path="/classteacher" element={<DashboardLayout />}>
        <Route index element={<ClassTeacherDashboard />} />
        {classteacherStubs.map((s) => (
          <Route key={s} path={s} element={<PageStub title={toTitle(s)} />} />
        ))}
      </Route>

      <Route path="/subjectteacher" element={<DashboardLayout />}>
        <Route index element={<SubjectTeacherDashboard />} />
        {subjectteacherStubs.map((s) => (
          <Route key={s} path={s} element={<PageStub title={toTitle(s)} />} />
        ))}
      </Route>

      <Route path="/student" element={<DashboardLayout />}>
        <Route index element={<StudentDashboard />} />
        {studentStubs.map((s) => (
          <Route key={s} path={s} element={<PageStub title={toTitle(s)} />} />
        ))}
      </Route>

      <Route path="/parent" element={<DashboardLayout />}>
        <Route index element={<ParentDashboard />} />
        {parentStubs.map((s) => (
          <Route key={s} path={s} element={<PageStub title={toTitle(s)} />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to={user ? roleHome[user.role] : '/login'} replace />} />
    </Routes>
  )
}
