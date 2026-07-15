import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import { CLASSES, STUDENTS, classTeacherOf, FORMS, STREAMS } from '../../data';
import { School, Plus } from 'lucide-react';

export default function Classes() {
  const enriched = CLASSES.map((c) => ({
    ...c,
    enrolled: STUDENTS.filter((s) => s.classId === c.id).length,
    teacher: classTeacherOf(c.id)?.name || '—',
  }));

  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={School} label="Total Classes" value={CLASSES.length} tone="blue" />
        <StatCard label="Forms" value={FORMS.length} tone="success" />
        <StatCard label="Streams per Form" value={STREAMS.length} tone="warning" />
        <StatCard label="Avg. Class Size" value={Math.round(STUDENTS.length / CLASSES.length)} tone="blue" />
      </div>
      <DataTable
        title="Classes & streams"
        data={enriched}
        searchKeys={['name', 'teacher']}
        filters={[{ key: 'form', options: FORMS }]}
        toolbar={<button className="btn btn-primary btn-sm"><Plus size={15} /> Add class</button>}
        columns={[
          { key: 'name', label: 'Class' },
          { key: 'teacher', label: 'Class Teacher' },
          { key: 'enrolled', label: 'Enrolled', render: (r) => `${r.enrolled} / ${r.capacity}` },
          { key: 'capacity', label: 'Capacity utilization', render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 80, height: 6, borderRadius: 4, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
                <div style={{ width: `${(r.enrolled / r.capacity) * 100}%`, height: '100%', background: 'var(--brand-blue-2)' }} />
              </div>
              <span style={{ fontSize: 12 }}>{Math.round((r.enrolled / r.capacity) * 100)}%</span>
            </div>
          ) },
        ]}
      />
    </div>
  );
}
