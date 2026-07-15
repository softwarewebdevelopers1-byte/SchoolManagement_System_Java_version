import { Users, ClipboardCheck, Award, Wallet } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { PARENTS, STUDENTS, avatarUrl } from '../../data';

export const ME_PARENT = PARENTS.find((p) => p.childrenIds.length) || PARENTS[0];

export default function ParentDashboard() {
  const children = STUDENTS.filter((s) => ME_PARENT.childrenIds.includes(s.id));
  const kids = children.length ? children : STUDENTS.slice(0, 2);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Welcome, {ME_PARENT.name}</h1>
        <p style={{ margin: 0 }}>Here's how your {kids.length > 1 ? 'children are' : 'child is'} doing this term.</p>
      </div>

      <div className="grid-auto" style={{ marginBottom: 22 }}>
        <StatCard icon={Users} label="Children Enrolled" value={kids.length} tone="blue" notch />
        <StatCard icon={ClipboardCheck} label="Avg. Attendance" value={`${Math.round(kids.reduce((a, k) => a + k.attendanceRate, 0) / kids.length)}%`} tone="success" notch />
        <StatCard icon={Award} label="Avg. Grade" value={kids[0]?.overallGrade || 'B'} tone="blue" notch />
        <StatCard icon={Wallet} label="Fee Balance" value="KES 12,400" tone="warning" notch />
      </div>

      <div className="grid-auto">
        {kids.map((k) => (
          <div key={k.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <img src={avatarUrl(k.avatarSeed)} alt="" style={{ width: 44, height: 44, borderRadius: 12 }} />
              <div><div style={{ fontWeight: 700 }}>{k.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.className}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-info">{k.overallGrade}</span>
              <span className="badge badge-success">{k.attendanceRate}% attendance</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
