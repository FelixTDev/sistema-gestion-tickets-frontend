import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './api-client'

describe('cliente HTTP', () => {
  afterEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('convierte errores API en ApiError tipado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'BAD_REQUEST', message: 'Solicitud inválida' }), { status: 400, headers: { 'Content-Type': 'application/json' } })))
    await expect(apiClient.get('/health')).rejects.toEqual(expect.objectContaining({ code: 'BAD_REQUEST', status: 400, message: 'Solicitud inválida' }))
  })

  it('usa detail textual de los errores FastAPI', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Ticket no autorizado' }), { status: 403, headers: { 'Content-Type': 'application/json' } })))

    await expect(apiClient.get('/tickets/ticket-1')).rejects.toEqual(expect.objectContaining({ status: 403, message: 'Ticket no autorizado' }))
  })

  it('envía PATCH JSON autenticado con el token efímero de la sesión', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify({ updated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    const localStorageWrite = vi.spyOn(Storage.prototype, 'setItem')
    sessionStorage.setItem('auth_token', 'session-token')
    localStorageWrite.mockClear()
    vi.stubGlobal('fetch', fetchSpy)

    await apiClient.patch<{ updated: boolean }>('/faqs/faq-1', { question: 'Pregunta actualizada' })

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(init.headers)
    expect(url).toBe('http://localhost:8000/api/v1/faqs/faq-1')
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe(JSON.stringify({ question: 'Pregunta actualizada' }))
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer session-token')
    expect(localStorageWrite).not.toHaveBeenCalled()
  })

  it('limpia la sesión y navega al login de personal ante un 401 autenticado', async () => {
    sessionStorage.setItem('auth_token', 'expired-token')
    window.history.replaceState(null, '', '/personal/tickets')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }))
    const popstate = vi.spyOn(window, 'dispatchEvent')

    await expect(apiClient.get('/tickets')).rejects.toMatchObject({ status: 401 })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem('auth_token')).toBeNull()
    expect(window.location.pathname).toBe('/personal/login')
    expect(popstate).toHaveBeenCalled()
  })

  it('no redirige al login cuando un login público responde 401', async () => {
    sessionStorage.setItem('auth_token', 'stale-token')
    window.history.replaceState(null, '', '/login')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }))

    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({ status: 401 })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(window.location.pathname).toBe('/login')
  })
})
