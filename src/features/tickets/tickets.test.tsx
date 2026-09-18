import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/app-shell'
import { clearSession } from '../auth/auth-service'
import { setSession } from '../../lib/auth'
import { createTestQueryClient } from '../../test/test-query-client'
import type { TicketRead } from './types/ticket-types'

const client = { id: 'client-1', full_name: 'Cliente Demo', email: 'cliente@example.com', role: 'CLIENTE' as const }
const categories = [
  { id: 'category-1', name: 'Cuentas', description: null, is_active: true, created_at: '2026-09-12', updated_at: '2026-09-12' },
  { id: 'category-hidden', name: 'Oculta', description: null, is_active: false, created_at: '2026-09-12', updated_at: '2026-09-12' },
]
const olderTicket: TicketRead = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', tracking_code: 'TCK-OLD', client_id: client.id, conversation_id: null,
  category_id: 'category-1', subject: 'Consulta anterior', description: 'Detalle anterior', priority: 'BAJA',
  status: 'CERRADO', source: 'MANUAL', assigned_advisor_id: null, created_at: '2026-09-10T20:00:00Z',
  assigned_at: null, resolved_at: '2026-09-11T20:00:00Z', closed_at: '2026-09-12T20:00:00Z', cancelled_at: null,
}
const newerTicket: TicketRead = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', tracking_code: 'TCK-NEW', client_id: client.id, conversation_id: '11111111-1111-4111-8111-111111111111',
  category_id: 'category-hidden', subject: 'Consulta reciente', description: 'Detalle reciente', priority: 'ALTA',
  status: 'EN_PROCESO', source: 'CHATBOT', assigned_advisor_id: 'advisor-1', created_at: '2026-09-12T20:00:00Z',
  assigned_at: '2026-09-12T21:00:00Z', resolved_at: null, closed_at: null, cancelled_at: null,
}
const createdTicket: TicketRead = {
  ...olderTicket, id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', tracking_code: 'TCK-CREATED', subject: 'Nueva solicitud',
  description: 'Descripción de la nueva solicitud', priority: 'MEDIA', status: 'NUEVO', source: 'MANUAL',
  created_at: '2026-09-12T22:00:00Z', resolved_at: null, closed_at: null,
}
const conversation = {
  id: '11111111-1111-4111-8111-111111111111', user_id: client.id, status: 'ACTIVE', started_at: '2026-09-12T20:00:00Z', ended_at: null,
  messages: [
    { id: 'message-1', sender_type: 'USER', content: 'Mi consulta no fue resuelta', intent: null, confidence: null, created_at: '2026-09-12T20:01:00Z' },
    { id: 'message-2', sender_type: 'BOT', content: 'Puedo ayudarte a crear un ticket.', intent: null, confidence: 0, created_at: '2026-09-12T20:01:01Z' },
  ],
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

function renderApp(path: string) {
  const queryClient = createTestQueryClient()
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[path]}><App /><LocationProbe /></MemoryRouter></QueryClientProvider>),
  }
}

function mockTicketQueries(tickets: TicketRead[] = [olderTicket, newerTicket]) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = String(input)
    if (url.endsWith('/tickets/mine')) return Promise.resolve(jsonResponse(tickets))
    if (url.endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
    return Promise.resolve(jsonResponse({ message: 'Unexpected request' }, 500))
  })
}

async function fillTicketForm() {
  await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'category-1')
  await userEvent.type(screen.getByLabelText('Asunto'), 'Nueva solicitud')
  await userEvent.type(screen.getByLabelText('Descripción'), 'Descripción de la nueva solicitud')
  await userEvent.selectOptions(screen.getByLabelText('Prioridad'), 'MEDIA')
}

