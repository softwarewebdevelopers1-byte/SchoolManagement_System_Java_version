import { Building2 } from 'lucide-react';
import { DEPARTMENTS, TEACHERS } from '../../data';

export default function Departments() {
  return (
    <div className="grid-auto">
      {DEPARTMENTS.map((d) => {
        const staff = TEACHERS.filter((t) => t.department === d);
        return (
          <div key={d} className="card" style={{ padding: 20 }}>
            <div className="feature-icon" style={{ marginBottom: 14 }}><Building2 size={20} /></div>
            <h3 style={{ fontSize: 15.5, marginBottom: 4 }}>{d}</h3>
            <p style={{ fontSize: 13, marginBottom: 12 }}>{staff.length} teaching staff</p>
            <div style={{ display: 'flex', marginLeft: -4 }}>
              {staff.slice(0, 5).map((t) => (
                <div key={t.id} title={t.name} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginLeft: -4, border: '2px solid var(--surface)' }}>
                  {t.initials}
                </div>
              ))}
              {staff.length > 5 && <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, marginLeft: -4, border: '2px solid var(--surface)' }}>+{staff.length - 5}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
