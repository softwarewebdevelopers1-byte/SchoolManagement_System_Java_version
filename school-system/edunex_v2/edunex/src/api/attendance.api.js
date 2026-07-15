import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { attendanceTrend } from '../data/attendance';
import { STUDENTS } from '../data/students';

export async function getDailyAttendance(classId) {
  if (USE_MOCK_DATA) {
    const roster = STUDENTS.filter((s) => !classId || s.classId === classId);
    return mockResolve(roster.map((s) => ({ studentId: s.id, name: s.name, status: s.attendanceRate > 90 ? 'present' : 'absent' })));
  }
  return api.get(ENDPOINTS.ATTENDANCE.DAILY, { params: { classId } });
}

export async function markAttendance(records) {
  // records: [{ studentId, status }]
  if (USE_MOCK_DATA) return mockResolve({ saved: records.length }, 400);
  return api.post(ENDPOINTS.ATTENDANCE.MARK, { records });
}

export async function getAttendanceTrend(days = 14) {
  if (USE_MOCK_DATA) return mockResolve(attendanceTrend(days));
  return api.get(ENDPOINTS.ATTENDANCE.TREND, { params: { days } });
}

export async function getAttendanceForStudent(studentId) {
  if (USE_MOCK_DATA) {
    const student = STUDENTS.find((s) => s.id === studentId);
    return mockResolve({ studentId, rate: student?.attendanceRate ?? null, trend: attendanceTrend(20) });
  }
  return api.get(ENDPOINTS.ATTENDANCE.BY_STUDENT(studentId));
}
