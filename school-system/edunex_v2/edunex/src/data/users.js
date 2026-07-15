import { pick, int } from './utils';
import { TEACHERS } from './teachers';

export const SYSTEM_USERS = [
  ...TEACHERS.slice(0, 10).map((t) => ({ id: t.id, name: t.name, email: t.email, role: 'Subject Teacher', status: t.status, lastLogin: '2 hrs ago' })),
  { id: 'U1', name: 'Amina Wafula', email: 'admin@edunex.io', role: 'Administrator', status: 'Active', lastLogin: 'Just now' },
  { id: 'U2', name: 'Dr. Peter Kamau', email: 'head@edunex.io', role: 'Headteacher', status: 'Active', lastLogin: '30 min ago' },
];

export const ROLES_PERMISSIONS = [
  { role: 'Administrator', permissions: ['Full system access', 'Manage users', 'Manage academic structure', 'View all reports'] },
  { role: 'Headteacher', permissions: ['Approve results', 'View analytics', 'Publish announcements', 'View all reports'] },
  { role: 'Class Teacher', permissions: ['Manage own class', 'Enter attendance', 'View report cards'] },
  { role: 'Subject Teacher', permissions: ['Enter marks for assigned subjects', 'View own gradebook'] },
  { role: 'Student', permissions: ['View own results', 'View own timetable'] },
  { role: 'Parent', permissions: ['View children\'s results', 'Message teachers'] },
];

export const AUDIT_LOGS = Array.from({ length: 16 }).map((_, i) => ({
  id: i + 1,
  user: pick(['Amina Wafula', 'Dr. Peter Kamau', 'Grace Njoroge', 'Brian Otieno']),
  action: pick(['Updated marks for Form 2 East — Mathematics', 'Created new student record', 'Modified class timetable', 'Approved Term 2 results', 'Reset password for teacher account', 'Exported school analytics report']),
  time: `${int(1, 23)} ${pick(['minutes', 'hours'])} ago`,
  ip: `102.${int(0, 255)}.${int(0, 255)}.${int(0, 255)}`,
}));
