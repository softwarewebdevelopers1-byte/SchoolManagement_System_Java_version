import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { CLASSES, DAYS, timetableFor } from '../../data';

export default function TimetableView({ title = 'Timetable', fixedClassId, allowClassSwitch = true }) {
  const [classId, setClassId] = useState(fixedClassId || CLASSES[0].id);
  const grid = useMemo(() => timetableFor(classId), [classId]);
  const cls = CLASSES.find((c) => c.id === classId);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 13.5 }}>{cls?.name} · Term 2, 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="badge badge-success"><CheckCircle2 size={12} /> Zero scheduling conflicts</span>
          {allowClassSwitch && !fixedClassId && (
            <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '9px 12px', fontSize: 13.5, color: 'var(--text)' }}>
              {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th><CalendarClock size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Period</th>
              {DAYS.map((d) => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid[DAYS[0]].map((_, pi) => (
              <tr key={pi}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{grid[DAYS[0]][pi].period}</td>
                {DAYS.map((day) => {
                  const cell = grid[day][pi];
                  if (cell.break) return <td key={day} style={{ background: 'var(--bg-subtle)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>—</td>;
                  return (
                    <td key={day}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{cell.code}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{cell.teacher} · {cell.room}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
