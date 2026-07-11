import {
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  ArrowRight,
  Megaphone,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/shared/StatCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { students } from '@/data/students'
import { teachers, classes, announcements, termTrend, gradeDistribution, weeklyAttendance } from '@/data/school'

const pieColors = ['#2F6FED', '#22D3EE', '#5A8BFF', '#8BB2FF', '#1F56CF']

export default function AdminDashboard() {
  const activeStudents = students.filter((s) => s.status === 'Active').length
  const topStudents = [...students].sort((a, b) => b.meanScore - a.meanScore).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">
            Welcome back, Carlos 👋
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">
            Here's what's happening across EduNex today.
          </p>
        </div>
        <Button>Generate Report</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={students.length.toString()} change={4.2} icon={GraduationCap} accent="brand" />
        <StatCard label="Active Teachers" value={teachers.length.toString()} change={1.1} icon={Users} accent="success" />
        <StatCard label="Subjects Offered" value="10" change={0} icon={BookOpen} accent="warning" />
        <StatCard label="Classes & Streams" value={`${classes.length} / 16`} change={-0.5} icon={Building2} accent="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Mean Score Trend" description="School-wide performance across recent terms">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={termTrend}>
                <defs>
                  <linearGradient id="meanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F6FED" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2F6FED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-900/5 dark:text-white/5" vertical={false} />
                <XAxis dataKey="term" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 80]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid rgba(15,26,46,0.08)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="mean" stroke="#2F6FED" strokeWidth={2.5} fill="url(#meanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Grade Distribution" description="Latest term, all classes">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={gradeDistribution.slice(0, 5)}
                dataKey="count"
                nameKey="grade"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {gradeDistribution.slice(0, 5).map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {gradeDistribution.slice(0, 5).map((g, i) => (
              <div key={g.grade} className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: pieColors[i] }} />
                Grade {g.grade}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Weekly Attendance" description="Present vs absent across the school, this week">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-900/5 dark:text-white/5" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="present" fill="#2F6FED" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="#DBE7FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <Link to="/admin/reports" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="flex gap-3 rounded-lg border border-ink-900/[0.06] p-3 dark:border-white/[0.06]">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-600 dark:text-slate-400">{a.body}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant={a.priority === 'High' ? 'danger' : a.priority === 'Normal' ? 'default' : 'neutral'}>
                      {a.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Students</CardTitle>
          <Link
            to="/admin/students"
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            View all students <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-ink-900/[0.06] dark:divide-white/[0.06]">
            {topStudents.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-5 text-center font-display text-sm font-semibold text-ink-600/50 dark:text-slate-500">
                  {idx + 1}
                </span>
                <Avatar name={s.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-ink-600 dark:text-slate-400">
                    {s.className} {s.stream} &middot; {s.admissionNo}
                  </p>
                </div>
                <Badge variant="success">{s.meanScore.toFixed(1)}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-ink-600/60 dark:text-slate-500">
        {activeStudents} active students across {classes.length} class levels
      </p>
    </div>
  )
}
