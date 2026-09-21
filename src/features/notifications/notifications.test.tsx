import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient } from '../../test/test-query-client'
import { NotificationsPage } from './pages/notifications-page'

const notification = {
  id: 'notification-1', recipient_user_id: 'user-1', type: 'ticket_created' as const,
  title: 'Nuevo ticket', message: 'Se registró tu ticket.', related_ticket_id: 'ticket-1',
  related_conversation_id: null, is_read: false, created_at: '2026-09-20T10:00:00Z', read_at: null,
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function renderPage() {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}><MemoryRouter><NotificationsPage /></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('página de notificaciones', () => {
  it('carga la bandeja, muestra el contador y permite marcar una y todas como leídas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (init?.method === 'PATCH') return Promise.resolve(jsonResponse({ ...notification, is_read: true }))
      if (init?.method === 'POST') return Promise.resolve(jsonResponse({ updated_count: 1 }))
      if (url.endsWith('/notifications/unread-count')) return Promise.resolve(jsonResponse({ unread_count: 1 }))
      return Promise.resolve(jsonResponse({ page: 1, page_size: 20, total: 1, total_pages: 1, items: [notification] }))
    })
    renderPage()

    expect(await screen.findByRole('heading', { name: /notificaciones/i })).toBeInTheDocument()
    expect(await screen.findByText('1 sin leer')).toBeInTheDocument()
    expect(await screen.findByText('Nuevo ticket')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /marcar como leída/i }))
    await userEvent.click(screen.getByRole('button', { name: /marcar todas como leídas/i }))

    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(true)
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true)
  })

  it('muestra el estado vacío cuando el backend no devuelve notificaciones', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      if (String(input).endsWith('/notifications/unread-count')) return Promise.resolve(jsonResponse({ unread_count: 0 }))
      return Promise.resolve(jsonResponse({ page: 1, page_size: 20, total: 0, total_pages: 0, items: [] }))
    })
    renderPage()

    expect(await screen.findByText(/no tienes notificaciones/i)).toBeInTheDocument()
  })
})
