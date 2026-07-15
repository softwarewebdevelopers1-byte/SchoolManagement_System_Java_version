import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { MEAN_SCORE_TREND, SUBJECT_MEANS, GRADE_DISTRIBUTION, TOP_STUDENTS, TEACHER_PERFORMANCE } from '../data/analytics';

export async function getSchoolPerformance() {
  if (USE_MOCK_DATA) return mockResolve(MEAN_SCORE_TREND);
  return api.get(ENDPOINTS.ANALYTICS.SCHOOL_PERFORMANCE);
}

export async function getSubjectMeans() {
  if (USE_MOCK_DATA) return mockResolve(SUBJECT_MEANS);
  return api.get(ENDPOINTS.ANALYTICS.SUBJECT_MEANS);
}

export async function getGradeDistribution() {
  if (USE_MOCK_DATA) return mockResolve(GRADE_DISTRIBUTION);
  return api.get(ENDPOINTS.ANALYTICS.GRADE_DISTRIBUTION);
}

export async function getTopStudents() {
  if (USE_MOCK_DATA) return mockResolve(TOP_STUDENTS);
  return api.get(ENDPOINTS.ANALYTICS.TOP_STUDENTS);
}

export async function getTeacherPerformance() {
  if (USE_MOCK_DATA) return mockResolve(TEACHER_PERFORMANCE);
  return api.get(ENDPOINTS.ANALYTICS.TEACHER_PERFORMANCE);
}
