import type {
  Teacher,
  Subject,
  ClassRoom,
  Announcement,
  NotificationItem,
  AttendanceRecord,
} from '@/types'

export const teachers: Teacher[] = [
  { id: 'tch-01', staffNo: 'EDX-T-001', name: 'Mr. Peter Kariuki', department: 'Mathematics', subjects: ['Mathematics'], classes: ['Form 3 East', 'Form 4 West'], workload: 24, status: 'Active' },
  { id: 'tch-02', staffNo: 'EDX-T-002', name: 'Mrs. Alice Nduta', department: 'Languages', subjects: ['English', 'Literature'], classes: ['Form 1 North', 'Form 2 South'], workload: 22, status: 'Active' },
  { id: 'tch-03', staffNo: 'EDX-T-003', name: 'Mr. James Omondi', department: 'Sciences', subjects: ['Physics', 'Chemistry'], classes: ['Form 3 West', 'Form 4 East'], workload: 26, status: 'Active' },
  { id: 'tch-04', staffNo: 'EDX-T-004', name: 'Ms. Caroline Wambui', department: 'Humanities', subjects: ['Geography', 'History'], classes: ['Form 2 North'], workload: 18, status: 'On Leave' },
  { id: 'tch-05', staffNo: 'EDX-T-005', name: 'Mr. David Kiptoo', department: 'Sciences', subjects: ['Biology'], classes: ['Form 1 South', 'Form 3 North'], workload: 20, status: 'Active' },
  { id: 'tch-06', staffNo: 'EDX-T-006', name: 'Mrs. Susan Achieng', department: 'Business', subjects: ['Business Studies', 'Accounting'], classes: ['Form 4 South'], workload: 16, status: 'Active' },
  { id: 'tch-07', staffNo: 'EDX-T-007', name: 'Mr. Brian Mutiso', department: 'Technical', subjects: ['Computer Studies'], classes: ['Form 2 East', 'Form 3 South'], workload: 19, status: 'Active' },
  { id: 'tch-08', staffNo: 'EDX-T-008', name: 'Ms. Lucy Chebet', department: 'Languages', subjects: ['Kiswahili'], classes: ['Form 1 East'], workload: 15, status: 'Inactive' },
]

export const subjects: Subject[] = [
  { id: 'sub-01', name: 'Mathematics', code: 'MTH', type: 'Core', department: 'Mathematics', teachersAssigned: 4, studentsEnrolled: 48 },
  { id: 'sub-02', name: 'English', code: 'ENG', type: 'Core', department: 'Languages', teachersAssigned: 3, studentsEnrolled: 48 },
  { id: 'sub-03', name: 'Kiswahili', code: 'KIS', type: 'Core', department: 'Languages', teachersAssigned: 2, studentsEnrolled: 48 },
  { id: 'sub-04', name: 'Physics', code: 'PHY', type: 'Elective', department: 'Sciences', teachersAssigned: 2, studentsEnrolled: 31 },
  { id: 'sub-05', name: 'Chemistry', code: 'CHM', type: 'Elective', department: 'Sciences', teachersAssigned: 2, studentsEnrolled: 34 },
  { id: 'sub-06', name: 'Biology', code: 'BIO', type: 'Elective', department: 'Sciences', teachersAssigned: 2, studentsEnrolled: 29 },
  { id: 'sub-07', name: 'Geography', code: 'GEO', type: 'Elective', department: 'Humanities', teachersAssigned: 1, studentsEnrolled: 26 },
  { id: 'sub-08', name: 'History', code: 'HIS', type: 'Elective', department: 'Humanities', teachersAssigned: 1, studentsEnrolled: 22 },
  { id: 'sub-09', name: 'Business Studies', code: 'BST', type: 'Elective', department: 'Business', teachersAssigned: 1, studentsEnrolled: 27 },
  { id: 'sub-10', name: 'Computer Studies', code: 'COM', type: 'Elective', department: 'Technical', teachersAssigned: 1, studentsEnrolled: 19 },
]

