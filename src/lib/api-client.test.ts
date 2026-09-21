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

  it('reintenta solo cuando se solicita explícitamente y devuelve el resultado final', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Temporal' }), { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiClient.get<{ ok: boolean }>('/health', undefined, { retries: 1, retryDelayMs: 0 })).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('normaliza los errores de red sin exponer el error nativo al usuario', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('socket details')))

    await expect(apiClient.get('/health')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR', message: 'No fue posible conectar con el servicio.' })
  })

  it('propaga una cancelación de consulta sin convertirla en error de red', async () => {
    const abortError = Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    await expect(apiClient.get('/chat/conversations/conversation-1')).rejects.toBe(abortError)
  })

  it('reconoce también la DOMException de abort del navegador', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    await expect(apiClient.get('/chat/conversations/conversation-1')).rejects.toBe(abortError)
  })

  it('envía DELETE autenticado y conserva la respuesta JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ deleted: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    sessionStorage.setItem('auth_token', 'session-token')
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiClient.delete<{ deleted: boolean }>('/attachments/attachment-1')).resolves.toEqual({ deleted: true })
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'DELETE' }))
  })

  it('envía multipart sin fijar manualmente Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'attachment-1' }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const body = new FormData()
    body.append('file', new File(['contenido'], 'consulta.txt', { type: 'text/plain' }))

    await expect(apiClient.postForm<{ id: string }>('/tickets/ticket-1/attachments', body)).resolves.toEqual({ id: 'attachment-1' })
    const headers = new Headers(fetchMock.mock.calls[0][1].headers)
    expect(headers.get('Content-Type')).toBeNull()
    expect(fetchMock.mock.calls[0][1].body).toBe(body)
  })

  it('descarga archivos como Blob sin intentar parsearlos como JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('a,b\n1,2', { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="reporte.csv"' } }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await apiClient.download('/reports/summary/export?format=csv')
    expect(response.blob.size).toBe(7)
    expect(response.contentType).toBe('text/csv')
    expect(response.contentDisposition).toContain('reporte.csv')
  })
})
