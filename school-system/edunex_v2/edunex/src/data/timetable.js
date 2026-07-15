import { pick, int } from './utils';
import { SUBJECTS } from './subjects';
import { TEACHERS } from './teachers';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const PERIODS = ['8:00-8:40', '8:40-9:20', '9:20-10:00', '10:00-10:20 (Break)', '10:20-11:00', '11:00-11:40', '11:40-12:20', '12:20-1:00 (Lunch)', '1:00-1:40', '1:40-2:20', '2:20-3:00'];

export function timetableFor(classId) {
  const teachableSubjects = SUBJECTS.slice(0, 8);
  const grid = {};
  DAYS.forEach((day) => {
    grid[day] = PERIODS.map((p) => {
      if (p.includes('Break') || p.includes('Lunch')) return { period: p, break: true };
      const subject = pick(teachableSubjects);
      const teacher = TEACHERS.find((t) => t.subjects.includes(subject.id)) || pick(TEACHERS);
      return {
        period: p, subject: subject.name, code: subject.code,
        teacher: teacher.name.split(' ')[0] + ' ' + teacher.name.split(' ')[1]?.[0] + '.',
        room: `${pick(['A', 'B', 'C', 'L'])}${int(1, 24)}`,
      };
    });
  });
  return grid;
}
