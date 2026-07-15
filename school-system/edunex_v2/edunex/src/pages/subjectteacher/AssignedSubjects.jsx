import { BookOpen } from 'lucide-react';
import { TEACHERS, SUBJECTS, CLASSES } from '../../data';

const ME = TEACHERS[3];

export default function AssignedSubjects() {
  const mySubjects = SUBJECTS.filter((s) => ME.subjects.includes(s.id));
  return (
    <div className="grid-auto">
      {mySubjects.map((s) => (
        <div key={s.id} className="notch-card" style={{ padding: 22 }}>
          <div className="feature-icon" style={{ marginBottom: 14 }}><BookOpen size={20} /></div>
          <span className="badge badge-info" style={{ marginBottom: 8 }}>{s.code}</span>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>{s.name}</h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Classes taught:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CLASSES.slice(0, 4).map((c) => <span key={c.id} className="badge badge-neutral">{c.name}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}
