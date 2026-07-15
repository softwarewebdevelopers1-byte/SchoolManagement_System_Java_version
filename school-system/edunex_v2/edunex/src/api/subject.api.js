import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { SUBJECTS, CORE_SUBJECTS, ELECTIVE_SUBJECTS } from '../data/subjects';

export async function getSubjects() {
  if (USE_MOCK_DATA) return mockResolve(SUBJECTS);
  return api.get(ENDPOINTS.SUBJECTS.LIST);
}

export async function getCoreSubjects() {
  if (USE_MOCK_DATA) return mockResolve(CORE_SUBJECTS);
  return api.get(ENDPOINTS.SUBJECTS.LIST, { params: { type: 'core' } });
}

export async function getElectiveSubjects() {
  if (USE_MOCK_DATA) return mockResolve(ELECTIVE_SUBJECTS);
  return api.get(ENDPOINTS.SUBJECTS.LIST, { params: { type: 'elective' } });
}

export async function registerElective(studentId, subjectCode) {
  if (USE_MOCK_DATA) return mockResolve({ studentId, subjectCode, registered: true }, 400);
  return api.post(ENDPOINTS.SUBJECTS.REGISTER_ELECTIVE, { studentId, subjectCode });
}

export async function dropSubject(studentId, subjectCode) {
  if (USE_MOCK_DATA) return mockResolve({ studentId, subjectCode, dropped: true }, 400);
  return api.post(ENDPOINTS.SUBJECTS.DROP, { studentId, subjectCode });
}
