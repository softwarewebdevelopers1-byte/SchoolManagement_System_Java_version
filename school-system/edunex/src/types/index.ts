export type Role =
  | 'admin'
  | 'headteacher'
  | 'classteacher'
  | 'subjectteacher'
  | 'student'
  | 'parent'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
  title?: string
}

export interface NavItem {
  label: string
  path: string
  icon: string
  badge?: number
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

export interface Student {
  id: string
  admissionNo: string
  name: string
  avatarUrl?: string
  className: string
  stream: string
  gender: 'Male' | 'Female'
  guardian: string
  status: 'Active' | 'Transferred' | 'Graduated' | 'Suspended'
  meanScore: number
  attendance: number
}

export interface Teacher {
  id: string
  staffNo: string
  name: string
  avatarUrl?: string
  department: string
  subjects: string[]
  classes: string[]
  workload: number
  status: 'Active' | 'On Leave' | 'Inactive'
}

export interface Subject {
  id: string
  name: string
  code: string
  type: 'Core' | 'Elective'
  department: string
  teachersAssigned: number
  studentsEnrolled: number
}

export interface ClassRoom {
  id: string
  name: string
  streams: string[]
  classTeacher: string
  totalStudents: number
  meanScore: number
}

export interface MarkEntry {
  studentId: string
  studentName: string
  admissionNo: string
  cat1: number
  cat2: number
  assignment: number
  midterm: number
  endterm: number
  total: number
  grade: string
  rank: number
}

export interface AttendanceRecord {
  date: string
  present: number
  absent: number
  late: number
  total: number
}

export interface Announcement {
  id: string
  title: string
  body: string
  audience: string
  date: string
  priority: 'High' | 'Normal' | 'Low'
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'danger'
}
