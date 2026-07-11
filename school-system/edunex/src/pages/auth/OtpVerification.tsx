import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'

export default function OtpVerification() {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(28)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()

  const handleChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[idx] = value.slice(-1)
    setDigits(next)
    if (value && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
  }

  const handleVerify = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/reset-password')
    }, 700)
  }

  useState(() => {
    const t = setInterval(() => setResendTimer((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  })

  const complete = digits.every((d) => d !== '')

  return (
    <AuthLayout title="Verify your identity" subtitle="Enter the 6-digit code we sent to your email.">
      <div className="flex justify-between gap-2">
        {digits.map((d, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el
            }}
            value={d}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            maxLength={1}
            inputMode="numeric"
            className="h-14 w-12 rounded-lg border border-ink-900/15 bg-white text-center font-display text-xl font-semibold text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-ink-800 dark:text-white"
          />
        ))}
      </div>

      <Button className="mt-6 w-full" size="lg" disabled={!complete} loading={loading} onClick={handleVerify}>
        Verify code
      </Button>

      <p className="mt-5 text-center text-sm text-ink-600 dark:text-slate-400">
        {resendTimer > 0 ? (
          <>Resend code in <span className="font-medium text-ink-900 dark:text-white">{resendTimer}s</span></>
        ) : (
          <button onClick={() => setResendTimer(28)} className="font-medium text-brand-600 hover:underline dark:text-brand-300">
            Resend code
          </button>
        )}
      </p>

      <Link
        to="/login"
        className="mt-4 block text-center text-sm font-medium text-ink-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-300"
      >
        Back to sign in
      </Link>
    </AuthLayout>
  )
}
