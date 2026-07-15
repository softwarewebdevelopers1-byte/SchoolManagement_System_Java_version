import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { CLASSES } from '../data/classes';
import { classTeacherOf } from '../data/teachers';

export async function getClasses() {
  if (USE_MOCK_DATA) return mockResolve(CLASSES);
  return api.get(ENDPOINTS.CLASSES.LIST);
}

export async function getClassById(id) {
  if (USE_MOCK_DATA) return mockResolve(CLASSES.find((c) => c.id === id) || null);
  return api.get(ENDPOINTS.CLASSES.DETAIL(id));
}

export async function assignClassTeacher(classId, teacherId) {
  if (USE_MOCK_DATA) {
    const cls = CLASSES.find((c) => c.id === classId);
    if (cls) cls.classTeacherId = teacherId;
    return mockResolve({ classId, teacher: classTeacherOf(classId) }, 400);
  }
  return api.post(ENDPOINTS.CLASSES.ASSIGN_TEACHER(classId), { teacherId });
}
