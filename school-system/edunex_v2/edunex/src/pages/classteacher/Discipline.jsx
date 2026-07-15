import { AlertTriangle, Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { STUDENTS, CLASSES } from '../../data';
import { useToast } from '../../context/ToastContext';

const MY_CLASS = CLASSES[0];
const CASES = [
  { student: 0, issue: 'Late to school (3rd occurrence)', action: 'Verbal warning issued', status: 'Open', date: '2026-07-08' },
  { student: 3, issue: 'Uniform non-compliance', action: 'Parent notified', status: 'Resolved', date: '2026-07-02' },
  { student: 7, issue: 'Missed homework submissions', action: 'Meeting scheduled', status: 'Open', date: '2026-07-10' },
];

export default function Discipline() {
  const toast = useToast();
  const roster = STUDENTS.filter((s) => s.classId === MY_CLASS.id);
  const rows = CASES.map((c, i) => ({ id: i, ...c, name: roster[c.student]?.name || 'Student' }));

  return (
    <DataTable
      title="Discipline records"
      data={rows}
      searchKeys={['name', 'issue']}
      filters={[{ key: 'status', options: ['Open', 'Resolved'] }]}
      toolbar={<button className="btn btn-primary btn-sm" onClick={() => toast.success('Discipline record logged')}><Plus size={15} /> Log incident</button>}
      columns={[
        { key: 'name', label: 'Student' },
        { key: 'issue', label: 'Issue', render: (r) => <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={13} color="var(--warning)" />{r.issue}</span> },
        { key: 'action', label: 'Action taken' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status === 'Open' ? 'warning' : 'success'}`}>{r.status}</span> },
      ]}
    />
  );
}
