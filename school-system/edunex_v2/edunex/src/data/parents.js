import { pick, int, initials, LAST_NAMES } from './utils';
import { STUDENTS } from './students';

export const PARENTS = Array.from({ length: 60 }).map((_, i) => {
  const name = `${pick(['Mr.', 'Mrs.', 'Dr.'])} ${pick(LAST_NAMES)}`;
  const children = STUDENTS.filter((_, si) => si % 60 === i).slice(0, int(1, 2));
  return {
    id: `P${5000 + i}`,
    name,
    initials: initials(name.replace(/(Mr\.|Mrs\.|Dr\.)\s*/, 'X ')),
    phone: `07${int(10000000, 99999999)}`,
    email: `${name.split(' ')[1]?.toLowerCase()}${i}@gmail.com`,
    occupation: pick(['Business', 'Engineer', 'Teacher', 'Doctor', 'Farmer', 'Civil Servant', 'Entrepreneur']),
    childrenIds: children.map((c) => c.id),
    avatarSeed: name,
  };
});
