import { useEffect, useMemo, useState } from 'react';
import { Search, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { CLASSES, STUDENTS, SUBJECTS, TEACHERS, ASSESSMENT_TYPES, gradeFor, avatarUrl } from '../../data';

const ME = TEACHERS[3];

export default function MarksEntry() {
  const mySubjects = SUBJECTS.filter((s) => ME.subjects.includes(s.id));
  const [classId, setClassId] = useState(CLASSES[0].id);
  const [subjectId, setSubjectId] = useState(mySubjects[0]?.id || SUBJECTS[0].id);
  const [assessment, setAssessment] = useState(ASSESSMENT_TYPES[0]);
  const [query, setQuery] = useState('');
  const [saveState, setSaveState] = useState('saved'); // saved | saving

  const roster = STUDENTS.filter((s) => s.classId === classId);
  const [scores, setScores] = useState(() => Object.fromEntries(roster.map((s) => [s.id, ''])));

  useEffect(() => {
    setScores(Object.fromEntries(STUDENTS.filter((s) => s.classId === classId).map((s) => [s.id, ''])));
  }, [classId]);

  const setScore = (id, val) => {
    if (val !== '' && (!/^\d{0,3}$/.test(val) || +val > 100)) return;
    setScores((s) => ({ ...s, [id]: val }));
    setSaveState('saving');
    clearTimeout(window.__edunexSaveTimer);
    window.__edunexSaveTimer = setTimeout(() => setSaveState('saved'), 900);
  };

  const bulkFill = () => {
    setScores((s) => Object.fromEntries(Object.keys(s).map((id) => [id, s[id] || String(50 + Math.floor(Math.random() * 40))])));
    setSaveState('saving');
    setTimeout(() => setSaveState('saved'), 900);
  };

  const filtered = roster.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const ranked = useMemo(() => {
    return [...filtered]
      .map((s) => ({ ...s, score: scores[s.id] === '' ? null : +scores[s.id] }))
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
      .map((s, i) => ({ ...s, rank: s.score !== null ? i + 1 : '—' }));
  }, [filtered, scores]);

  const enteredScores = Object.values(scores).filter((v) => v !== '').map(Number);
  const classMean = enteredScores.length ? (enteredScores.reduce((a, b) => a + b, 0) / enteredScores.length).toFixed(1) : '—';

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} style={selectStyle}>
            {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={selectStyle}>
            {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={assessment} onChange={(e) => setAssessment(e.target.value)} style={selectStyle}>
            {ASSESSMENT_TYPES.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saveState === 'saving' ? <><Loader2 size={13} className="spin" /> Saving…</> : <><CheckCircle2 size={13} color="var(--success)" /> All changes saved</>}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={bulkFill}><Save size={14} /> Bulk fill remaining</button>
        </div>
      </div>

      <div className="grid-auto" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Class Mean</div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginTop: 4 }}>{classMean}</div></div>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entered</div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginTop: 4 }}>{enteredScores.length} / {roster.length}</div></div>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Highest Score</div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginTop: 4 }}>{enteredScores.length ? Math.max(...enteredScores) : '—'}</div></div>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assessment</div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginTop: 6 }}>{assessment}</div></div>
      </div>

      <div className="card spreadsheet" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search students…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 260, paddingLeft: 30, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 12px 9px 30px', fontSize: 13.5 }} />
        </div>
        <div className="table-wrap" style={{ border: 'none', maxHeight: 520, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr><th style={{ width: 60 }}>Rank</th><th>Student</th><th style={{ width: 120 }}>Score /100</th><th style={{ width: 90 }}>Grade</th><th style={{ width: 70 }}>Points</th></tr>
            </thead>
            <tbody>
              {ranked.map((s) => {
                const g = s.score !== null ? gradeFor(s.score) : null;
                return (
                  <tr key={s.id}>
                    <td>{s.rank !== '—' ? <span className="badge badge-info">#{s.rank}</span> : '—'}</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src={avatarUrl(s.avatarSeed)} style={{ width: 24, height: 24, borderRadius: '50%' }} alt="" />{s.name}</div></td>
                    <td><input value={scores[s.id]} onChange={(e) => setScore(s.id, e.target.value)} placeholder="—" /></td>
                    <td>{g ? <span className="badge badge-success">{g.grade}</span> : '—'}</td>
                    <td>{g ? g.points : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.spin { animation: spin 0.9s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const selectStyle = { background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 12px', fontSize: 13.5, color: 'var(--text)' };
