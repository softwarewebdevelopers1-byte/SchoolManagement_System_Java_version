import { STUDENTS, avatarUrl } from '../../data';
import { ME_PARENT } from './ParentDashboard';
import { Mail, Phone, Award, ClipboardCheck } from 'lucide-react';

export default function Children() {
  const children = STUDENTS.filter((s) => ME_PARENT.childrenIds.includes(s.id));
  const kids = children.length ? children : STUDENTS.slice(0, 2);

  return (
    <div className="grid-auto">
      {kids.map((k) => (
        <div key={k.id} className="notch-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <img src={avatarUrl(k.avatarSeed)} alt="" style={{ width: 56, height: 56, borderRadius: 14 }} />
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 2 }}>{k.name}</h3>
              <p style={{ margin: 0, fontSize: 13 }}>{k.className} · {k.admissionNo}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 14 }}>
            <div><span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> Email</span><div style={{ fontWeight: 600 }}>{k.email}</div></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} /> Contact</span><div style={{ fontWeight: 600 }}>{k.guardianPhone}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-info"><Award size={12} /> {k.overallGrade}</span>
            <span className="badge badge-success"><ClipboardCheck size={12} /> {k.attendanceRate}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
