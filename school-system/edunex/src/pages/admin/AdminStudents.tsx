import { useMemo, useState } from 'react'
import { Search, Plus, Download, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { students } from '@/data/students'
import type { Student } from '@/types'

const statusVariant: Record<Student['status'], 'success' | 'warning' | 'neutral' | 'danger'> = {
  Active: 'success',
  Transferred: 'warning',
  Graduated: 'neutral',
  Suspended: 'danger',
}

const PAGE_SIZE = 8

export default function AdminStudents() {
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [page, setPage] = useState(0)

  const classOptions = ['All', ...Array.from(new Set(students.map((s) => s.className)))]

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(query.toLowerCase())
      const matchesClass = classFilter === 'All' || s.className === classFilter
      return matchesQuery && matchesClass
    })
  }, [query, classFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">Manage Students</h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-slate-400">
            {students.length} students enrolled across {classOptions.length - 1} class levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="md">
            <Plus className="h-4 w-4" /> Register Student
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600/50" />
            <Input
              placeholder="Search by name or admission number..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(0)
              }}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-ink-600 dark:text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value)
                setPage(0)
              }}
              className="h-11 rounded-lg border border-ink-900/15 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500 dark:border-white/15 dark:bg-ink-800 dark:text-white"
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/[0.06] bg-ink-900/[0.015] text-left text-xs font-semibold uppercase tracking-wide text-ink-600 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Admission No.</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Guardian</th>
                <th className="px-5 py-3">Mean Score</th>
                <th className="px-5 py-3">Attendance</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.06] dark:divide-white/[0.06]">
              {paged.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-ink-900/[0.015] dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={32} />
                      <div>
                        <p className="font-medium text-ink-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-ink-600 dark:text-slate-400">{s.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-700 dark:text-slate-300">{s.admissionNo}</td>
                  <td className="px-5 py-3 text-ink-700 dark:text-slate-300">{s.className} {s.stream}</td>
                  <td className="px-5 py-3 text-ink-700 dark:text-slate-300">{s.guardian}</td>
                  <td className="px-5 py-3 font-medium text-ink-900 dark:text-white">{s.meanScore.toFixed(1)}%</td>
                  <td className="px-5 py-3 text-ink-700 dark:text-slate-300">{s.attendance}%</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-ink-600 dark:text-slate-400">
                    No students match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-ink-900/[0.06] px-5 py-3 dark:border-white/[0.06]">
          <p className="text-xs text-ink-600 dark:text-slate-400">
            Showing {paged.length ? page * PAGE_SIZE + 1 : 0}–{page * PAGE_SIZE + paged.length} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs font-medium text-ink-700 dark:text-slate-300">
              {page + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
