import TimetableView from '../shared/TimetableView';
import { ME_STUDENT } from './StudentDashboard';
export default function Timetable() { return <TimetableView title="My Timetable" fixedClassId={ME_STUDENT.classId} />; }
