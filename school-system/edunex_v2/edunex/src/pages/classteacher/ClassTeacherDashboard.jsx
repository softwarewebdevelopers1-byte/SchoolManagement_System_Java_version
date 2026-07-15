import { GraduationCap, ClipboardCheck, AlertTriangle, Award } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { STUDENTS, CLASSES, avatarUrl } from '../../data';

const MY_CLASS = CLASSES[0];

export default function ClassTeacherDashboard() {
  const roster = STUDENTS.filter((s) => s.classId === MY_CLASS.id);
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Hi Grace 👋</h1>
        <p style={{ margin: 0 }}>You're the class teacher for <strong>{MY_CLASS.name}</strong>.</p>
      </div>

      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={GraduationCap} label="Students in Class" value={roster.length} tone="blue" notch />
        <StatCard icon={ClipboardCheck} label="Today's Attendance" value="97%" tone="success" notch />
        <StatCard icon={Award} label="Class Mean Score" value="66.2" delta="+1.4" tone="blue" notch />
        <StatCard icon={AlertTriangle} label="Discipline Cases" value="1 open" tone="warning" notch />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <h3 style={{ fontSize: 15, padding: '18px 20px 0' }}>Class roster</h3>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead><tr><th>Student</th><th>Attendance</th><th>Grade</th></tr></thead>
            <tbody>
              {roster.slice(0, 8).map((s) => (
                <tr key={s.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src={avatarUrl(s.avatarSeed)} style={{ width: 26, height: 26, borderRadius: '50%' }} alt="" />{s.name}</div></td>
                  <td>{s.attendanceRate}%</td>
                  <td><span className="badge badge-info">{s.overallGrade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
