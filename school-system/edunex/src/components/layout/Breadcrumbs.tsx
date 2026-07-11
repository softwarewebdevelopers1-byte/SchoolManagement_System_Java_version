import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { roleLabels } from '@/constants/navigation'

function titleCase(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function Breadcrumbs() {
  const location = useLocation()
  const { user } = useAuth()
  if (!user) return null

  const parts = location.pathname.split('/').filter(Boolean)
  const rest = parts.slice(1)

  return (
    <nav className="flex items-center gap-1.5 text-sm text-ink-600 dark:text-slate-400">
      <Link to={`/${user.role}`} className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-300">
        <Home className="h-3.5 w-3.5" />
        {roleLabels[user.role]}
      </Link>
      {rest.map((part, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          <span className={i === rest.length - 1 ? 'font-medium text-ink-900 dark:text-white' : ''}>
            {titleCase(part)}
          </span>
        </span>
      ))}
    </nav>
  )
}