export const classes: ClassRoom[] = [
  { id: 'cls-01', name: 'Form 1', streams: ['East', 'West', 'North', 'South'], classTeacher: 'Ms. Lucy Chebet', totalStudents: 156, meanScore: 62.4 },
  { id: 'cls-02', name: 'Form 2', streams: ['East', 'West', 'North', 'South'], classTeacher: 'Mrs. Alice Nduta', totalStudents: 148, meanScore: 64.1 },
  { id: 'cls-03', name: 'Form 3', streams: ['East', 'West', 'North', 'South'], classTeacher: 'Mr. Peter Kariuki', totalStudents: 142, meanScore: 58.7 },
  { id: 'cls-04', name: 'Form 4', streams: ['East', 'West', 'North', 'South'], classTeacher: 'Mrs. Susan Achieng', totalStudents: 139, meanScore: 66.9 },
]

export const announcements: Announcement[] = [
  { id: 'an-01', title: 'Term 2 Exams Timetable Released', body: 'The examination timetable for Term 2 has been published. Class teachers should share with students by Friday.', audience: 'All Staff & Students', date: '2026-07-08', priority: 'High' },
  { id: 'an-02', title: 'Parents Meeting — Form 4', body: 'A parents meeting for Form 4 candidates is scheduled to discuss KCSE preparations.', audience: 'Form 4 Parents', date: '2026-07-10', priority: 'High' },
  { id: 'an-03', title: 'Inter-House Sports Day', body: 'Annual inter-house sports competition will take place at the main field.', audience: 'All School', date: '2026-07-14', priority: 'Normal' },
  { id: 'an-04', title: 'Library Books Return Reminder', body: 'All borrowed library books should be returned before the end of term.', audience: 'All Students', date: '2026-07-05', priority: 'Low' },
]

export const notifications: NotificationItem[] = [
  { id: 'no-01', title: 'Results pending approval', message: '6 class results are awaiting your approval for Term 2.', time: '10 min ago', read: false, type: 'warning' },
  { id: 'no-02', title: 'New teacher registered', message: 'Mr. Brian Mutiso was added to the Technical department.', time: '2 hr ago', read: false, type: 'success' },
  { id: 'no-03', title: 'Timetable generated', message: 'Term 2 timetable was generated with zero conflicts.', time: '5 hr ago', read: true, type: 'info' },
  { id: 'no-04', title: 'Attendance below threshold', message: 'Form 3 West attendance dropped below 85% this week.', time: '1 day ago', read: true, type: 'danger' },
]

export const weeklyAttendance: AttendanceRecord[] = [
  { date: 'Mon', present: 542, absent: 18, late: 12, total: 572 },
  { date: 'Tue', present: 551, absent: 14, late: 7, total: 572 },
  { date: 'Wed', present: 534, absent: 26, late: 12, total: 572 },
  { date: 'Thu', present: 548, absent: 15, late: 9, total: 572 },
  { date: 'Fri', present: 519, absent: 33, late: 20, total: 572 },
]

export const gradeDistribution = [
  { grade: 'A', count: 42 },
  { grade: 'A-', count: 58 },
  { grade: 'B+', count: 76 },
  { grade: 'B', count: 94 },
  { grade: 'B-', count: 88 },
  { grade: 'C+', count: 71 },
  { grade: 'C', count: 54 },
  { grade: 'C-', count: 33 },
  { grade: 'D+', count: 19 },
  { grade: 'D', count: 8 },
]

export const termTrend = [
  { term: 'T1 2025', mean: 58.2 },
  { term: 'T2 2025', mean: 60.1 },
  { term: 'T3 2025', mean: 59.4 },
  { term: 'T1 2026', mean: 62.8 },
  { term: 'T2 2026', mean: 64.3 },
]

export const subjectComparison = [
  { subject: 'MTH', mean: 58.4 },
  { subject: 'ENG', mean: 64.2 },
  { subject: 'KIS', mean: 66.8 },
  { subject: 'PHY', mean: 54.1 },
  { subject: 'CHM', mean: 56.9 },
  { subject: 'BIO', mean: 61.3 },
  { subject: 'GEO', mean: 63.7 },
  { subject: 'COM', mean: 68.5 },
]
