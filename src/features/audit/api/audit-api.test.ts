import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listAudit } from './audit-api'

describe('API de auditoría', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sessionStorage.setItem('auth_token', 'audit-token')
  })

  it('consulta el listado global paginado con filtros reales', async () => {
    const page = { page: 2, page_size: 10, total: 11, total_pages: 2, items: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(page), { status: 200 }))

    await expect(listAudit({
      page: 2,
      page_size: 10,
      actor_user_id: 'actor-1',
      resource_type: 'FAQ',
      action: 'PUBLISH',
      success: false,
      search: 'saldo',
    })).resolves.toEqual(page)

    const [input, init] = fetchMock.mock.calls[0] ?? []
    expect(String(input)).toContain('/audit?')
    expect(String(input)).toContain('actor_user_id=actor-1')
    expect(String(input)).toContain('success=false')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer audit-token')
  })
})
