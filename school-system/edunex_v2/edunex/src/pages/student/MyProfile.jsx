import { Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import { ME_STUDENT } from './StudentDashboard';
import { avatarUrl } from '../../data';

export default function MyProfile() {
  const s = ME_STUDENT;
  return (
    <div className="card" style={{ padding: 28, maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 22 }}>
        <img src={avatarUrl(s.avatarSeed)} alt="" style={{ width: 80, height: 80, borderRadius: 20 }} />
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>{s.name}</h2>
          <p style={{ margin: 0 }}>{s.className} · {s.admissionNo}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, fontSize: 13.5 }}>
        <div><span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> Email</span><div style={{ fontWeight: 600, marginTop: 4 }}>{s.email}</div></div>
        <div><span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> Guardian Phone</span><div style={{ fontWeight: 600, marginTop: 4 }}>{s.guardianPhone}</div></div>
        <div><span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> Date of Birth</span><div style={{ fontWeight: 600, marginTop: 4 }}>{s.dob}</div></div>
        <div><span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={13} /> Electives</span><div style={{ fontWeight: 600, marginTop: 4 }}>{s.electives.join(', ')}</div></div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 22 }}>Edit profile</button>
    </div>
  );
}
