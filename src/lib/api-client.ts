import { clearAccessToken, getAccessToken, setSession } from './auth'

export type ApiErrorPayload = { code?: string; message?: string; detail?: unknown; details?: unknown; request_id?: string }

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown
  readonly requestId?: string

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message ?? (typeof payload.detail === 'string' ? payload.detail : 'No fue posible completar la solicitud.'))
    this.name = 'ApiError'
    this.status = status
    this.code = payload.code ?? 'HTTP_ERROR'
    this.details = payload.details ?? null
    this.requestId = payload.request_id
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:8000/api/v1'

const authPages = new Set(['/login', '/personal/login', '/register', '/registro', '/recuperar-contrasena'])

function handleUnauthorized(token: string | null): void {
  if (!token) return
  clearAccessToken()
  setSession(null)
  window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  const pathname = window.location.pathname
  if (authPages.has(pathname)) return
  const loginPath = pathname === '/personal' || pathname.startsWith('/personal/') || pathname === '/panel' || pathname.startsWith('/panel/')
    ? '/personal/login'
    : '/login'
  window.history.replaceState(null, '', loginPath)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  if (!response.ok) {
    let payload: ApiErrorPayload = {}
    try { payload = (await response.json()) as ApiErrorPayload } catch { /* Empty or non-JSON error response. */ }
    if (response.status === 401) handleUnauthorized(token)
    throw new ApiError(response.status, payload)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  }),
  patch: <T>(path: string, body: unknown) => request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
}
