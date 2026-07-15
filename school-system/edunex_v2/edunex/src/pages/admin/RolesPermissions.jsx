import { KeyRound, CheckCircle2 } from 'lucide-react';
import { ROLES_PERMISSIONS } from '../../data';

export default function RolesPermissions() {
  return (
    <div className="grid-auto">
      {ROLES_PERMISSIONS.map((r) => (
        <div key={r.role} className="notch-card" style={{ padding: 20 }}>
          <div className="feature-icon" style={{ marginBottom: 14 }}><KeyRound size={20} /></div>
          <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>{r.role}</h3>
          {r.permissions.map((p) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="var(--success)" /> {p}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
