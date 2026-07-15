// Single source of truth for every REST path the app talks to.
// Grouped by resource so each api/*.api.js file only imports its own slice.
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },
  STUDENTS: {
    LIST: '/students',
    DETAIL: (id) => `/students/${id}`,
    CREATE: '/students',
    UPDATE: (id) => `/students/${id}`,
    DELETE: (id) => `/students/${id}`,
    BY_CLASS: (classId) => `/students/class/${classId}`,
  },
  TEACHERS: {
    LIST: '/teachers',
    DETAIL: (id) => `/teachers/${id}`,
    CREATE: '/teachers',
    UPDATE: (id) => `/teachers/${id}`,
    DELETE: (id) => `/teachers/${id}`,
    WORKLOAD: (id) => `/teachers/${id}/workload`,
  },
  PARENTS: {
    LIST: '/parents',
    DETAIL: (id) => `/parents/${id}`,
    CREATE: '/parents',
    UPDATE: (id) => `/parents/${id}`,
    DELETE: (id) => `/parents/${id}`,
  },
  CLASSES: {
    LIST: '/classes',
    DETAIL: (id) => `/classes/${id}`,
    CREATE: '/classes',
    UPDATE: (id) => `/classes/${id}`,
    ASSIGN_TEACHER: (id) => `/classes/${id}/assign-teacher`,
  },
  SUBJECTS: {
    LIST: '/subjects',
    CREATE: '/subjects',
    UPDATE: (id) => `/subjects/${id}`,
    DELETE: (id) => `/subjects/${id}`,
    REGISTER_ELECTIVE: '/subjects/electives/register',
    DROP: '/subjects/drop',
  },
  MARKS: {
    LIST: '/marks',
    BY_CLASS_SUBJECT: (classId, subjectId) => `/marks/class/${classId}/subject/${subjectId}`,
    BULK_SAVE: '/marks/bulk',
    ASSESSMENTS: '/marks/assessments',
  },
  TIMETABLE: {
    BY_CLASS: (classId) => `/timetable/class/${classId}`,
    BY_TEACHER: (teacherId) => `/timetable/teacher/${teacherId}`,
    GENERATE: '/timetable/generate',
  },
  ATTENDANCE: {
    DAILY: '/attendance/daily',
    MARK: '/attendance/mark',
    TREND: '/attendance/trend',
    BY_STUDENT: (studentId) => `/attendance/student/${studentId}`,
  },
  ANALYTICS: {
    SCHOOL_PERFORMANCE: '/analytics/school-performance',
    SUBJECT_MEANS: '/analytics/subject-means',
    GRADE_DISTRIBUTION: '/analytics/grade-distribution',
    TOP_STUDENTS: '/analytics/top-students',
    TEACHER_PERFORMANCE: '/analytics/teacher-performance',
  },
  REPORTS: {
    LIST: (category) => `/reports/${category}`,
    EXPORT: (id) => `/reports/${id}/export`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    ANNOUNCEMENTS: '/announcements',
    EVENTS: '/events',
    MARK_READ: (id) => `/notifications/${id}/read`,
  },
  USERS: {
    LIST: '/users',
    ROLES: '/users/roles',
    AUDIT_LOGS: '/users/audit-logs',
  },
};
