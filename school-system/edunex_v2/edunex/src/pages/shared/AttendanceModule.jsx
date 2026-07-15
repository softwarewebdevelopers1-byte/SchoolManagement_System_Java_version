import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { ClipboardCheck } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import { STUDENTS, TEACHERS, CLASSES, attendanceTrend, avatarUrl } from '../../data';

function DailyTab({ classId }) {
  const roster = STUDENTS.filter((s) => !classId || s.classId === classId).slice(0, 40);
  const [marks, setMarks] = useState(() => Object.fromEntries(roster.map((s) => [s.id, s.attendanceRate > 90 ? 'present' : 'absent'])));
  const cycle = (id) => setMarks((m) => ({ ...m, [id]: m[id] === 'present' ? 'late' : m[id] === 'late' ? 'absent' : 'present' }));
  const colors = { present: 'success', late: 'warning', absent: 'danger' };

  return (
    <DataTable
      title="Today's register"
      data={roster}
      searchKeys={['name', 'admissionNo']}
      columns={[
        { key: 'name', label: 'Student', render: (r) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={avatarUrl(r.avatarSeed)} style={{ width: 28, height: 28, borderRadius: '50%' }} alt="" />
            <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.admissionNo}</div></div>
          </div>
        ) },
        { key: 'className', label: 'Class' },
        { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${colors[marks[r.id]]}`} style={{ textTransform: 'capitalize' }}>{marks[r.id]}</span> },
      ]}
      rowActions={(r) => <button className="btn btn-secondary btn-sm" onClick={() => cycle(r.id)}>Toggle</button>}
      pageSize={8}
    />
  );
}

function MonthlyTab() {
  const data = attendanceTrend(20);
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>Attendance — last 20 school days</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-blue-2)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--brand-blue-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 }} />
          <Area type="monotone" dataKey="present" stroke="var(--brand-blue-2)" fill="url(#attGrad)" strokeWidth={2} name="Present %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StudentAttendanceTab() {
  return (
    <DataTable
      title="Attendance by student"
      data={STUDENTS.slice(0, 60)}
      searchKeys={['name', 'admissionNo']}
      filters={[{ key: 'className', options: [...new Set(CLASSES.map((c) => c.name))] }]}
      columns={[
        { key: 'name', label: 'Student' },
        { key: 'className', label: 'Class' },
        { key: 'attendanceRate', label: 'Attendance', render: (r) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 70, height: 6, borderRadius: 4, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
              <div style={{ width: `${r.attendanceRate}%`, height: '100%', background: r.attendanceRate > 90 ? 'var(--success)' : 'var(--warning)' }} />
            </div>
            <span style={{ fontSize: 12.5 }}>{r.attendanceRate}%</span>
          </div>
        ) },
      ]}
    />
  );
}

function TeacherAttendanceTab() {
  return (
    <DataTable
      title="Staff attendance"
      data={TEACHERS}
      searchKeys={['name', 'department']}
      columns={[
        { key: 'name', label: 'Teacher' },
        { key: 'department', label: 'Department' },
        { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status === 'Active' ? 'success' : 'warning'}`}>{r.status === 'Active' ? 'Present' : 'On Leave'}</span> },
      ]}
    />
  );
}

function AnalyticsTab() {
  const data = attendanceTrend(10).map((d) => ({ ...d, absent: 100 - d.present }));
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>Present vs absent (10 days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="present" fill="var(--brand-blue-2)" radius={[6, 6, 0, 0]} name="Present %" />
          <Bar dataKey="late" fill="var(--warning)" radius={[6, 6, 0, 0]} name="Late" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AttendanceModule({ scope = 'admin', classId }) {
  const tabsByScope = {
    admin: [
      { key: 'daily', label: 'Daily Attendance', content: <DailyTab /> },
      { key: 'monthly', label: 'Monthly Attendance', content: <MonthlyTab /> },
      { key: 'student', label: 'Student Attendance', content: <StudentAttendanceTab /> },
      { key: 'teacher', label: 'Teacher Attendance', content: <TeacherAttendanceTab /> },
      { key: 'analytics', label: 'Attendance Analytics', content: <AnalyticsTab /> },
    ],
    class: [
      { key: 'daily', label: 'Daily Attendance', content: <DailyTab classId={classId} /> },
      { key: 'monthly', label: 'Monthly Trend', content: <MonthlyTab /> },
      { key: 'student', label: 'By Student', content: <StudentAttendanceTab /> },
    ],
    overview: [
      { key: 'monthly', label: 'Trend', content: <MonthlyTab /> },
      { key: 'analytics', label: 'Analytics', content: <AnalyticsTab /> },
    ],
  };

  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 22 }}>
        <StatCard icon={ClipboardCheck} label="Today's Attendance" value="96.4%" delta="+1.2%" tone="success" />
        <StatCard icon={ClipboardCheck} label="Absentees Today" value="14" delta="-3" deltaDirection="down" tone="warning" />
        <StatCard icon={ClipboardCheck} label="Chronic Absence" value="6 students" tone="danger" />
        <StatCard icon={ClipboardCheck} label="Avg. Monthly Rate" value="94.1%" delta="+0.8%" tone="blue" />
      </div>
      <Tabs tabs={tabsByScope[scope] || tabsByScope.admin} />
    </div>
  );
}
