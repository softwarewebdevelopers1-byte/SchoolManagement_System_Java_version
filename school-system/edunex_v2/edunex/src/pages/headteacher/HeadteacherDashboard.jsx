import { TrendingUp, Award, ClipboardCheck, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart } from 'recharts';
import StatCard from '../../components/common/StatCard';
import { TEACHER_PERFORMANCE, TOP_STUDENTS, ANNOUNCEMENTS, avatarUrl } from '../../data';

export default function HeadteacherDashboard() {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Welcome back, Dr. Kamau</h1>
        <p style={{ margin: 0 }}>A school-wide snapshot for Term 2, 2026.</p>
      </div>

      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={TrendingUp} label="School Mean Score" value="68.4" delta="+2.1 pts" tone="blue" notch />
        <StatCard icon={Award} label="Results Pending Approval" value="3 classes" tone="warning" notch />
        <StatCard icon={ClipboardCheck} label="Attendance This Week" value="96.4%" delta="+1.2%" tone="success" notch />
        <StatCard icon={Users} label="Staff On Leave" value={TEACHER_PERFORMANCE.length ? 2 : 0} tone="blue" notch />
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 20px 0' }}>
            <h3 style={{ fontSize: 15, margin: 0 }}>Top 10 students this term</h3>
            <Link to="analytics" style={{ fontSize: 12.5, color: 'var(--brand-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Full analytics <ArrowRight size={13} /></Link>
          </div>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>#</th><th>Student</th><th>Class</th><th>Mean</th></tr></thead>
              <tbody>
                {TOP_STUDENTS.slice(0, 6).map((s) => (
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
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Latest announcements</h3>
          {ANNOUNCEMENTS.slice(0, 4).map((a) => (
            <div key={a.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {a.audience}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
