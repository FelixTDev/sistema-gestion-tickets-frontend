import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getAccessToken, getSession, setSession } from '../../lib/auth'
import { ApiError } from '../../lib/api-client'
import type { AuthUser, Session } from '../../types/auth'
import { clearSession, fetchCurrentUser, login, logout } from './auth-service'

type AuthContextValue = { session: Session | null; user: AuthUser | null; isLoading: boolean; signIn: typeof login; signOut: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setAuthSession] = useState<Session | null>(getSession)
  const [isLoading, setIsLoading] = useState(Boolean(getAccessToken()))
  useEffect(() => {
    const token = getAccessToken()
    if (!token) { setIsLoading(false); return }
    fetchCurrentUser().then((user) => { const restored: Session = { user, accessToken: token }; setSession(restored); setAuthSession(restored) }).catch((error: unknown) => { if (error instanceof ApiError && error.status === 401) clearSession(); else setSession(null); setAuthSession(null) }).finally(() => setIsLoading(false))
  }, [])
  const value = useMemo<AuthContextValue>(() => ({ session, user: session?.user ?? null, isLoading, signIn: async (payload) => { const next = await login(payload); setAuthSession(next); return next }, signOut: async () => { await logout(); setAuthSession(null) } }), [isLoading, session])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue { const context = useContext(AuthContext); if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider'); return context }
