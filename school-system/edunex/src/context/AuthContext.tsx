import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser, Role } from '@/types'
import { roleLabels } from '@/constants/navigation'

interface AuthContextValue {
  user: AuthUser | null
  login: (role: Role, email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const demoNames: Record<Role, string> = {
  admin: 'Carlos Maina',
  headteacher: 'Dr. Naomi Wachira',
  classteacher: 'Mr. Peter Kariuki',
  subjectteacher: 'Mrs. Alice Nduta',
  student: 'Faith Wanjiru',
  parent: 'Mr. Daniel Wanjiru',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = (role: Role, email: string) => {
    setUser({
      id: `user-${role}`,
      name: demoNames[role],
      email,
      role,
      title: roleLabels[role],
    })
  }

  const logout = () => setUser(null)

  const value = useMemo(() => ({ user, login, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