describe('bandeja de tickets del cliente', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearSession()
    setSession({ accessToken: 'client-token', user: client })
    vi.restoreAllMocks()
  })

  it('muestra tickets propios del más reciente al más antiguo con badges y categoría activa', async () => {
    mockTicketQueries()
    renderApp('/cliente/tickets')

    const items = await screen.findAllByRole('article')
    expect(within(items[0]).getByText('TCK-NEW')).toBeInTheDocument()
    expect(within(items[1]).getByText('TCK-OLD')).toBeInTheDocument()
    expect(screen.getByLabelText('Estado: En proceso')).toBeInTheDocument()
    expect(screen.getByLabelText('Prioridad: Alta')).toBeInTheDocument()
    expect(screen.getByText('Origen: Chatbot')).toBeInTheDocument()
    expect(screen.getByText('Categoría no disponible')).toBeInTheDocument()
    expect(screen.getByText('Cuentas')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver ticket tck-new/i })).toHaveAttribute('href', `/cliente/tickets/${newerTicket.id}`)
  })

  it('muestra estados de carga y vacío', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>(() => undefined))
    const loading = renderApp('/cliente/tickets')
    expect(screen.getByText(/cargando mis tickets/i)).toBeInTheDocument()
    loading.unmount()

    mockTicketQueries([])
    renderApp('/cliente/tickets')
    expect(await screen.findByText(/aún no tienes tickets/i)).toBeInTheDocument()
  })

  it('muestra error y reintenta la bandeja', async () => {
    let ticketAttempts = 0
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
      ticketAttempts += 1
      return Promise.resolve(ticketAttempts === 1 ? jsonResponse({ detail: 'Temporal' }, 500) : jsonResponse([newerTicket]))
    })
    renderApp('/cliente/tickets')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cargar tus tickets/i)
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(await screen.findByText('TCK-NEW')).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([input]) => String(input).endsWith('/tickets/mine'))).toHaveLength(2)
  })
})

describe('dashboard del cliente', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearSession()
    setSession({ accessToken: 'client-token', user: client })
    vi.restoreAllMocks()
  })

  it('resume la actividad, muestra recientes y ofrece accesos principales', async () => {
    mockTicketQueries()
    renderApp('/cliente')

    expect(await screen.findByText('TCK-NEW')).toBeInTheDocument()
    expect(screen.getByText('1', { selector: '.dashboard-open-count' })).toBeInTheDocument()
    expect(screen.getByText('1', { selector: '.dashboard-finished-count' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: /crear ticket/i })).toHaveAttribute('href', '/cliente/tickets/nuevo')
    expect(screen.getByRole('link', { name: /abrir asistente/i })).toHaveAttribute('href', '/chat')
    expect(screen.getByRole('link', { name: /ver todos/i })).toHaveAttribute('href', '/cliente/tickets')
  })

  it('muestra un resumen vacío sin inventar actividad', async () => {
    mockTicketQueries([])
    renderApp('/cliente')

    expect(await screen.findByText(/todavía no tienes actividad de tickets/i)).toBeInTheDocument()
  })
})

