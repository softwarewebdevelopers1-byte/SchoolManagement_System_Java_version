import { CalendarRange, Plus } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import { SCHOOL } from '../../data';
import { useToast } from '../../context/ToastContext';

function YearsTab() {
  const years = ['2023', '2024', '2025', '2026'];
  return (
    <div className="table-wrap card">
      <table>
        <thead><tr><th>Academic Year</th><th>Status</th><th>Terms</th></tr></thead>
        <tbody>
          {years.map((y) => (
            <tr key={y}><td>{y}</td><td>{y === SCHOOL.academicYear ? <span className="badge badge-success">Current</span> : <span className="badge badge-neutral">Closed</span>}</td><td>3</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TermsTab() {
  const terms = [
    { name: 'Term 1, 2026', start: '2026-01-05', end: '2026-04-03', status: 'Closed' },
    { name: 'Term 2, 2026', start: '2026-05-04', end: '2026-08-14', status: 'Current' },
    { name: 'Term 3, 2026', start: '2026-09-01', end: '2026-11-20', status: 'Upcoming' },
  ];
  return (
    <div className="table-wrap card">
      <table>
        <thead><tr><th>Term</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
        <tbody>
          {terms.map((t) => (
            <tr key={t.name}><td>{t.name}</td><td>{t.start}</td><td>{t.end}</td><td><span className={`badge badge-${t.status === 'Current' ? 'success' : t.status === 'Upcoming' ? 'info' : 'neutral'}`}>{t.status}</span></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GradingTab() {
  const bands = [
    ['A', '80–100', 12], ['A-', '75–79', 11], ['B+', '70–74', 10], ['B', '65–69', 9],
    ['B-', '60–64', 8], ['C+', '55–59', 7], ['C', '50–54', 6], ['C-', '45–49', 5],
    ['D+', '40–44', 4], ['D', '35–39', 3], ['D-', '30–34', 2], ['E', '0–29', 1],
  ];
  return (
    <div className="table-wrap card">
      <table>
        <thead><tr><th>Grade</th><th>Score Range</th><th>Points</th></tr></thead>
        <tbody>{bands.map(([g, r, p]) => <tr key={g}><td><span className="badge badge-info">{g}</span></td><td>{r}</td><td>{p}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function TemplatesTab() {
  const toast = useToast();
  const templates = ['Standard Termly Report Card', 'End-of-Year Transcript', 'Continuous Assessment Summary'];
  return (
    <div className="grid-auto">
      {templates.map((t) => (
        <div key={t} className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14.5, marginBottom: 10 }}>{t}</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => toast.info(`Previewing "${t}"`)}>Preview template</button>
        </div>
      ))}
      <button className="card btn-ghost" style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed var(--border-strong)' }} onClick={() => toast.success('New template created')}>
        <Plus size={20} /> New template
      </button>
    </div>
  );
}

export default function AcademicStructure() {
  const tabs = [
    { key: 'years', label: 'Academic Years', content: <YearsTab /> },
    { key: 'terms', label: 'School Terms', content: <TermsTab /> },
    { key: 'grading', label: 'Grading System', content: <GradingTab /> },
    { key: 'templates', label: 'Result Templates', content: <TemplatesTab /> },
  ];
  return (
    <div>
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div className="feature-icon" style={{ marginBottom: 0 }}><CalendarRange size={20} /></div>
        <div><div style={{ fontWeight: 700 }}>Academic structure</div><p style={{ margin: 0, fontSize: 13 }}>Manage {SCHOOL.academicYear} academic years, terms, grading bands and result templates.</p></div>
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
