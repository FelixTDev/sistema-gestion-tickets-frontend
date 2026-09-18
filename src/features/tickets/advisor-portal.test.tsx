import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/app-shell'
import { setSession } from '../../lib/auth'
import { clearSession } from '../auth/auth-service'
import { createTestQueryClient } from '../../test/test-query-client'
import type { TicketRead } from './types/ticket-types'

const advisor = { id: 'advisor-1', full_name: 'Asesor Real', email: 'advisor@example.com', role: 'ASESOR' as const }
const tickets: TicketRead[] = [
  { id: 'ticket-1', tracking_code: 'TCK-001', client_id: 'client-1', conversation_id: null, category_id: 'cat-1', subject: 'Solicitud urgente', description: 'Detalle', priority: 'URGENTE', status: 'EN_PROCESO', source: 'MANUAL', assigned_advisor_id: advisor.id, created_at: '2026-09-13T10:00:00Z', assigned_at: null, resolved_at: null, closed_at: null, cancelled_at: null },
  { id: 'ticket-2', tracking_code: 'TCK-002', client_id: 'client-2', conversation_id: null, category_id: 'cat-1', subject: 'Solicitud nueva', description: 'Detalle', priority: 'MEDIA', status: 'NUEVO', source: 'MANUAL', assigned_advisor_id: null, created_at: '2026-09-12T10:00:00Z', assigned_at: null, resolved_at: null, closed_at: null, cancelled_at: null },
]

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }) }

function renderApp(path: string) {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></QueryClientProvider>)
}

describe('portal del asesor', () => {
  beforeEach(() => {
    clearSession()
    sessionStorage.clear()
    setSession({ accessToken: 'advisor-token', user: advisor })
    vi.restoreAllMocks()
  })

  it('deriva los indicadores del dashboard desde la bandeja real y no muestra rutas supervisoras', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/tickets')) return Promise.resolve(json(tickets))
      if (url.endsWith('/categories')) return Promise.resolve(json([{ id: 'cat-1', name: 'Cuentas', description: null, is_active: true, created_at: '', updated_at: '' }]))
      return Promise.resolve(json({ detail: 'Unexpected' }, 500))
    })

    renderApp('/personal')

    expect(await screen.findByRole('heading', { name: /buen día, asesor real/i })).toBeInTheDocument()
    expect(screen.getByText('Tickets pendientes').parentElement).toHaveTextContent('1')
    expect(screen.getByText('Asignados a ti').parentElement).toHaveTextContent('1')
    expect(screen.getByText('Urgentes').parentElement).toHaveTextContent('1')
    expect(screen.getByText('Solicitud urgente')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bandeja de tickets/i })).toHaveAttribute('href', '/personal/tickets')
    expect(screen.queryByRole('link', { name: /reportes|conocimiento|asignación/i })).not.toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([input]) => String(input).endsWith('/tickets'))).toBe(true)
  })

  it('mantiene el detalle sin realizar solicitudes con un id de ticket malformado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json({ detail: 'Unexpected' }, 500))
    renderApp('/personal/tickets/%20')
    await userEvent.setup().click(screen.getByRole('link', { name: /bandeja de tickets/i }))
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/tickets/'))).toBe(false)
  })

  it('no ofrece comentar un ticket que no está asignado al asesor', async () => {
    const ticketId = '11111111-1111-4111-8111-111111111111'
    const unassigned = { ...tickets[1], id: ticketId }
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith(`/tickets/${ticketId}`)) return Promise.resolve(json(unassigned))
      if (url.endsWith(`/tickets/${ticketId}/history`) || url.endsWith(`/tickets/${ticketId}/comments`)) return Promise.resolve(json([]))
      if (url.endsWith('/categories')) return Promise.resolve(json([]))
      return Promise.resolve(json({ detail: 'Unexpected' }, 500))
    })

    renderApp(`/personal/tickets/${ticketId}`)

    expect(await screen.findByRole('heading', { name: /comentarios/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /publicar comentario/i })).not.toBeInTheDocument()
    expect(screen.getByText(/solo el asesor asignado puede comentar/i)).toBeInTheDocument()
  })
})
