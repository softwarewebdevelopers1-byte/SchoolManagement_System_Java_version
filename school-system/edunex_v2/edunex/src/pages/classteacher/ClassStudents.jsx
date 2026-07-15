import DataTable from '../../components/common/DataTable';
import { STUDENTS, CLASSES, avatarUrl } from '../../data';

const MY_CLASS = CLASSES[0];

export default function ClassStudents() {
  const roster = STUDENTS.filter((s) => s.classId === MY_CLASS.id);
  return (
    <DataTable
      title={`${MY_CLASS.name} — student profiles`}
      data={roster}
      searchKeys={['name', 'admissionNo']}
      columns={[
        { key: 'name', label: 'Student', render: (r) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={avatarUrl(r.avatarSeed)} style={{ width: 30, height: 30, borderRadius: '50%' }} alt="" />
            <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.admissionNo}</div></div>
          </div>
        ) },
        { key: 'gender', label: 'Gender' },
        { key: 'attendanceRate', label: 'Attendance', render: (r) => `${r.attendanceRate}%` },
        { key: 'overallGrade', label: 'Grade', render: (r) => <span className="badge badge-info">{r.overallGrade}</span> },
        { key: 'guardianPhone', label: 'Guardian Phone' },
      ]}
    />
  );
}
