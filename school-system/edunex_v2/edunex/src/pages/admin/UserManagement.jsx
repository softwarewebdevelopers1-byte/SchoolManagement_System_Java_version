import { UserPlus, KeyRound } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { SYSTEM_USERS } from '../../data';
import { useToast } from '../../context/ToastContext';

export default function UserManagement() {
  const toast = useToast();
  return (
    <DataTable
      title="System users"
      data={SYSTEM_USERS}
      searchKeys={['name', 'email', 'role']}
      filters={[{ key: 'role', options: [...new Set(SYSTEM_USERS.map((u) => u.role))] }]}
      toolbar={<button className="btn btn-primary btn-sm" onClick={() => toast.success('Invitation sent')}><UserPlus size={15} /> Invite user</button>}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: (r) => <span className="badge badge-info">{r.role}</span> },
        { key: 'lastLogin', label: 'Last login' },
        { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status === 'Active' ? 'success' : 'warning'}`}>{r.status}</span> },
      ]}
      rowActions={(r) => <button className="btn btn-secondary btn-sm" onClick={() => toast.success(`Password reset for ${r.name}`)}><KeyRound size={13} /> Reset password</button>}
    />
  );
}
