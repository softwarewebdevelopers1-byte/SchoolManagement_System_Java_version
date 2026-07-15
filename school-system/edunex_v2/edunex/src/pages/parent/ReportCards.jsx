import ResultsModule from '../shared/ResultsModule';
import { ME_PARENT } from './ParentDashboard';
import { STUDENTS } from '../../data';
export default function ReportCards() {
  const child = STUDENTS.find((s) => ME_PARENT.childrenIds.includes(s.id)) || STUDENTS[0];
  return <ResultsModule fixedStudentId={child.id} />;
}
