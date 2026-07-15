import TimetableView from '../shared/TimetableView';
import { ME_PARENT } from './ParentDashboard';
import { STUDENTS } from '../../data';
export default function Timetable() {
  const child = STUDENTS.find((s) => ME_PARENT.childrenIds.includes(s.id)) || STUDENTS[0];
  return <TimetableView title="Child's Timetable" fixedClassId={child.classId} />;
}
