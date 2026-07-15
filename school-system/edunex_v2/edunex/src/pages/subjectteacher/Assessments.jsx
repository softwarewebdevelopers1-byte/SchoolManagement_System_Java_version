import { ListChecks, Plus, Calendar } from 'lucide-react';
import { ASSESSMENT_TYPES } from '../../data';
import { useToast } from '../../context/ToastContext';

export default function Assessments() {
  const toast = useToast();
  return (
    <div className="grid-auto">
      {ASSESSMENT_TYPES.map((a, i) => (
        <div key={a} className="card" style={{ padding: 18 }}>
          <div className="feature-icon" style={{ marginBottom: 12 }}><ListChecks size={18} /></div>
          <h3 style={{ fontSize: 14.5, marginBottom: 6 }}>{a}</h3>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Calendar size={12} /> Window: {10 + i * 3} Jul – {14 + i * 3} Jul
          </div>
          <span className={`badge badge-${i < 2 ? 'success' : 'neutral'}`}>{i < 2 ? 'Marks entered' : 'Upcoming'}</span>
        </div>
      ))}
      <button className="card btn-ghost" style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed var(--border-strong)' }} onClick={() => toast.success('New assessment window created')}>
        <Plus size={20} /> New assessment
      </button>
    </div>
  );
}
