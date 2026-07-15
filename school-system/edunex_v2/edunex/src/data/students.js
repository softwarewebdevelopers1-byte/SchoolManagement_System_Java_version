import { pick, int, initials, rng, FIRST_NAMES, LAST_NAMES } from './utils';
import { CLASSES } from './classes';
import { SUBJECTS } from './subjects';

export const STUDENTS = Array.from({ length: 240 }).map((_, i) => {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const cls = CLASSES[i % CLASSES.length];
  const electives = [pick(SUBJECTS.filter((s) => s.type === 'elective')).code];
  return {
    id: `EDX${(2026000 + i).toString()}`,
    admissionNo: `ADM-${3000 + i}`,
    name,
    initials: initials(name),
    gender: rng() > 0.5 ? 'Female' : 'Male',
    classId: cls.id,
    className: cls.name,
    dob: `20${int(9, 12)}-0${int(1, 9)}-1${int(0, 9)}`,
    guardianPhone: `07${int(10000000, 99999999)}`,
    email: `${name.toLowerCase().replace(' ', '.')}@students.edunex.io`,
    electives,
    status: rng() > 0.05 ? 'Active' : 'Inactive',
    avatarSeed: name,
    attendanceRate: int(82, 100),
    overallGrade: pick(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']),
    admitted: `20${int(21, 25)}-01-1${int(0, 5)}`,
  };
});
