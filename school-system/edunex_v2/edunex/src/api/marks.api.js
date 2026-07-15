import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { marksFor, ASSESSMENT_TYPES, gradeFor } from '../data/marks';

export async function getMarks(classId, subjectId, assessment) {
  if (USE_MOCK_DATA) return mockResolve(marksFor(classId, subjectId, assessment));
  return api.get(ENDPOINTS.MARKS.BY_CLASS_SUBJECT(classId, subjectId), { params: { assessment } });
}

export async function getAssessmentTypes() {
  if (USE_MOCK_DATA) return mockResolve(ASSESSMENT_TYPES);
  return api.get(ENDPOINTS.MARKS.ASSESSMENTS);
}

export async function saveMarksBulk(entries) {
  // entries: [{ studentId, score, subjectId, assessment }]
  if (USE_MOCK_DATA) {
    const graded = entries.map((e) => ({ ...e, ...gradeFor(e.score) }));
    return mockResolve({ saved: graded.length, entries: graded }, 500);
  }
  return api.post(ENDPOINTS.MARKS.BULK_SAVE, { entries });
}
