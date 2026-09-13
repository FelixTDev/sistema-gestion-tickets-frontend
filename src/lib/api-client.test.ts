import { describe, expect, it, vi } from 'vitest'
import { apiClient } from './api-client'

describe('cliente HTTP', () => {
  it('convierte errores API en ApiError tipado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'BAD_REQUEST', message: 'Solicitud inválida' }), { status: 400, headers: { 'Content-Type': 'application/json' } })))
    await expect(apiClient.get('/health')).rejects.toEqual(expect.objectContaining({ code: 'BAD_REQUEST', status: 400, message: 'Solicitud inválida' }))
  })

  it('usa detail textual de los errores FastAPI', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Ticket no autorizado' }), { status: 403, headers: { 'Content-Type': 'application/json' } })))

    await expect(apiClient.get('/tickets/ticket-1')).rejects.toEqual(expect.objectContaining({ status: 403, message: 'Ticket no autorizado' }))
  })
})
