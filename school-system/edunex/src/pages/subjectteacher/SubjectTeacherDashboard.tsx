import { BookOpen, Sheet, TrendingUp, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { StatCard } from '@/components/shared/StatCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { termTrend } from '@/data/school'

export default function SubjectTeacherDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">Mathematics</h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">Mr. Peter Kariuki &middot; Form 3 East, Form 4 West</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Classes" value="2" icon={BookOpen} accent="brand" />
        <StatCard label="Students Taught" value="76" icon={Users} accent="success" />
        <StatCard label="Marks Entry Progress" value="82%" icon={Sheet} accent="warning" />
        <StatCard label="Subject Mean" value="58.4%" change={1.6} icon={TrendingUp} accent="brand" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Mathematics Mean Score Trend">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={termTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-900/5 dark:text-white/5" />
                <XAxis dataKey="term" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 80]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                <Line type="monotone" dataKey="mean" stroke="#2F6FED" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <Card>
          <CardHeader><CardTitle>Pending Assessments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {['CAT 2 — Form 3 East', 'Midterm — Form 4 West', 'Assignment 3 — Form 3 East'].map((a) => (
              <div key={a} className="flex items-center justify-between rounded-lg border border-ink-900/[0.06] p-3 text-sm dark:border-white/[0.06]">
                <span className="text-ink-900 dark:text-white">{a}</span>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
