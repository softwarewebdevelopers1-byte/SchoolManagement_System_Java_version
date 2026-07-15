import { useState } from 'react';
import DataTable from '../../components/common/DataTable';
import { CLASSES, TEACHERS, SUBJECTS, marksFor, avatarUrl } from '../../data';

const ME = TEACHERS[3];

export default function GradeBook() {
  const mySubjects = SUBJECTS.filter((s) => ME.subjects.includes(s.id));
  const [classId, setClassId] = useState(CLASSES[0].id);
  const [subjectId, setSubjectId] = useState(mySubjects[0]?.id || SUBJECTS[0].id);
  const data = marksFor(classId, subjectId, 'End Term');

  return (
    <DataTable
      title="Grade book"
      data={data}
      searchKeys={['name']}
      toolbar={
        <>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 10px', fontSize: 13 }}>
            {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 10px', fontSize: 13 }}>
            {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </>
      }
      columns={[
        { key: 'rank', label: 'Rank', render: (r) => <span className="badge badge-info">#{r.rank}</span> },
        { key: 'name', label: 'Student' },
        { key: 'score', label: 'Score' },
        { key: 'grade', label: 'Grade', render: (r) => <span className="badge badge-success">{r.grade}</span> },
        { key: 'points', label: 'Points' },
      ]}
    />
  );
}
