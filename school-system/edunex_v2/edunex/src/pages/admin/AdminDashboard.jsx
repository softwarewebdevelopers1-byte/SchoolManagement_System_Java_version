import { GraduationCap, UserCog, Contact, BarChart3, CalendarClock, ClipboardCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../../components/common/StatCard';
import { STUDENTS, TEACHERS, PARENTS, CLASSES, MEAN_SCORE_TREND, AUDIT_LOGS, avatarUrl } from '../../data';

export default function AdminDashboard() {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Good to see you, Amina 👋</h1>
        <p style={{ margin: 0 }}>Here's what's happening across EduNex Model Academy today.</p>
      </div>

      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={GraduationCap} label="Total Students" value={STUDENTS.length} delta="+12 this term" tone="blue" notch />
        <StatCard icon={UserCog} label="Teaching Staff" value={TEACHERS.length} delta="+2 this term" tone="success" notch />
        <StatCard icon={Contact} label="Registered Parents" value={PARENTS.length} tone="blue" notch />
        <StatCard icon={CalendarClock} label="Active Classes" value={CLASSES.length} tone="warning" notch />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, margin: 0 }}>School mean score trend</h3>
            <Link to="analytics" style={{ fontSize: 12.5, color: 'var(--brand-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Full analytics <ArrowRight size={13} /></Link>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MEAN_SCORE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[40, 80]} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 }} />
              <Line type="monotone" dataKey="mean" stroke="var(--brand-blue-2)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Quick actions</h3>
          {[
            { to: 'students', icon: GraduationCap, label: 'Register a student' },
            { to: 'teachers', icon: UserCog, label: 'Register a teacher' },
            { to: 'timetable', icon: CalendarClock, label: 'Generate timetable' },
            { to: 'reports', icon: ClipboardCheck, label: 'Export a report' },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start', marginBottom: 10 }}>
              <a.icon size={16} /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: 15, padding: '18px 20px 0' }}>Recently added students</h3>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>Student</th><th>Class</th><th>Status</th></tr></thead>
              <tbody>
                {STUDENTS.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src={avatarUrl(s.avatarSeed)} style={{ width: 26, height: 26, borderRadius: '50%' }} alt="" />{s.name}</div></td>
                    <td>{s.className}</td>
                    <td><span className={`badge badge-${s.status === 'Active' ? 'success' : 'neutral'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}><BarChart3 size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Recent system activity</h3>
          {AUDIT_LOGS.slice(0, 5).map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 12.8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-blue-2)', marginTop: 6, flexShrink: 0 }} />
              <div><strong>{log.user}</strong> — {log.action}<div style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>{log.time}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
