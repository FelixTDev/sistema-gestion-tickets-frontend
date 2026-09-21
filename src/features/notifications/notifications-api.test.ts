import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listNotifications, markAllNotificationsRead, markNotificationRead, unreadNotificationCount } from './api/notification-api'

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

describe('API de notificaciones', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('lista con paginación y ejecuta lectura individual y total', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse({ items: [], page: 2, page_size: 20, total: 0, total_pages: 0 })))

    await listNotifications({ page: 2, page_size: 20 })
    await unreadNotificationCount()
    await markNotificationRead('notification-1')
    await markAllNotificationsRead()

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/notifications\?page=2&page_size=20$/)
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/notifications\/unread-count$/)
    expect(String(fetchMock.mock.calls[2][0])).toMatch(/\/notifications\/notification-1\/read$/)
    expect(String(fetchMock.mock.calls[3][0])).toMatch(/\/notifications\/read-all$/)
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual([undefined, undefined, 'PATCH', 'POST'])
    expect(fetchMock.mock.calls[3][1]).toEqual(expect.not.objectContaining({ body: expect.anything() }))
  })
})
