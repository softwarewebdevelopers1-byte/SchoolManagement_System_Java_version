import { useState } from 'react'
import { Menu, Search, Bell, Sun, Moon, LogOut, Settings, ChevronDown } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { notifications as demoNotifications } from '@/data/school'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(demoNotifications.filter((n) => !n.read).length)

  if (!user) return null

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-900/[0.06] px-4 dark:border-white/[0.06] sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-900/5 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600/50 dark:text-slate-500" />
        <input
          placeholder="Search students, teachers, classes..."
          className="h-10 w-full rounded-lg border border-ink-900/10 bg-ink-900/[0.02] pl-9 pr-3 text-sm outline-none placeholder:text-ink-600/50 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-ink-800"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-900/5 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>

        <Popover.Root onOpenChange={(open) => open && setUnread(0)}>
          <Popover.Trigger asChild>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-900/5 dark:text-slate-300 dark:hover:bg-white/10">
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-ink-950" />
              )}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={10}
              className="z-50 w-80 rounded-xl border border-ink-900/[0.06] bg-white p-2 shadow-[var(--shadow-panel-lg)] dark:border-white/[0.06] dark:bg-ink-900"
            >
              <div className="flex items-center justify-between px-2.5 py-2">
                <p className="font-display text-sm font-semibold text-ink-900 dark:text-white">Notifications</p>
                <Badge variant="default">{demoNotifications.length} total</Badge>
              </div>
              <div className="no-scrollbar max-h-80 space-y-1 overflow-y-auto">
                {demoNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 rounded-lg px-2.5 py-2.5 hover:bg-ink-900/[0.03] dark:hover:bg-white/5"
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        n.type === 'success' && 'bg-emerald-500',
                        n.type === 'warning' && 'bg-amber-500',
                        n.type === 'danger' && 'bg-red-500',
                        n.type === 'info' && 'bg-brand-500'
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 dark:text-white">{n.title}</p>
                      <p className="truncate text-xs text-ink-600 dark:text-slate-400">{n.message}</p>
                      <p className="mt-0.5 text-[11px] text-ink-600/60 dark:text-slate-500">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-ink-900/5 dark:hover:bg-white/10">
              <Avatar name={user.name} size={34} />
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-medium text-ink-900 dark:text-white">{user.name}</p>
                <p className="text-[11px] text-ink-600 dark:text-slate-400">{user.title}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-ink-600 sm:block dark:text-slate-400" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={10}
              className="z-50 w-56 rounded-xl border border-ink-900/[0.06] bg-white p-1.5 shadow-[var(--shadow-panel-lg)] dark:border-white/[0.06] dark:bg-ink-900"
            >
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium text-ink-900 dark:text-white">{user.name}</p>
                <p className="truncate text-xs text-ink-600 dark:text-slate-400">{user.email}</p>
              </div>
              <div className="my-1 h-px bg-ink-900/[0.06] dark:bg-white/[0.06]" />
              <button
                onClick={() => navigate(`/${user.role}/settings`)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-ink-900/5 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </header>
  )
}
