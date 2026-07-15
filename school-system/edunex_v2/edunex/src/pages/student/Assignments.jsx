import { ListChecks, Clock, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { SUBJECTS } from '../../data';

const ASSIGNMENTS = SUBJECTS.slice(0, 8).map((s, i) => ({
  id: i, subject: s.name, title: `${s.name} — ${['Worksheet 3', 'Essay draft', 'Lab report', 'Problem set 4', 'Reading response', 'Project proposal'][i % 6]}`,
  due: `2026-07-${14 + i}`, status: i % 3 === 0 ? 'Submitted' : i % 3 === 1 ? 'Pending' : 'Overdue',
}));

export default function Assignments() {
  return (
    <DataTable
      title="My assignments"
      data={ASSIGNMENTS}
      searchKeys={['title', 'subject']}
      filters={[{ key: 'status', options: ['Submitted', 'Pending', 'Overdue'] }]}
      columns={[
        { key: 'title', label: 'Assignment', render: (r) => <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ListChecks size={14} color="var(--brand-blue)" />{r.title}</span> },
        { key: 'subject', label: 'Subject' },
        { key: 'due', label: 'Due date' },
        { key: 'status', label: 'Status', render: (r) => (
          <span className={`badge badge-${r.status === 'Submitted' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'}`}>
            {r.status === 'Submitted' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {r.status}
          </span>
        ) },
      ]}
    />
  );
}
