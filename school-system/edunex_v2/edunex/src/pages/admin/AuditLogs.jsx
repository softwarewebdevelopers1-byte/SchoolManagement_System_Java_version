import { History } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { AUDIT_LOGS } from '../../data';

export default function AuditLogs() {
  return (
    <DataTable
      title="Audit log"
      data={AUDIT_LOGS}
      searchKeys={['user', 'action']}
      columns={[
        { key: 'user', label: 'User' },
        { key: 'action', label: 'Action', render: (r) => <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><History size={13} color="var(--text-muted)" />{r.action}</span> },
        { key: 'ip', label: 'IP Address', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{r.ip}</span> },
        { key: 'time', label: 'Time' },
      ]}
    />
  );
}
