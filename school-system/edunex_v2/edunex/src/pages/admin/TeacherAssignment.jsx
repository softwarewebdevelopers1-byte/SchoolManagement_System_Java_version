import { ClipboardList } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import DataTable from '../../components/common/DataTable';
import { CLASSES, TEACHERS, SUBJECTS, classTeacherOf } from '../../data';
import { useToast } from '../../context/ToastContext';

function ClassTeacherTab() {
  const toast = useToast();
  return (
    <DataTable
      title="Class teacher assignments"
      data={CLASSES}
      searchKeys={['name']}
      columns={[
        { key: 'name', label: 'Class' },
        { key: 'classTeacherId', label: 'Class Teacher', render: (r) => classTeacherOf(r.id)?.name || '—' },
      ]}
      rowActions={(r) => (
        <select defaultValue={r.classTeacherId} onChange={() => toast.success(`Class teacher updated for ${r.name}`)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 8px', fontSize: 12.5 }}>
          {TEACHERS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}
    />
  );
}

function SubjectTeacherTab() {
  const toast = useToast();
  const rows = SUBJECTS.map((s) => ({ ...s, teachers: TEACHERS.filter((t) => t.subjects.includes(s.id)) }));
  return (
    <DataTable
      title="Subject teacher assignments"
      data={rows}
      searchKeys={['name']}
      columns={[
        { key: 'code', label: 'Code', render: (r) => <span className="badge badge-info">{r.code}</span> },
        { key: 'name', label: 'Subject' },
        { key: 'teachers', label: 'Assigned Teachers', render: (r) => r.teachers.map((t) => t.name).join(', ') || 'Unassigned' },
      ]}
      rowActions={() => <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Teacher assigned')}>Assign teacher</button>}
    />
  );
}

export default function TeacherAssignment() {
  const tabs = [
    { key: 'class', label: 'Assign Class Teachers', content: <ClassTeacherTab /> },
    { key: 'subject', label: 'Assign Subject Teachers', content: <SubjectTeacherTab /> },
  ];
  return (
    <div>
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div className="feature-icon" style={{ marginBottom: 0 }}><ClipboardList size={20} /></div>
        <div><div style={{ fontWeight: 700 }}>Teacher assignment</div><p style={{ margin: 0, fontSize: 13 }}>Assign class teachers to streams and subject teachers to courses.</p></div>
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
