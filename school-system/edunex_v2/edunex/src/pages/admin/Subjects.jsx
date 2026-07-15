import { useState } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { SUBJECTS, STUDENTS, avatarUrl } from '../../data';
import { useToast } from '../../context/ToastContext';

function SubjectTable(list, toolbar) {
  return (
    <DataTable
      data={list}
      searchKeys={['name', 'code']}
      toolbar={toolbar}
      columns={[
        { key: 'code', label: 'Code', render: (r) => <span className="badge badge-info">{r.code}</span> },
        { key: 'name', label: 'Subject' },
        { key: 'type', label: 'Type', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.type}</span> },
      ]}
    />
  );
}

function RegistrationTab() {
  const toast = useToast();
  const electiveSubs = SUBJECTS.filter((s) => s.type === 'elective');
  return (
    <DataTable
      title="Register students to electives"
      data={STUDENTS.slice(0, 60)}
      searchKeys={['name', 'admissionNo']}
      columns={[
        { key: 'name', label: 'Student', render: (r) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={avatarUrl(r.avatarSeed)} style={{ width: 26, height: 26, borderRadius: '50%' }} alt="" />{r.name}
          </div>
        ) },
        { key: 'className', label: 'Class' },
        { key: 'electives', label: 'Registered Electives', render: (r) => r.electives.join(', ') },
      ]}
      rowActions={() => (
        <select onChange={(e) => e.target.value && toast.success(`Registered elective: ${e.target.value}`)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', fontSize: 12.5 }}>
          <option value="">+ Add elective</option>
          {electiveSubs.map((s) => <option key={s.code} value={s.code}>{s.code}</option>)}
        </select>
      )}
    />
  );
}

function DroppingTab() {
  const toast = useToast();
  return (
    <DataTable
      title="Subject dropping requests"
      data={STUDENTS.filter((s) => s.electives.length).slice(0, 30)}
      searchKeys={['name']}
      columns={[
        { key: 'name', label: 'Student' },
        { key: 'className', label: 'Class' },
        { key: 'electives', label: 'Subject', render: (r) => r.electives.join(', ') },
      ]}
      rowActions={(r) => <button className="btn btn-danger btn-sm" onClick={() => toast.success(`Dropped ${r.electives[0]} for ${r.name}`)}><X size={13} /> Drop</button>}
    />
  );
}

function AllocationTab() {
  return (
    <DataTable
      title="Subject allocation by class"
      data={SUBJECTS}
      searchKeys={['name']}
      columns={[
        { key: 'code', label: 'Code', render: (r) => <span className="badge badge-info">{r.code}</span> },
        { key: 'name', label: 'Subject' },
        { key: 'type', label: 'Allocated to', render: (r) => r.type === 'core' ? 'All forms' : 'Form 2–4 electives' },
      ]}
    />
  );
}

export default function Subjects() {
  const core = SUBJECTS.filter((s) => s.type === 'core');
  const elective = SUBJECTS.filter((s) => s.type === 'elective');
  const toast = useToast();
  const addBtn = <button className="btn btn-primary btn-sm" onClick={() => toast.success('Subject created')}><Plus size={15} /> Add subject</button>;

  const tabs = [
    { key: 'core', label: 'Core Subjects', content: SubjectTable(core, addBtn) },
    { key: 'elective', label: 'Elective Subjects', content: SubjectTable(elective, addBtn) },
    { key: 'register', label: 'Subject Registration', content: <RegistrationTab /> },
    { key: 'allocate', label: 'Subject Allocation', content: <AllocationTab /> },
    { key: 'drop', label: 'Subject Dropping', content: <DroppingTab /> },
  ];

  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={BookOpen} label="Total Subjects" value={SUBJECTS.length} tone="blue" />
        <StatCard label="Core Subjects" value={core.length} tone="success" />
        <StatCard label="Elective Subjects" value={elective.length} tone="warning" />
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
