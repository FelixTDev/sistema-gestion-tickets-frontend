import type { Role, Session } from '../types/auth'

const demoSession: Session = { userId: 'demo', fullName: 'Sesión demo', role: 'CLIENTE' }
export const getSession = (): Session | null => null
export const hasRole = (session: Session | null, roles: Role[]): boolean => session !== null && roles.includes(session.role)
export { demoSession }