describe('creación manual de tickets', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearSession()
    setSession({ accessToken: 'client-token', user: client })
    vi.restoreAllMocks()
  })

  it('valida categoría, asunto, descripción y prioridad', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => String(input).endsWith('/categories') ? Promise.resolve(jsonResponse(categories)) : Promise.resolve(jsonResponse({ detail: 'Unexpected' }, 500)))
    renderApp('/cliente/tickets/nuevo')
    await screen.findByLabelText('Categoría')

    await userEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(await screen.findByText('Selecciona una categoría.')).toBeInTheDocument()
    expect(screen.getByText(/asunto debe tener al menos 3/i)).toBeInTheDocument()
    expect(screen.getByText(/descripción debe tener al menos 5/i)).toBeInTheDocument()
    expect(screen.getByText('Selecciona una prioridad.')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Oculta' })).not.toBeInTheDocument()
  })

  it('crea un ticket manual y navega al detalle con el código de seguimiento', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (url.endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
      if (url.endsWith('/tickets') && init?.method === 'POST') return Promise.resolve(jsonResponse(createdTicket, 201))
      return Promise.resolve(jsonResponse({ detail: 'Unexpected' }, 500))
    })
    renderApp('/cliente/tickets/nuevo')
    await screen.findByLabelText('Categoría')
    await fillTicketForm()

    await userEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(`/cliente/tickets/${createdTicket.id}`))
    expect(screen.getByText('TCK-CREATED')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([input, init]) => String(input).endsWith('/tickets') && init?.method === 'POST')).toBe(true)
  })

  it('deshabilita el envío pendiente y evita solicitudes duplicadas', async () => {
    let resolveCreation: (response: Response) => void = () => undefined
    const pendingCreation = new Promise<Response>((resolve) => { resolveCreation = resolve })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if (String(input).endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
      if (String(input).endsWith('/tickets') && init?.method === 'POST') return pendingCreation
      return new Promise<Response>(() => undefined)
    })
    renderApp('/cliente/tickets/nuevo')
    await screen.findByLabelText('Categoría')
    await fillTicketForm()

    const submit = screen.getByRole('button', { name: /enviar solicitud/i })
    await userEvent.click(submit)
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /enviando/i }))
    expect(fetchMock.mock.calls.filter(([input, init]) => String(input).endsWith('/tickets') && init?.method === 'POST')).toHaveLength(1)
    resolveCreation(jsonResponse(createdTicket, 201))
    await screen.findByText('TCK-CREATED')
    expect(screen.getByTestId('location')).toHaveTextContent(`/cliente/tickets/${createdTicket.id}`)
  })

  it.each([
    [401, /sesión expiró/i], [403, /no tienes permiso/i], [422, /revisa los datos/i], [409, /no se pudo crear el ticket/i],
  ])('mantiene el formulario cuando la creación responde %s', async (status, expectedMessage) => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if (String(input).endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
      if (init?.method === 'POST') return Promise.resolve(jsonResponse({ detail: 'Error controlado' }, status as number))
      return Promise.resolve(jsonResponse({ detail: 'Unexpected' }, 500))
    })
    renderApp('/cliente/tickets/nuevo')
    await screen.findByLabelText('Categoría')
    await fillTicketForm()

    await userEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(expectedMessage)
    expect(screen.getByLabelText('Asunto')).toHaveValue('Nueva solicitud')
    expect(screen.getByLabelText('Descripción')).toHaveValue('Descripción de la nueva solicitud')
  })
})

describe('conversión desde el chatbot', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearSession()
    setSession({ accessToken: 'client-token', user: client })
    vi.restoreAllMocks()
  })

  it('usa convert-to-ticket, conserva datos ante error y limpia la conversación después del éxito', async () => {
    sessionStorage.setItem('chat_conversation_id', conversation.id)
    let conversionAttempts = 0
    const converted = { ...createdTicket, conversation_id: conversation.id, source: 'CHATBOT' as const }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (url.endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
      if (url.endsWith('/link-user')) return Promise.resolve(jsonResponse({ id: conversation.id, user_id: client.id, status: 'ACTIVE' }))
      if (url.endsWith(`/chat/conversations/${conversation.id}`) && init?.method !== 'POST') return Promise.resolve(jsonResponse(conversation))
      if (url.endsWith('/convert-to-ticket')) {
        conversionAttempts += 1
        return Promise.resolve(conversionAttempts === 1 ? jsonResponse({ detail: 'Temporal' }, 500) : jsonResponse(converted, 201))
      }
      return Promise.resolve(jsonResponse({ detail: 'Unexpected' }, 500))
    })
    renderApp(`/cliente/tickets/nuevo?conversationId=${conversation.id}`)
    expect(await screen.findByText('Mi consulta no fue resuelta')).toBeInTheDocument()
    await fillTicketForm()

    await userEvent.click(screen.getByRole('button', { name: /convertir en ticket/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos convertir la conversación/i)
    expect(sessionStorage.getItem('chat_conversation_id')).toBe(conversation.id)
    expect(screen.getByLabelText('Asunto')).toHaveValue('Nueva solicitud')

    await userEvent.click(screen.getByRole('button', { name: /convertir en ticket/i }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(`/cliente/tickets/${createdTicket.id}`))
    expect(screen.getByText('TCK-CREATED')).toBeInTheDocument()
    expect(sessionStorage.getItem('chat_conversation_id')).toBeNull()
    expect(fetchMock.mock.calls.filter(([input]) => String(input).endsWith('/convert-to-ticket'))).toHaveLength(2)
    expect(fetchMock.mock.calls.some(([input, init]) => String(input).endsWith('/tickets') && init?.method === 'POST')).toBe(false)
  })

  it('navega desde la CTA real del chatbot conservando el conversationId', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ ...conversation, messages: [] }, 201))
      .mockResolvedValueOnce(jsonResponse({ user_message: conversation.messages[0], bot_message: conversation.messages[1], resolved: false, offers_ticket: true }))
    renderApp('/chat')
    await userEvent.type(screen.getByLabelText('Escribe tu consulta'), 'Mi consulta no fue resuelta')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await screen.findByText('Puedo ayudarte a crear un ticket.')

    await userEvent.click(screen.getByRole('button', { name: /crear ticket/i }))

    expect(screen.getByTestId('location')).toHaveTextContent(`/cliente/tickets/nuevo?conversationId=${conversation.id}`)
    expect(fetchMock.mock.calls.some(([input]) => String(input).endsWith('/chat/conversations'))).toBe(true)
    expect(fetchMock.mock.calls.some(([input]) => String(input).endsWith('/messages'))).toBe(true)
  })
})

