import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, ShieldCheck, BarChart3, CalendarClock } from 'lucide-react'
import logo from '@/assets/logo.png'

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #2F6FED 0%, transparent 45%), radial-gradient(circle at 80% 70%, #22D3EE 0%, transparent 45%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="EduNex" className="h-10 w-10 rounded-xl object-contain" />
          <div className="leading-none">
            <p className="font-display text-xl font-bold text-white">EduNex</p>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">SMARTER SCHOOLS, BETTER FUTURES</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 max-w-md"
        >
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
            <GraduationCap className="h-8 w-8 text-cyan-glow" />
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            One platform for every corner of the school.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
            Administrators, teachers, students and parents — all connected through a single,
            secure system built for how modern schools actually run.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, text: 'Role-based access for every stakeholder' },
              { icon: BarChart3, text: 'Real-time performance analytics' },
              { icon: CalendarClock, text: 'Conflict-free timetable generation' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-brand-300" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-slate-500">© {new Date().getFullYear()} EduNex. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={logo} alt="EduNex" className="h-9 w-9 rounded-lg object-contain" />
            <span className="font-display text-lg font-bold text-ink-900 dark:text-white">EduNex</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-slate-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
