import { BookOpen } from 'lucide-react';
import { SUBJECTS } from '../../data';
import { ME_STUDENT } from './StudentDashboard';

export default function Subjects() {
  const core = SUBJECTS.filter((s) => s.type === 'core');
  const electives = SUBJECTS.filter((s) => ME_STUDENT.electives.includes(s.code));
  return (
    <div>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Core subjects</h3>
      <div className="grid-auto" style={{ marginBottom: 24 }}>
        {core.map((s) => (
          <div key={s.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="feature-icon" style={{ marginBottom: 0 }}><BookOpen size={16} /></div>
            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.code}</div></div>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>My electives</h3>
      <div className="grid-auto">
        {electives.map((s) => (
          <div key={s.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="feature-icon" style={{ marginBottom: 0 }}><BookOpen size={16} /></div>
            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.code}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
