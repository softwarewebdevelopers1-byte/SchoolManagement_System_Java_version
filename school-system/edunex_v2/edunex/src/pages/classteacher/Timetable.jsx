import TimetableView from '../shared/TimetableView';
import { CLASSES } from '../../data';
export default function Timetable() { return <TimetableView title="My Class Timetable" fixedClassId={CLASSES[0].id} />; }
