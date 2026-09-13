import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addTicketComment,
  cancelTicket,
  changeTicketStatus,
  closeTicket,
  convertConversationToTicket,
  createTicket,
  getTicketComments,
  getTicket,
  getTicketHistory,
  listTickets,
  listMyTickets,
  reopenTicket,
} from './api/ticket-api'
import type { TicketCreate, TicketListFilters, TicketRead } from './types/ticket-types'

const payload: TicketCreate = {
  category_id: 'category-1',
  subject: 'Consulta de tarjeta',
  description: 'Necesito orientación adicional.',
  priority: 'MEDIA',
}

const ticket: TicketRead = {
  id: 'ticket-1', tracking_code: 'TCK-20260912-ABC', client_id: 'client-1', conversation_id: null,
  category_id: 'category-1', subject: payload.subject, description: payload.description, priority: 'MEDIA',
  status: 'NUEVO', source: 'MANUAL', assigned_advisor_id: null, created_at: '2026-09-12T20:00:00Z',
  assigned_at: null, resolved_at: null, closed_at: null, cancelled_at: null,
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('API de tickets del cliente', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('lista exclusivamente mediante /tickets/mine y obtiene detalle e historial', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse([ticket]))
      .mockResolvedValueOnce(jsonResponse(ticket))
      .mockResolvedValueOnce(jsonResponse([]))

    await expect(listMyTickets()).resolves.toEqual([ticket])
    await expect(getTicket('ticket-1')).resolves.toEqual(ticket)
    await expect(getTicketHistory('ticket-1')).resolves.toEqual([])

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/tickets\/mine$/)
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/tickets\/ticket-1$/)
    expect(String(fetchMock.mock.calls[2][0])).toMatch(/\/tickets\/ticket-1\/history$/)
  })

  it('crea manualmente con el body exacto', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(ticket, 201))

    await expect(createTicket(payload)).resolves.toEqual(ticket)

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/tickets$/)
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }))
  })

  it('convierte usando exclusivamente el endpoint de la conversación', async () => {
    const converted = { ...ticket, conversation_id: 'conversation-1', source: 'CHATBOT' as const }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(converted, 201))

    await expect(convertConversationToTicket('conversation-1', payload)).resolves.toEqual(converted)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/chat\/conversations\/conversation-1\/convert-to-ticket$/)
    expect(String(fetchMock.mock.calls[0][0])).not.toMatch(/\/tickets$/)
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }))
  })

  it('publica comentarios sin persistir datos en localStorage', async () => {
    const comment = { id: 'comment-1', ticket_id: 'ticket-1', author_id: 'client-1', content: 'Información adicional', created_at: '2026-09-12T21:00:00Z' }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(comment, 201))

    await expect(addTicketComment('ticket-1', { content: 'Información adicional' })).resolves.toEqual(comment)

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/tickets\/ticket-1\/comments$/)
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ content: 'Información adicional' }) }))
    expect(localStorage.length).toBe(0)
  })

  it('lee comentarios persistentes y lista tickets operativos con filtros exactos', async () => {
    const comments = [{ id: 'comment-1', ticket_id: ticket.id, author_id: 'client-1', content: 'Consulta', created_at: '2026-09-12T21:00:00Z' }]
    const filters: TicketListFilters = { status: 'EN_PROCESO', category_id: 'category-1', priority: 'ALTA', created_from: '2026-09-12T00:00:00', created_to: '2026-09-12T23:59:59' }
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(comments))
      .mockResolvedValueOnce(jsonResponse([ticket]))

    await expect(getTicketComments(ticket.id)).resolves.toEqual(comments)
    await expect(listTickets(filters)).resolves.toEqual([ticket])

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/tickets\/ticket-1\/comments$/)
    const url = new URL(String(fetchMock.mock.calls[1][0]))
    expect(url.pathname).toMatch(/\/tickets$/)
    expect(url.searchParams.get('status')).toBe(filters.status)
    expect(url.searchParams.get('category_id')).toBe(filters.category_id)
    expect(url.searchParams.get('priority')).toBe(filters.priority)
    expect(url.searchParams.get('created_from')).toBe(filters.created_from)
    expect(url.searchParams.get('created_to')).toBe(filters.created_to)
  })

  it('usa los cuerpos exactos de las mutaciones operativas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(ticket))
      .mockResolvedValueOnce(jsonResponse(ticket))
      .mockResolvedValueOnce(jsonResponse(ticket))
      .mockResolvedValueOnce(jsonResponse(ticket))

    await changeTicketStatus(ticket.id, { status: 'EN_PROCESO', reason: null })
    await closeTicket(ticket.id)
    await reopenTicket(ticket.id, { reason: 'Revisión solicitada' })
    await cancelTicket(ticket.id, { reason: 'Solicitud cancelada' })

    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      expect.stringMatching(/\/tickets\/ticket-1\/status$/),
      expect.stringMatching(/\/tickets\/ticket-1\/close$/),
      expect.stringMatching(/\/tickets\/ticket-1\/reopen$/),
      expect.stringMatching(/\/tickets\/ticket-1\/cancel$/),
    ])
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ status: 'EN_PROCESO', reason: null }) }))
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({}) }))
    expect(fetchMock.mock.calls[2][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ reason: 'Revisión solicitada' }) }))
    expect(fetchMock.mock.calls[3][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ reason: 'Solicitud cancelada' }) }))
  })
})
