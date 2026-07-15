import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { timetableFor, DAYS, PERIODS } from '../data/timetable';

export async function getTimetableForClass(classId) {
  if (USE_MOCK_DATA) return mockResolve(timetableFor(classId));
  return api.get(ENDPOINTS.TIMETABLE.BY_CLASS(classId));
}

export async function getTimetableForTeacher(teacherId) {
  if (USE_MOCK_DATA) return mockResolve(timetableFor('F1-North'));
  return api.get(ENDPOINTS.TIMETABLE.BY_TEACHER(teacherId));
}

export async function getTimetableMeta() {
  if (USE_MOCK_DATA) return mockResolve({ days: DAYS, periods: PERIODS });
  return mockResolve({ days: DAYS, periods: PERIODS });
}

export async function generateTimetable(constraints) {
  if (USE_MOCK_DATA) return mockResolve({ status: 'generated', conflicts: 0, constraints }, 900);
  return api.post(ENDPOINTS.TIMETABLE.GENERATE, constraints);
}
