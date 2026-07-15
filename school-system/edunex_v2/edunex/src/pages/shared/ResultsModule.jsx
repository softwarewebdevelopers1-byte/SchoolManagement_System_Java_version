import { useMemo, useState } from 'react';
import { Printer, Award } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import DataTable from '../../components/common/DataTable';
import { CLASSES, STUDENTS, SUBJECTS, SCHOOL, marksFor, gradeFor, avatarUrl } from '../../data';

function ReportCardTab({ fixedStudentId }) {
  const [studentId, setStudentId] = useState(fixedStudentId || STUDENTS[0].id);
  const student = STUDENTS.find((s) => s.id === studentId);
  const rows = useMemo(() => SUBJECTS.slice(0, 8).map((sub) => {
    const score = 35 + Math.floor(Math.abs(Math.sin(sub.id.charCodeAt(3) * studentId.length)) * 60);
    return { subject: sub.name, code: sub.code, score, ...gradeFor(score) };
  }), [studentId]);
  const mean = (rows.reduce((a, r) => a + r.score, 0) / rows.length).toFixed(1);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {!fixedStudentId ? (
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 12px', fontSize: 13.5 }}>
            {STUDENTS.slice(0, 40).map((s) => <option key={s.id} value={s.id}>{s.name} — {s.className}</option>)}
          </select>
        ) : <div />}
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><Printer size={14} /> Print report</button>
      </div>

      <div className="notch-card" style={{ padding: 30, maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>{SCHOOL.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{SCHOOL.address}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{SCHOOL.term} Report Card</div>
          </div>
          <img src={avatarUrl(student.avatarSeed)} alt="" style={{ width: 52, height: 52, borderRadius: 12 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20, fontSize: 13 }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Name: </span><strong>{student.name}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Admission No: </span><strong>{student.admissionNo}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Class: </span><strong>{student.className}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Attendance: </span><strong>{student.attendanceRate}%</strong></div>
        </div>
        <table>
          <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Points</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code}><td>{r.subject}</td><td>{r.score}</td><td><span className="badge badge-info">{r.grade}</span></td><td>{r.points}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div><span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>Mean Score</span><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{mean}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>Overall Grade</span><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{gradeFor(mean).grade}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>Class Rank</span><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{(studentId.length % 12) + 1} / 45</div></div>
        </div>
      </div>
    </div>
  );
}

function ClassResultsTab() {
  const [classId, setClassId] = useState(CLASSES[0].id);
  const subject = SUBJECTS[2];
  const data = marksFor(classId, subject.id);
  return (
    <DataTable
      title={`${CLASSES.find((c) => c.id === classId)?.name} — ${subject.name} results`}
      data={data}
      searchKeys={['name']}
      toolbar={<select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 10px', fontSize: 13 }}>{CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
      columns={[
        { key: 'rank', label: 'Rank', render: (r) => <span className="badge badge-info">#{r.rank}</span> },
        { key: 'name', label: 'Student' },
        { key: 'score', label: 'Score' },
        { key: 'grade', label: 'Grade', render: (r) => <span className="badge badge-success">{r.grade}</span> },
      ]}
    />
  );
}

export default function ResultsModule({ scope = 'admin', fixedStudentId }) {
  const tabs = [
    { key: 'card', label: 'Report Card', content: <ReportCardTab fixedStudentId={fixedStudentId} /> },
    { key: 'class', label: 'Class / Stream Results', content: <ClassResultsTab /> },
  ];
  return (
    <div>
      {!fixedStudentId && (
        <div className="grid-auto" style={{ marginBottom: 22 }}>
          <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="feature-icon" style={{ marginBottom: 0 }}><Award size={20} /></div>
            <div><div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Results status</div><div style={{ fontWeight: 700 }}>Approved · Published</div></div>
          </div>
        </div>
      )}
      <Tabs tabs={tabs} />
    </div>
  );
}
