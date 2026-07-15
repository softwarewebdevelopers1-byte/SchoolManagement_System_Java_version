import { BookOpen, FileSpreadsheet, PieChart, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import { TEACHERS, SUBJECTS, CLASSES } from '../../data';

const ME = TEACHERS[3];

export default function SubjectTeacherDashboard() {
  const mySubjects = SUBJECTS.filter((s) => ME.subjects.includes(s.id));
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Hi {ME.name.split(' ')[0]} 👋</h1>
        <p style={{ margin: 0 }}>You teach {mySubjects.map((s) => s.name).join(' & ')} this term.</p>
      </div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={BookOpen} label="Assigned Subjects" value={mySubjects.length} tone="blue" notch />
        <StatCard icon={FileSpreadsheet} label="Pending Marks Entry" value="2 classes" tone="warning" notch />
        <StatCard icon={PieChart} label="Subject Mean" value="61.8" delta="+3.2" tone="success" notch />
        <StatCard icon={ClipboardCheck} label="Weekly Lessons" value={ME.workload} tone="blue" notch />
      </div>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Quick actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="marks-entry" className="btn btn-primary"><FileSpreadsheet size={15} /> Enter marks</Link>
          <Link to="gradebook" className="btn btn-secondary">Open gradebook</Link>
          <Link to="performance" className="btn btn-secondary">View subject performance</Link>
        </div>
      </div>
    </div>
  );
}
