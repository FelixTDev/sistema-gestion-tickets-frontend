import type { Role, Session } from '../types/auth'

export const AUTH_TOKEN_KEY = 'auth_token'
export const getAccessToken = (): string | null => sessionStorage.getItem(AUTH_TOKEN_KEY)
export const setAccessToken = (token: string): void => sessionStorage.setItem(AUTH_TOKEN_KEY, token)
export const clearAccessToken = (): void => sessionStorage.removeItem(AUTH_TOKEN_KEY)
let currentSession: Session | null = null
export const getSession = (): Session | null => currentSession
export const setSession = (session: Session | null): void => { currentSession = session }
export const hasRole = (session: Session | null, roles: Role[]): boolean => session !== null && roles.includes(session.user.role)
