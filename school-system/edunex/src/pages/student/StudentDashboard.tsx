import { Trophy, CalendarCheck, BookOpen, Wallet } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { StatCard } from '@/components/shared/StatCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const subjectScores = [
  { subject: 'MTH', score: 72 },
  { subject: 'ENG', score: 81 },
  { subject: 'KIS', score: 75 },
  { subject: 'PHY', score: 64 },
  { subject: 'CHM', score: 69 },
  { subject: 'BIO', score: 78 },
]

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">Hi Faith 👋</h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">Form 2 North &middot; Admission No. EDX/2024/1003</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall Mean" value="73.2%" change={3.1} icon={Trophy} accent="brand" />
        <StatCard label="Class Rank" value="#4 of 39" icon={Trophy} accent="success" />
        <StatCard label="Attendance" value="96%" icon={CalendarCheck} accent="warning" />
        <StatCard label="Fee Balance" value="KES 0" icon={Wallet} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Subject Performance" description="Your scores across enrolled subjects">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={subjectScores}>
                <PolarGrid className="text-ink-900/10 dark:text-white/10" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar dataKey="score" stroke="#2F6FED" fill="#2F6FED" fillOpacity={0.35} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <Card>
          <CardHeader><CardTitle>Today's Timetable</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { time: '8:00', subject: 'Mathematics' },
              { time: '9:00', subject: 'English' },
              { time: '10:20', subject: 'Chemistry' },
              { time: '11:20', subject: 'Biology' },
            ].map((t) => (
              <div key={t.time} className="flex items-center gap-3 rounded-lg border border-ink-900/[0.06] p-3 dark:border-white/[0.06]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900 dark:text-white">{t.subject}</p>
                  <p className="text-xs text-ink-600 dark:text-slate-400">{t.time} AM</p>
                </div>
                <Badge variant="neutral" className="ml-auto">Room 4</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
