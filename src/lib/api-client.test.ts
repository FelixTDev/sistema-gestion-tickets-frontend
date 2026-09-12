import { describe, expect, it, vi } from 'vitest'
import { apiClient } from './api-client'

describe('cliente HTTP', () => {
  it('convierte errores API en ApiError tipado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'BAD_REQUEST', message: 'Solicitud inválida' }), { status: 400, headers: { 'Content-Type': 'application/json' } })))
    await expect(apiClient.get('/health')).rejects.toEqual(expect.objectContaining({ code: 'BAD_REQUEST', status: 400, message: 'Solicitud inválida' }))
  })
})