describe('detalle, historial, comentarios y acciones del cliente', () => {
  const history = [
    { id: 'history-2', ticket_id: newerTicket.id, actor_id: 'advisor-1', action: 'STATUS_CHANGED', old_value: 'NUEVO', new_value: 'EN_PROCESO', description: 'Ticket en atención', created_at: '2026-09-12T22:00:00Z' },
    { id: 'history-1', ticket_id: newerTicket.id, actor_id: client.id, action: 'CREATED', old_value: null, new_value: 'NUEVO', description: 'Ticket creado', created_at: '2026-09-12T20:00:00Z' },
  ]
  const comment = { id: 'comment-1', ticket_id: newerTicket.id, author_id: client.id, content: 'Información adicional', created_at: '2026-09-12T23:00:00Z' }

  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearSession()
    setSession({ accessToken: 'client-token', user: client })
    vi.restoreAllMocks()
  })

  function mockDetail(ticket: TicketRead = newerTicket, historyItems = history) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (url.endsWith(`/tickets/${ticket.id}/history`)) return Promise.resolve(jsonResponse(historyItems))
      if (url.endsWith(`/tickets/${ticket.id}/comments`) && !init?.method) return Promise.resolve(jsonResponse(historyItems.length ? [comment] : []))
      if (url.endsWith(`/tickets/${ticket.id}/comments`) && init?.method === 'POST') return Promise.resolve(jsonResponse(comment, 201))
      if (url.endsWith(`/tickets/${ticket.id}`)) return Promise.resolve(jsonResponse(ticket))
      if (url.endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
      if (url.endsWith('/tickets/mine')) return Promise.resolve(jsonResponse([ticket]))
      return Promise.resolve(jsonResponse({ detail: 'Unexpected' }, 500))
    })
  }

  it('muestra el detalle real, la categoría, los metadatos y el historial cronológico', async () => {
    mockDetail()
    renderApp(`/cliente/tickets/${newerTicket.id}`)

    expect(await screen.findByRole('heading', { name: 'Consulta reciente' })).toBeInTheDocument()
    expect(screen.getByText('TCK-NEW')).toBeInTheDocument()
    expect(screen.getByText('Detalle reciente')).toBeInTheDocument()
    expect(screen.getByLabelText('Estado: En proceso')).toBeInTheDocument()
    expect(screen.getByLabelText('Prioridad: Alta')).toBeInTheDocument()
    expect(screen.getByText('Origen: Chatbot')).toBeInTheDocument()
    expect(screen.getByText('Categoría no disponible')).toBeInTheDocument()
    expect(screen.getAllByText('Asesor asignado').length).toBeGreaterThan(0)
    const events = await screen.findAllByRole('listitem')
    expect(within(events[0]).getByText('Ticket creado')).toBeInTheDocument()
    expect(within(events[1]).getByText('Ticket en atención')).toBeInTheDocument()
    expect(screen.queryByText(/fecha de cierre/i)).not.toBeInTheDocument()
  })

  it('muestra historial y comentarios persistentes vacíos', async () => {
    mockDetail(newerTicket, [])
    renderApp(`/cliente/tickets/${newerTicket.id}`)

    expect(await screen.findByText(/aún no hay eventos en el historial/i)).toBeInTheDocument()
    expect(await screen.findByText(/aún no hay comentarios/i)).toBeInTheDocument()
  })

  it('valida y publica un comentario una sola vez sin abandonar la ruta', async () => {
    const fetchMock = mockDetail()
    renderApp(`/cliente/tickets/${newerTicket.id}`)
    const field = await screen.findByLabelText('Comentario')

    await userEvent.click(screen.getByRole('button', { name: /publicar comentario/i }))
    expect(await screen.findByText('Escribe un comentario.')).toBeInTheDocument()
    fireEvent.change(field, { target: { value: 'x'.repeat(5001) } })
    await userEvent.click(screen.getByRole('button', { name: /publicar comentario/i }))
    expect(await screen.findByText(/no puede superar 5000/i)).toBeInTheDocument()
    await userEvent.clear(field)
    await userEvent.type(field, '  Información adicional  ')
    await userEvent.click(screen.getByRole('button', { name: /publicar comentario/i }))

    expect(await screen.findByText('Información adicional')).toBeInTheDocument()
    expect(screen.getAllByText('Información adicional')).toHaveLength(1)
    expect(screen.getByTestId('location')).toHaveTextContent(`/cliente/tickets/${newerTicket.id}`)
    const post = fetchMock.mock.calls.find(([input, init]) => String(input).endsWith('/comments') && init?.method === 'POST')
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ content: 'Información adicional' })
    expect(fetchMock.mock.calls.filter(([input]) => String(input).endsWith('/history')).length).toBeGreaterThan(1)
  })

  it.each(['CERRADO', 'CANCELADO'] as const)('oculta comentarios y acciones de estado cuando está %s', async (status) => {
    mockDetail({ ...newerTicket, status })
    renderApp(`/cliente/tickets/${newerTicket.id}`)

    expect(await screen.findByText(/este ticket ya no admite comentarios/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Comentario')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^(cerrar|reabrir|cancelar)$/i })).not.toBeInTheDocument()
  })

  it.each([[403, /no tienes permiso/i], [404, /no encontramos el ticket/i]])('presenta el error %s del detalle sin revelar información adicional', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => String(input).endsWith('/categories')
      ? Promise.resolve(jsonResponse(categories))
      : Promise.resolve(jsonResponse({ detail: 'Dato interno' }, status as number)))
    renderApp(`/cliente/tickets/${newerTicket.id}`)

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.queryByText('Dato interno')).not.toBeInTheDocument()
  })

  it('reintenta el detalle después de un error temporal', async () => {
    let ticketAttempts = 0
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith(`/tickets/${newerTicket.id}/history`)) return Promise.resolve(jsonResponse(history))
      if (url.endsWith(`/tickets/${newerTicket.id}`)) {
        ticketAttempts += 1
        return Promise.resolve(ticketAttempts === 1 ? jsonResponse({ detail: 'Temporal' }, 500) : jsonResponse(newerTicket))
      }
      if (url.endsWith('/categories')) return Promise.resolve(jsonResponse(categories))
      return Promise.resolve(jsonResponse({ detail: 'Unexpected' }, 500))
    })
    renderApp(`/cliente/tickets/${newerTicket.id}`)

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cargar el detalle/i)
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(await screen.findByRole('heading', { name: 'Consulta reciente' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([input]) => String(input).endsWith(`/tickets/${newerTicket.id}`))).toHaveLength(2)
  })
})
