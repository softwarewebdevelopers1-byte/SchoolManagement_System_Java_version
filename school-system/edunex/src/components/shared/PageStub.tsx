import { Construction } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function PageStub({ title }: { title: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
        <Construction className="h-7 w-7" />
      </div>
      <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{title}</h2>
      <p className="max-w-sm text-sm text-ink-600 dark:text-slate-400">
        This page is part of the next build phase. The layout, navigation and data are already
        wired up — the detailed UI for this section is coming next.
      </p>
    </Card>
  )
}
