import { apiClient } from '../../lib/api-client'
import { clearAccessToken, setAccessToken, setSession } from '../../lib/auth'
import type { AuthUser, LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse, Session } from '../../types/auth'

export const register = (payload: RegisterRequest): Promise<RegisterResponse> => apiClient.post<RegisterResponse>('/auth/register', payload)

export async function login(payload: LoginRequest): Promise<Session> {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  const session: Session = { user: response.user, accessToken: response.access_token }
  setAccessToken(response.access_token)
  setSession(session)
  return session
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const user = await apiClient.get<AuthUser>('/auth/me')
  const token = sessionStorage.getItem('auth_token')
  if (token) setSession({ user, accessToken: token })
  return user
}

export async function logout(): Promise<LogoutResponse | undefined> {
  try { return await apiClient.post<LogoutResponse>('/auth/logout', {}) } catch { return undefined } finally { clearAccessToken(); setSession(null) }
}

export function clearSession(): void { clearAccessToken(); setSession(null) }
