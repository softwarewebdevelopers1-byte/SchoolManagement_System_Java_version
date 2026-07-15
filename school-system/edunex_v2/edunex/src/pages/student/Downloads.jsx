import { FileText, Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const FILES = [
  { name: 'Term 2 Report Card.pdf', size: '184 KB', date: '2026-07-10' },
  { name: 'Mathematics Revision Notes.pdf', size: '2.1 MB', date: '2026-07-08' },
  { name: 'Class Timetable.pdf', size: '96 KB', date: '2026-07-01' },
  { name: 'School Fee Structure 2026.pdf', size: '210 KB', date: '2026-06-20' },
];

export default function Downloads() {
  const toast = useToast();
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {FILES.map((f, i) => (
        <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < FILES.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div className="feature-icon" style={{ marginBottom: 0 }}><FileText size={18} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.8 }}>{f.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{f.size} · {f.date}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => toast.success(`Downloading ${f.name}`)}><Download size={14} /> Download</button>
        </div>
      ))}
    </div>
  );
}
