import type { NavSection, Role } from '@/types'

export const roleLabels: Record<Role, string> = {
  admin: 'Administrator',
  headteacher: 'Headteacher',
  classteacher: 'Class Teacher',
  subjectteacher: 'Subject Teacher',
  student: 'Student',
  parent: 'Parent',
}

export const navByRole: Record<Role, NavSection[]> = {
  admin: [
    { items: [{ label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' }] },
    {
      label: 'People',
      items: [
        { label: 'Students', path: '/admin/students', icon: 'GraduationCap' },
        { label: 'Teachers', path: '/admin/teachers', icon: 'Users' },
        { label: 'Parents', path: '/admin/parents', icon: 'UserRound' },
        { label: 'Users & Roles', path: '/admin/users', icon: 'ShieldCheck' },
      ],
    },
    {
      label: 'Academics',
      items: [
        { label: 'Classes & Streams', path: '/admin/classes', icon: 'Building2' },
        { label: 'Subjects', path: '/admin/subjects', icon: 'BookOpen' },
        { label: 'Departments', path: '/admin/departments', icon: 'Boxes' },
        { label: 'Academic Years & Terms', path: '/admin/academic-years', icon: 'CalendarRange' },
        { label: 'Grading System', path: '/admin/grading', icon: 'Percent' },
        { label: 'Report Templates', path: '/admin/report-templates', icon: 'FileText' },
        { label: 'Assignments', path: '/admin/assignments', icon: 'ClipboardList' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Timetable Generator', path: '/admin/timetable', icon: 'CalendarClock' },
        { label: 'Performance Analytics', path: '/admin/analytics', icon: 'BarChart3' },
        { label: 'Reports', path: '/admin/reports', icon: 'FileBarChart' },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'History' },
      ],
    },
    { label: 'System', items: [{ label: 'Settings', path: '/admin/settings', icon: 'Settings' }] },
  ],
  headteacher: [
    { items: [{ label: 'Dashboard', path: '/headteacher', icon: 'LayoutDashboard' }] },
    {
      label: 'Oversight',
      items: [
        { label: 'Student Performance', path: '/headteacher/student-performance', icon: 'TrendingUp' },
        { label: 'Teacher Performance', path: '/headteacher/teacher-performance', icon: 'Users' },
        { label: 'Attendance Statistics', path: '/headteacher/attendance', icon: 'CalendarCheck' },
        { label: 'Subject Analysis', path: '/headteacher/subject-analysis', icon: 'BookOpen' },
        { label: 'Results Approval', path: '/headteacher/results-approval', icon: 'BadgeCheck', badge: 6 },
      ],
    },
    {
      label: 'School',
      items: [
        { label: 'Timetable', path: '/headteacher/timetable', icon: 'CalendarClock' },
        { label: 'Announcements', path: '/headteacher/announcements', icon: 'Megaphone' },
        { label: 'Reports', path: '/headteacher/reports', icon: 'FileBarChart' },
      ],
    },
  ],
  classteacher: [
    { items: [{ label: 'Dashboard', path: '/classteacher', icon: 'LayoutDashboard' }] },
    {
      label: 'My Class',
      items: [
        { label: 'My Classes', path: '/classteacher/classes', icon: 'Building2' },
        { label: 'My Students', path: '/classteacher/students', icon: 'GraduationCap' },
        { label: 'Attendance', path: '/classteacher/attendance', icon: 'CalendarCheck' },
        { label: 'Discipline Records', path: '/classteacher/discipline', icon: 'ShieldAlert' },
      ],
    },
    {
      label: 'Performance',
      items: [
        { label: 'Performance Analysis', path: '/classteacher/performance', icon: 'TrendingUp' },
        { label: 'Class Results', path: '/classteacher/results', icon: 'Trophy' },
        { label: 'Report Cards', path: '/classteacher/report-cards', icon: 'FileText' },
      ],
    },
    { label: 'Engagement', items: [{ label: 'Parent Communication', path: '/classteacher/communication', icon: 'MessagesSquare' }] },
  ],
  subjectteacher: [
    { items: [{ label: 'Dashboard', path: '/subjectteacher', icon: 'LayoutDashboard' }] },
    {
      label: 'Teaching',
      items: [
        { label: 'Assigned Subjects', path: '/subjectteacher/subjects', icon: 'BookOpen' },
        { label: 'Assigned Classes', path: '/subjectteacher/classes', icon: 'Building2' },
        { label: 'Marks Entry', path: '/subjectteacher/marks-entry', icon: 'Sheet' },
        { label: 'Assessments', path: '/subjectteacher/assessments', icon: 'ClipboardList' },
        { label: 'Student Scores', path: '/subjectteacher/scores', icon: 'BadgeCheck' },
      ],
    },
    {
      label: 'Insights',
      items: [
        { label: 'Subject Analysis', path: '/subjectteacher/analysis', icon: 'BarChart3' },
        { label: 'Performance Reports', path: '/subjectteacher/reports', icon: 'FileBarChart' },
        { label: 'Attendance', path: '/subjectteacher/attendance', icon: 'CalendarCheck' },
        { label: 'Timetable', path: '/subjectteacher/timetable', icon: 'CalendarClock' },
      ],
    },
  ],
  student: [
    { items: [{ label: 'Dashboard', path: '/student', icon: 'LayoutDashboard' }] },
    {
      label: 'My Academics',
      items: [
        { label: 'My Profile', path: '/student/profile', icon: 'UserRound' },
        { label: 'Performance', path: '/student/performance', icon: 'TrendingUp' },
        { label: 'Report Cards', path: '/student/report-cards', icon: 'FileText' },
        { label: 'Subjects', path: '/student/subjects', icon: 'BookOpen' },
        { label: 'Attendance', path: '/student/attendance', icon: 'CalendarCheck' },
        { label: 'Timetable', path: '/student/timetable', icon: 'CalendarClock' },
      ],
    },
    {
      label: 'More',
      items: [
        { label: 'Announcements', path: '/student/announcements', icon: 'Megaphone' },
        { label: 'Fee Status', path: '/student/fees', icon: 'Wallet' },
        { label: 'Assignments', path: '/student/assignments', icon: 'ClipboardList' },
        { label: 'Downloads', path: '/student/downloads', icon: 'Download' },
      ],
    },
  ],
  parent: [
    { items: [{ label: 'Dashboard', path: '/parent', icon: 'LayoutDashboard' }] },
    {
      label: 'My Children',
      items: [
        { label: 'Children Overview', path: '/parent/children', icon: 'Users' },
        { label: 'Performance', path: '/parent/performance', icon: 'TrendingUp' },
        { label: 'Attendance', path: '/parent/attendance', icon: 'CalendarCheck' },
        { label: 'Report Cards', path: '/parent/report-cards', icon: 'FileText' },
      ],
    },
    {
      label: 'More',
      items: [
        { label: 'Fee Status', path: '/parent/fees', icon: 'Wallet' },
        { label: 'Timetable', path: '/parent/timetable', icon: 'CalendarClock' },
        { label: 'Notifications', path: '/parent/notifications', icon: 'Bell' },
        { label: 'Teacher Communication', path: '/parent/communication', icon: 'MessagesSquare' },
      ],
    },
  ],
}

export const roleHome: Record<Role, string> = {
  admin: '/admin',
  headteacher: '/headteacher',
  classteacher: '/classteacher',
  subjectteacher: '/subjectteacher',
  student: '/student',
  parent: '/parent',
}
