import { Users, CalendarCheck, Wallet, MessagesSquare } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

const children = [
  { name: 'Faith Wanjiru', className: 'Form 2 North', meanScore: 73.2, attendance: 96 },
  { name: 'Josiah Wanjiru', className: 'Form 4 South', meanScore: 68.5, attendance: 91 },
]

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white sm:text-2xl">Welcome, Mr. Wanjiru</h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">Overview for your children this term</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Children Enrolled" value="2" icon={Users} accent="brand" />
        <StatCard label="Average Attendance" value="93.5%" icon={CalendarCheck} accent="success" />
        <StatCard label="Fee Balance" value="KES 12,000" icon={Wallet} accent="warning" />
        <StatCard label="Unread Messages" value="3" icon={MessagesSquare} accent="danger" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children.map((c) => (
          <Card key={c.name}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar name={c.name} size={40} />
                <div>
                  <CardTitle>{c.name}</CardTitle>
                  <p className="text-xs text-ink-600 dark:text-slate-400">{c.className}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div>
                <p className="text-xs text-ink-600 dark:text-slate-400">Mean Score</p>
                <p className="font-display text-xl font-semibold text-ink-900 dark:text-white">{c.meanScore}%</p>
              </div>
              <div>
                <p className="text-xs text-ink-600 dark:text-slate-400">Attendance</p>
                <p className="font-display text-xl font-semibold text-ink-900 dark:text-white">{c.attendance}%</p>
              </div>
              <Badge variant="success" className="ml-auto">On Track</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
