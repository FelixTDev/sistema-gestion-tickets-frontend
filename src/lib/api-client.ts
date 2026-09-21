import { clearAccessToken, getAccessToken, setSession } from './auth'

export type ApiErrorPayload = { code?: string; message?: string; detail?: unknown; details?: unknown; request_id?: string }

export interface ApiRequestOptions {
  retries?: number
  retryDelayMs?: number
  signal?: AbortSignal
}

export interface DownloadResponse {
  blob: Blob
  contentType: string | null
  contentDisposition: string | null
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown
  readonly requestId?: string

  constructor(status: number, payload: ApiErrorPayload) {
    super(getErrorMessage(payload))
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

function getErrorMessage(payload: ApiErrorPayload): string {
  if (typeof payload.message === 'string') return payload.message
  if (typeof payload.detail === 'string') return payload.detail
  if (Array.isArray(payload.detail)) {
    const messages = payload.detail.flatMap((item) => {
      if (typeof item === 'string') return [item]
      if (typeof item === 'object' && item !== null && 'msg' in item && typeof item.msg === 'string') return [item.msg]
      return []
    })
    if (messages.length > 0) return messages.join(' ')
  }
  return 'No fue posible completar la solicitud.'
}

function isRetryableStatus(status: number): boolean {
  return status >= 500 && status <= 599
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
}

function waitForRetry(delayMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, delayMs)))
}

async function readErrorPayload(response: Response): Promise<ApiErrorPayload> {
  try { return (await response.json()) as ApiErrorPayload } catch { return {} }
}

function createNetworkError(): ApiError {
  return new ApiError(0, { code: 'NETWORK_ERROR', message: 'No fue posible conectar con el servicio.' })
}

async function request<T>(path: string, init: RequestInit = {}, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  const isFormDataBody = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (init.body && !isFormDataBody && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const retries = Math.max(0, Math.floor(options.retries ?? 0))
  const retryDelayMs = options.retryDelayMs ?? 150
  let attempt = 0

  while (true) {
    let response: Response
    try {
      response = await fetch(`${baseUrl}${path}`, { ...init, signal: options.signal ?? init.signal, headers })
    } catch (error: unknown) {
      if (isAbortError(error)) throw error
      if (attempt < retries) {
        attempt += 1
        await waitForRetry(retryDelayMs * attempt)
        continue
      }
      throw createNetworkError()
    }
    if (response.ok) {
      if (response.status === 204) return undefined as T
      const text = await response.text()
      return text ? (JSON.parse(text) as T) : undefined as T
    }
    if (isRetryableStatus(response.status) && attempt < retries) {
      attempt += 1
      await waitForRetry(retryDelayMs * attempt)
      continue
    }
    const payload = await readErrorPayload(response)
    if (response.status === 401) handleUnauthorized(token)
    throw new ApiError(response.status, payload)
  }
}

async function download(path: string, init: RequestInit = {}): Promise<DownloadResponse> {
  const headers = new Headers(init.headers)
  if (!headers.has('Accept')) headers.set('Accept', '*/*')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try { response = await fetch(`${baseUrl}${path}`, { ...init, headers }) } catch (error: unknown) {
    if (isAbortError(error)) throw error
    throw createNetworkError()
  }
  if (!response.ok) {
    const payload = await readErrorPayload(response)
    if (response.status === 401) handleUnauthorized(token)
    throw new ApiError(response.status, payload)
  }
  return {
    blob: await response.blob(),
    contentType: response.headers.get('Content-Type'),
    contentDisposition: response.headers.get('Content-Disposition'),
  }
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit, options?: ApiRequestOptions) => request<T>(path, init, options),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  }, options),
  postForm: <T>(path: string, body: FormData, options?: ApiRequestOptions) => request<T>(path, { method: 'POST', body }, options),
  patch: <T>(path: string, body: unknown, options?: ApiRequestOptions) => request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }, options),
  delete: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { method: 'DELETE' }, options),
  download,
}
