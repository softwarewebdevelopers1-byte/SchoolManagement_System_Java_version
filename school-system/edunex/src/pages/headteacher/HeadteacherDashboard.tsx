import { BarChart3, Users, GraduationCap, BadgeCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { StatCard } from '@/components/shared/StatCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { classes, subjectComparison } from '@/data/school'

export default function HeadteacherDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">School Overview</h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">Term 2, 2026 — all four class levels</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="School Mean Score" value="64.3%" change={2.4} icon={BarChart3} accent="brand" />
        <StatCard label="Overall Attendance" value="94.1%" change={-1.2} icon={Users} accent="warning" />
        <StatCard label="Total Enrollment" value="585" change={1.8} icon={GraduationCap} accent="success" />
        <StatCard label="Results Pending Approval" value="6" icon={BadgeCheck} accent="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Subject Comparison" description="Mean score by subject, school-wide">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-900/5 dark:text-white/5" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="mean" fill="#2F6FED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <Card>
          <CardHeader><CardTitle>Class Levels</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {classes.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-ink-900/[0.06] p-3 dark:border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium text-ink-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-ink-600 dark:text-slate-400">{c.totalStudents} students &middot; {c.classTeacher}</p>
                </div>
                <Badge variant={c.meanScore >= 62 ? 'success' : 'warning'}>{c.meanScore}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
