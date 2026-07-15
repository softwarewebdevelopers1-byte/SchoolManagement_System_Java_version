import { pick, int, initials, FIRST_NAMES, LAST_NAMES, rng } from './utils';
import { SUBJECTS } from './subjects';
import { CLASSES, DEPARTMENTS } from './classes';

export const TEACHERS = Array.from({ length: 28 }).map((_, i) => {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const dept = pick(DEPARTMENTS);
  const subjects = [pick(SUBJECTS).id, pick(SUBJECTS).id];
  return {
    id: `T${1000 + i}`,
    name,
    initials: initials(name),
    email: `${name.toLowerCase().replace(' ', '.')}@edunex.io`,
    phone: `07${int(10000000, 99999999)}`,
    department: dept,
    subjects: [...new Set(subjects)],
    gender: rng() > 0.5 ? 'Female' : 'Male',
    joined: `20${int(14, 25)}-0${int(1, 9)}-1${int(0, 9)}`,
    status: rng() > 0.1 ? 'Active' : 'On Leave',
    workload: int(14, 28),
    tsc: `TSC/${int(100000, 999999)}`,
    avatarSeed: name,
  };
});

// Assign a class teacher to every class now that staff exist.
CLASSES.forEach((c, i) => { c.classTeacherId = TEACHERS[i % TEACHERS.length].id; });

export const classTeacherOf = (classId) =>
  TEACHERS.find((t) => t.id === CLASSES.find((c) => c.id === classId)?.classTeacherId);
