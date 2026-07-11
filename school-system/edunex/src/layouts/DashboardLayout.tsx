import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

export function DashboardLayout() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-[var(--color-surface)] dark:bg-ink-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={cn('transition-all duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]')}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <div className="border-b border-ink-900/[0.06] px-4 py-3 sm:px-6 dark:border-white/[0.06]">
          <Breadcrumbs />
        </div>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="p-4 sm:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
