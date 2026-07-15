import AttendanceModule from '../shared/AttendanceModule';
import { CLASSES } from '../../data';
export default function Attendance() { return <AttendanceModule scope="class" classId={CLASSES[0].id} />; }
