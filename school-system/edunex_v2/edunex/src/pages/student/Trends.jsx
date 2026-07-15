import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SUBJECTS } from '../../data';

const TERM_TREND = ['Term 3 2025', 'Term 1 2026', 'Term 2 2026'].map((t, i) => ({ term: t, mean: 58 + i * 6 }));
const SUBJECT_SCORES = SUBJECTS.slice(0, 8).map((s, i) => ({ subject: s.code, score: 45 + ((i * 37) % 45) }));

const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 };

export default function Trends() {
  return (
    <div className="grid-2">
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Mean score across terms</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={TERM_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="term" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[40, 90]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="mean" stroke="var(--brand-blue-2)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Scores by subject (End Term)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={SUBJECT_SCORES}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="var(--brand-cyan)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
