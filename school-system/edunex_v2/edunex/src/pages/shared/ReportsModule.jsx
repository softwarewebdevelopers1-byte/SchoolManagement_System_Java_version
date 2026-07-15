import { Download, FileText, GraduationCap, UserCog, School } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import { useToast } from '../../context/ToastContext';
import { REPORT_SETS } from '../../data/reports';

const ICONS = { FileText, GraduationCap, UserCog, School };

function ReportRow({ icon, title, meta }) {
  const toast = useToast();
  const Icon = ICONS[icon] || FileText;
  return (
    <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
      <div className="feature-icon" style={{ marginBottom: 0 }}><Icon size={18} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{meta}</div>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={() => toast.success(`${title} exported`)}><Download size={14} /> Export</button>
    </div>
  );
}

export default function ReportsModule() {
  const tabs = Object.entries(REPORT_SETS).map(([key, rows]) => ({
    key,
    label: `${key[0].toUpperCase()}${key.slice(1)} Reports`,
    content: <div>{rows.map((r) => <ReportRow key={r.title} {...r} />)}</div>,
  }));
  return <Tabs tabs={tabs} />;
}
