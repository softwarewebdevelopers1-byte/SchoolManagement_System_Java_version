import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from 'recharts';
import { TrendingUp, Award, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Tabs from '../../components/common/Tabs';
import { MEAN_SCORE_TREND, SUBJECT_MEANS, GRADE_DISTRIBUTION, TOP_STUDENTS, TEACHER_PERFORMANCE, avatarUrl } from '../../data';

const PIE_COLORS = ['#16A34A', '#22C55E', '#4ADE80', '#17a673', '#d98c1f', '#e0445c', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899'];

function ChartCard({ title, children, height = 280 }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
    </div>
  );
}
const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 };
const axisTick = { fontSize: 11, fill: 'var(--text-muted)' };

function SchoolPerformanceTab() {
  return (
    <div className="grid-2">
      <ChartCard title="Mean score trend">
        <LineChart data={MEAN_SCORE_TREND}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" tick={axisTick} /><YAxis tick={axisTick} domain={[40, 80]} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="mean" stroke="var(--brand-blue-2)" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ChartCard>
      <ChartCard title="Grade distribution">
        <PieChart>
          <Pie data={GRADE_DISTRIBUTION} dataKey="count" nameKey="grade" innerRadius={55} outerRadius={95} paddingAngle={2}>
            {GRADE_DISTRIBUTION.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ChartCard>
    </div>
  );
}

function SubjectComparisonTab() {
  return (
    <div className="grid-2">
      <ChartCard title="Subject mean scores">
        <BarChart data={SUBJECT_MEANS}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="subject" tick={axisTick} /><YAxis tick={axisTick} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="mean" radius={[6, 6, 0, 0]} fill="var(--brand-blue-2)" />
        </BarChart>
      </ChartCard>
      <ChartCard title="Subject comparison (radar)">
        <RadarChart data={SUBJECT_MEANS} outerRadius={95}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="subject" tick={axisTick} />
          <Radar dataKey="mean" stroke="var(--brand-cyan)" fill="var(--brand-cyan)" fillOpacity={0.35} />
          <Tooltip contentStyle={tooltipStyle} />
        </RadarChart>
      </ChartCard>
    </div>
  );
}

function TopStudentsTab() {
  const weak = [...SUBJECT_MEANS].sort((a, b) => a.mean - b.mean).slice(0, 4);
  return (
    <div className="grid-2">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <h3 style={{ fontSize: 15, padding: '18px 20px 0' }}>Top 10 students</h3>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead><tr><th>#</th><th>Student</th><th>Class</th><th>Mean</th></tr></thead>
            <tbody>
              {TOP_STUDENTS.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-info">{s.position}</span></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src={avatarUrl(s.avatarSeed)} style={{ width: 24, height: 24, borderRadius: '50%' }} alt="" />{s.name}</div></td>
                  <td>{s.className}</td>
                  <td style={{ fontWeight: 700 }}>{s.meanScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} color="var(--warning)" /> Weakest subjects</h3>
        {weak.map((s) => (
          <div key={s.subject} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>{s.subject}</span><span style={{ fontWeight: 700 }}>{s.mean}</span></div>
            <div style={{ height: 6, borderRadius: 4, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
              <div style={{ width: `${s.mean}%`, height: '100%', background: 'var(--warning)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherPerformanceTab() {
  return (
    <ChartCard title="Teacher performance — class mean score" height={340}>
      <BarChart data={TEACHER_PERFORMANCE} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" tick={axisTick} /><YAxis type="category" dataKey="name" tick={axisTick} width={90} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="meanScore" radius={[0, 6, 6, 0]} fill="var(--brand-cyan)" />
      </BarChart>
    </ChartCard>
  );
}

export default function AnalyticsModule({ scope = 'school' }) {
  const tabs = [
    { key: 'school', label: 'School Performance', content: <SchoolPerformanceTab /> },
    { key: 'subject', label: 'Subject Comparison', content: <SubjectComparisonTab /> },
    { key: 'students', label: 'Top Students & Weak Subjects', content: <TopStudentsTab /> },
    { key: 'teachers', label: 'Teacher Performance', content: <TeacherPerformanceTab /> },
  ];
  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 22 }}>
        <StatCard icon={TrendingUp} label="School Mean Score" value="68.4" delta="+2.1 pts" tone="blue" />
        <StatCard icon={Award} label="A Grades This Term" value="42" delta="+6" tone="success" />
        <StatCard icon={AlertTriangle} label="Subjects Below Mean" value="4" tone="warning" />
        <StatCard icon={TrendingUp} label="Improved Classes" value="9 of 16" tone="success" />
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
