import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ChevronsLeft, GraduationCap } from 'lucide-react'
import { navByRole } from '@/constants/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'
import logo from '@/assets/logo.png'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth()
  if (!user) return null
  const sections = navByRole[user.role]

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ink-900/[0.06] bg-white transition-all duration-200 dark:border-white/[0.06] dark:bg-ink-950',
          collapsed ? 'w-[76px]' : 'w-[264px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-ink-900/[0.06] px-4 dark:border-white/[0.06]">
          <img src={logo} alt="EduNex" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold text-ink-900 dark:text-white">EduNex</span>
              <span className="text-[10px] font-medium tracking-wide text-ink-600 dark:text-slate-400">
                SMARTER SCHOOLS
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-ink-600 hover:bg-ink-900/5 lg:flex dark:text-slate-400 dark:hover:bg-white/10"
          >
            <ChevronsLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.label && !collapsed && (
                <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-600/60 dark:text-slate-500">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon] ?? GraduationCap
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === `/${user.role}`}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                            : 'text-ink-700 hover:bg-ink-900/5 dark:text-slate-300 dark:hover:bg-white/5'
                        )
                      }
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
