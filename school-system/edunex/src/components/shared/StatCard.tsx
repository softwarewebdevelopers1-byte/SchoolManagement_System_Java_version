import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  label: string
  value: string
  change?: number
  icon: LucideIcon
  accent?: 'brand' | 'success' | 'warning' | 'danger'
}

const accentMap = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
}

export function StatCard({ label, value, change, icon: Icon, accent = 'brand' }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-600 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
          )}
          <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-ink-600 dark:text-slate-400">vs last term</span>
        </div>
      )}
    </Card>
  )
}
