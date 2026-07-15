import { int } from './utils';
import { STUDENTS } from './students';

export const ASSESSMENT_TYPES = ['CAT 1', 'CAT 2', 'Assignment', 'Practical', 'Midterm', 'End Term'];

export function gradeFor(score) {
  if (score >= 80) return { grade: 'A', points: 12 };
  if (score >= 75) return { grade: 'A-', points: 11 };
  if (score >= 70) return { grade: 'B+', points: 10 };
  if (score >= 65) return { grade: 'B', points: 9 };
  if (score >= 60) return { grade: 'B-', points: 8 };
  if (score >= 55) return { grade: 'C+', points: 7 };
  if (score >= 50) return { grade: 'C', points: 6 };
  if (score >= 45) return { grade: 'C-', points: 5 };
  if (score >= 40) return { grade: 'D+', points: 4 };
  if (score >= 35) return { grade: 'D', points: 3 };
  if (score >= 30) return { grade: 'D-', points: 2 };
  return { grade: 'E', points: 1 };
}

export function marksFor(classId, subjectId, assessment = 'End Term') {
  return STUDENTS.filter((s) => s.classId === classId).map((s) => {
    const score = int(28, 96);
    return { studentId: s.id, name: s.name, score, ...gradeFor(score), assessment };
  }).sort((a, b) => b.score - a.score).map((m, i) => ({ ...m, rank: i + 1 }));
}
