import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

function strength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const labels = ['Weak', 'Fair', 'Good', 'Strong']
const colors = ['bg-red-500', 'bg-amber-500', 'bg-brand-500', 'bg-emerald-500']

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const score = strength(password)
  const match = confirm.length > 0 && confirm === password

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/login')
    }, 700)
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-slate-300">New password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600/50" />
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              placeholder="Enter new password"
            />
          </div>
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn('h-1.5 flex-1 rounded-full bg-ink-900/10 dark:bg-white/10', i < score && colors[score - 1])}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-600 dark:text-slate-400">{labels[Math.max(score - 1, 0)]}</p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-slate-300">Confirm password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600/50" />
            <Input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Re-enter new password"
            />
            {match && (
              <CheckCircle2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!match || score < 2}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  )
}
