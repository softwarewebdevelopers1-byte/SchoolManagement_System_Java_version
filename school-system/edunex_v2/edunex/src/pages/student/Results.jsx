import ResultsModule from '../shared/ResultsModule';
import { ME_STUDENT } from './StudentDashboard';
export default function Results() { return <ResultsModule fixedStudentId={ME_STUDENT.id} />; }
