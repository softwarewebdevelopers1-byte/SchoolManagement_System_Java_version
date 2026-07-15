import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { TEACHERS } from '../data/teachers';

export async function getTeachers(params = {}) {
  if (USE_MOCK_DATA) {
    let rows = TEACHERS;
    if (params.department) rows = rows.filter((t) => t.department === params.department);
    return mockResolve(rows);
  }
  return api.get(ENDPOINTS.TEACHERS.LIST, { params });
}

export async function getTeacherById(id) {
  if (USE_MOCK_DATA) return mockResolve(TEACHERS.find((t) => t.id === id) || null);
  return api.get(ENDPOINTS.TEACHERS.DETAIL(id));
}

export async function createTeacher(payload) {
  if (USE_MOCK_DATA) return mockResolve({ id: `T${Date.now()}`, ...payload }, 500);
  return api.post(ENDPOINTS.TEACHERS.CREATE, payload);
}

export async function updateTeacher(id, payload) {
  if (USE_MOCK_DATA) return mockResolve({ id, ...payload }, 500);
  return api.put(ENDPOINTS.TEACHERS.UPDATE(id), payload);
}

export async function deleteTeacher(id) {
  if (USE_MOCK_DATA) return mockResolve({ success: true, id }, 400);
  return api.delete(ENDPOINTS.TEACHERS.DELETE(id));
}
