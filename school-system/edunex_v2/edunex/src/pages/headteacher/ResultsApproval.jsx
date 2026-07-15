import { CheckCircle2, Clock } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { CLASSES } from '../../data';
import { useToast } from '../../context/ToastContext';

const STATUS = ['Approved', 'Pending', 'Approved', 'Approved', 'Pending', 'Approved'];

export default function ResultsApproval() {
  const toast = useToast();
  const rows = CLASSES.map((c, i) => ({ ...c, status: STATUS[i % STATUS.length], submittedBy: 'Class Teacher' }));
  return (
    <DataTable
      title="Results awaiting approval"
      data={rows}
      searchKeys={['name']}
      filters={[{ key: 'status', options: ['Approved', 'Pending'] }]}
      columns={[
        { key: 'name', label: 'Class' },
        { key: 'submittedBy', label: 'Submitted by' },
        { key: 'status', label: 'Status', render: (r) => (
          <span className={`badge badge-${r.status === 'Approved' ? 'success' : 'warning'}`}>
            {r.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {r.status}
          </span>
        ) },
      ]}
      rowActions={(r) => r.status === 'Pending'
        ? <button className="btn btn-primary btn-sm" onClick={() => toast.success(`${r.name} results approved`)}>Approve</button>
        : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>}
    />
  );
}
