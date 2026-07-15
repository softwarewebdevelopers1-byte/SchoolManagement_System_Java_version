import { Award, ClipboardCheck, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../../components/common/StatCard';
import { STUDENTS, SUBJECTS, avatarUrl } from '../../data';

export const ME_STUDENT = STUDENTS[0];
const TREND = [['CAT 1', 58], ['CAT 2', 62], ['Midterm', 65], ['End Term', 71]].map(([name, score]) => ({ name, score }));

export default function StudentDashboard() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <img src={avatarUrl(ME_STUDENT.avatarSeed)} alt="" style={{ width: 54, height: 54, borderRadius: 14 }} />
        <div>
          <h1 style={{ fontSize: 21, marginBottom: 2 }}>Hi {ME_STUDENT.name.split(' ')[0]} 👋</h1>
          <p style={{ margin: 0 }}>{ME_STUDENT.className} · {ME_STUDENT.admissionNo}</p>
        </div>
      </div>

      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={Award} label="Overall Grade" value={ME_STUDENT.overallGrade} tone="success" notch />
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${ME_STUDENT.attendanceRate}%`} tone="blue" notch />
        <StatCard icon={BookOpen} label="Subjects" value={8 + ME_STUDENT.electives.length} tone="warning" notch />
        <StatCard icon={TrendingUp} label="Term Improvement" value="+13 pts" tone="success" notch />
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, margin: 0 }}>Performance trend</h3>
            <Link to="trends" style={{ fontSize: 12.5, color: 'var(--brand-blue)', fontWeight: 600 }}>See details</Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[40, 90]} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 }} />
              <Line type="monotone" dataKey="score" stroke="var(--brand-blue-2)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Today's timetable</h3>
          {[['8:00', 'Mathematics'], ['8:40', 'English'], ['9:20', 'Biology'], ['10:20', 'Chemistry']].map(([t, s]) => (
            <div key={t} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t}</span><span style={{ fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
