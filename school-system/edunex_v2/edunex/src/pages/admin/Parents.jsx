import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import { PARENTS, STUDENTS, avatarUrl } from '../../data';
import { Contact, UserPlus } from 'lucide-react';

export default function Parents() {
  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={Contact} label="Registered Parents" value={PARENTS.length} tone="blue" />
        <StatCard label="Linked to Students" value={PARENTS.filter((p) => p.childrenIds.length).length} tone="success" />
        <StatCard label="Avg. Children per Parent" value={(PARENTS.reduce((a, p) => a + p.childrenIds.length, 0) / PARENTS.length).toFixed(1)} tone="warning" />
      </div>
      <DataTable
        title="All parents / guardians"
        data={PARENTS}
        searchKeys={['name', 'email', 'phone']}
        toolbar={<button className="btn btn-primary btn-sm"><UserPlus size={15} /> Add parent</button>}
        columns={[
          { key: 'name', label: 'Parent', render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={avatarUrl(r.avatarSeed)} style={{ width: 30, height: 30, borderRadius: '50%' }} alt="" />
              <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.occupation}</div></div>
            </div>
          ) },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'childrenIds', label: 'Children', render: (r) => r.childrenIds.map((id) => STUDENTS.find((s) => s.id === id)?.name).filter(Boolean).join(', ') || '—' },
        ]}
      />
    </div>
  );
}
