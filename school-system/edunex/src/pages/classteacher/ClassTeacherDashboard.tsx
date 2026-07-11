import { Users, CalendarCheck, Trophy, ShieldAlert } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { students } from '@/data/students'

export default function ClassTeacherDashboard() {
  const myStudents = students.filter((s) => s.className === 'Form 3' && s.stream === 'East')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">Form 3 East</h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">Your class at a glance — Term 2, 2026</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Class Size" value={myStudents.length.toString() || '38'} icon={Users} accent="brand" />
        <StatCard label="Attendance Today" value="36/38" icon={CalendarCheck} accent="success" />
        <StatCard label="Class Rank" value="#2 of 16" icon={Trophy} accent="warning" />
        <StatCard label="Open Discipline Cases" value="1" icon={ShieldAlert} accent="danger" />
      </div>

      <Card>
        <CardHeader><CardTitle>My Students</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(myStudents.length ? myStudents : students.slice(0, 6)).map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-ink-900/[0.06] p-3 dark:border-white/[0.06]">
              <Avatar name={s.name} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-ink-600 dark:text-slate-400">{s.admissionNo}</p>
              </div>
              <Badge variant="default">{s.meanScore.toFixed(1)}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
