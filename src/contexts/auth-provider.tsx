import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AUTH_PASSWORD, authRequired } from '../config/env'
import { AuthContext } from './auth-context'

const STORAGE_KEY = 'mvr_session'

function readSession(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<string | null>(() =>
    authRequired ? readSession() : 'dev'
  )

  const login = useCallback((password: string) => {
    if (!authRequired) return true
    if (password !== AUTH_PASSWORD) return false
    const token = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, token)
    setSession(token)
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  const isAuthenticated = !authRequired || session != null

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
