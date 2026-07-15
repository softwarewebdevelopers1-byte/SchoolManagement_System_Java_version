import { rng, int } from './utils';
import { SUBJECTS } from './subjects';
import { STUDENTS } from './students';
import { TEACHERS } from './teachers';

export const MEAN_SCORE_TREND = ['2023', '2024', '2025', '2026'].map((year) => ({ year, mean: (52 + rng() * 10).toFixed(1) }));
export const SUBJECT_MEANS = SUBJECTS.slice(0, 8).map((s) => ({ subject: s.code, mean: +(45 + rng() * 35).toFixed(1) }));
export const GRADE_DISTRIBUTION = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E'].map((g) => ({ grade: g, count: int(8, 90) }));
export const TOP_STUDENTS = [...STUDENTS].sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, 10).map((s, i) => ({ ...s, position: i + 1, meanScore: (94 - i * 1.6).toFixed(1) }));
export const TEACHER_PERFORMANCE = TEACHERS.slice(0, 10).map((t) => ({ name: t.name.split(' ')[0] + ' ' + t.name.split(' ')[1][0] + '.', meanScore: +(58 + rng() * 30).toFixed(1) }));
