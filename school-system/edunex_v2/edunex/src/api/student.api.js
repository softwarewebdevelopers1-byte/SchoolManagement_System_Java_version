import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { STUDENTS } from '../data/students';

export async function getStudents(params = {}) {
  if (USE_MOCK_DATA) {
    let rows = STUDENTS;
    if (params.classId) rows = rows.filter((s) => s.classId === params.classId);
    return mockResolve(rows);
  }
  return api.get(ENDPOINTS.STUDENTS.LIST, { params });
}

export async function getStudentById(id) {
  if (USE_MOCK_DATA) return mockResolve(STUDENTS.find((s) => s.id === id) || null);
  return api.get(ENDPOINTS.STUDENTS.DETAIL(id));
}

export async function getStudentsByClass(classId) {
  if (USE_MOCK_DATA) return mockResolve(STUDENTS.filter((s) => s.classId === classId));
  return api.get(ENDPOINTS.STUDENTS.BY_CLASS(classId));
}

export async function createStudent(payload) {
  if (USE_MOCK_DATA) return mockResolve({ id: `EDX${Date.now()}`, ...payload }, 500);
  return api.post(ENDPOINTS.STUDENTS.CREATE, payload);
}

export async function updateStudent(id, payload) {
  if (USE_MOCK_DATA) return mockResolve({ id, ...payload }, 500);
  return api.put(ENDPOINTS.STUDENTS.UPDATE(id), payload);
}

export async function deleteStudent(id) {
  if (USE_MOCK_DATA) return mockResolve({ success: true, id }, 400);
  return api.delete(ENDPOINTS.STUDENTS.DELETE(id));
}
