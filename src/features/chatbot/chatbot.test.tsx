import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '../auth/auth-provider'
import { clearSession as clearAuthSession } from '../auth/auth-service'
import { setAccessToken, setSession } from '../../lib/auth'
import { createTestQueryClient } from '../../test/test-query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import type { Role, Session } from '../../types/auth'
import type { ReactNode } from 'react'
import { ChatbotProvider, useChatbot } from './chatbot-provider'
import { ConversationPanel } from './components/conversation-panel'
import { ChatbotWidget } from './components/chatbot-widget'

const emptyConversation = {
  id: '11111111-1111-4111-8111-111111111111', user_id: null, status: 'ACTIVE',
  started_at: '2026-09-12T20:00:00Z', ended_at: null, messages: [],
}
const userMessage = {
  id: 'message-1', sender_type: 'USER', content: '¿Qué es una cuenta?', intent: null,
  confidence: null, created_at: '2026-09-12T20:01:00Z',
}
const botMessage = {
  id: 'message-2', sender_type: 'BOT', content: 'Respuesta exacta del backend', intent: 'accounts',
  confidence: 0.95, created_at: '2026-09-12T20:01:01Z',
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function sessionFor(role: Role): Session {
  return { accessToken: `${role}-token`, user: { id: `${role}-1`, full_name: `Cuenta ${role}`, email: `${role.toLowerCase()}@example.com`, role } }
}

function ChatHarness({ children = <ConversationPanel />, route = '/' }: { children?: ReactNode; route?: string }) {
  const queryClient = createTestQueryClient()
  return <QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[route]}><AuthProvider><ChatbotProvider>{children}</ChatbotProvider></AuthProvider></MemoryRouter></QueryClientProvider>
}

function renderHarness(children?: ReactNode, route?: string) {
  return render(<ChatHarness route={route}>{children}</ChatHarness>)
}

function LoginAndConversationProbe() {
  const { signIn } = useAuth()
  const { conversation } = useChatbot()
  return <><output aria-label="Usuario asociado">{conversation?.user_id ?? 'anonymous'}</output><button type="button" onClick={() => { void signIn({ email: 'cliente@example.com', password: 'Password123' }) }}>Iniciar sesión de prueba</button></>
}

describe('conversación del asistente', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearAuthSession()
    setSession(null)
    vi.restoreAllMocks()
  })

  it('crea una conversación al primer envío y renderiza solo los mensajes del backend', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(emptyConversation, 201))
      .mockResolvedValueOnce(jsonResponse({ user_message: userMessage, bot_message: botMessage, resolved: true, offers_ticket: false }))
    await renderHarness()

    await userEvent.type(screen.getByLabelText('Escribe tu consulta'), userMessage.content)
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText(userMessage.content)).toBeInTheDocument()
    expect(screen.getByText(botMessage.content)).toBeInTheDocument()
    expect(sessionStorage.getItem('chat_conversation_id')).toBe('11111111-1111-4111-8111-111111111111')
    expect(localStorage.length).toBe(0)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rechaza mensajes vacíos y mayores a 2000 caracteres', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await renderHarness()
    const textbox = screen.getByLabelText('Escribe tu consulta')

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe una consulta.')

    fireEvent.change(textbox, { target: { value: 'x'.repeat(2001) } })
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('La consulta no puede superar 2000 caracteres.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('restaura una conversación almacenada', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ...emptyConversation, messages: [userMessage, botMessage] }))
    await renderHarness()

    expect(await screen.findByText(botMessage.content)).toBeInTheDocument()
  })

  it('limpia una conversación que el backend declara inexistente', async () => {
    sessionStorage.setItem('chat_conversation_id', '33333333-3333-4333-8333-333333333333')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'No existe' }, 404))
    await renderHarness()

    await waitFor(() => expect(sessionStorage.getItem('chat_conversation_id')).toBeNull())
    expect(screen.getByText(/puedes iniciar una nueva consulta/i)).toBeInTheDocument()
  })

  it('descarta una conversación restaurada con un ID inválido', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ...emptyConversation, id: 'conversation-1' }))
    await renderHarness()

    await waitFor(() => expect(sessionStorage.getItem('chat_conversation_id')).toBeNull())
    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos recuperar/i)
  })

  it('conserva el ID y permite reintentar ante un error temporal', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ message: 'Temporal' }, 500))
      .mockResolvedValueOnce(jsonResponse({ ...emptyConversation, messages: [botMessage] }))
    await renderHarness()

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos recuperar la conversación/i)
    expect(sessionStorage.getItem('chat_conversation_id')).toBe('11111111-1111-4111-8111-111111111111')
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(await screen.findByText(botMessage.content)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('coordinación por rol', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearAuthSession()
    setSession(null)
    vi.restoreAllMocks()
  })

  it('asocia primero y restaura después cuando existe una sesión CLIENTE', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    setSession(sessionFor('CLIENTE'))
    let resolveLink!: (response: Response) => void
    const linkPromise = new Promise<Response>((resolve) => { resolveLink = resolve })
    const calls: string[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (url.endsWith('/link-user')) { calls.push('link'); return linkPromise }
      if (init?.method !== 'POST') { calls.push('restore'); return Promise.resolve(jsonResponse(emptyConversation)) }
      return Promise.resolve(jsonResponse({ message: 'Unexpected' }, 500))
    })

    await renderHarness()
    await waitFor(() => expect(calls).toEqual(['link']))
    resolveLink(jsonResponse({ id: '11111111-1111-4111-8111-111111111111', user_id: 'CLIENTE-1', status: 'ACTIVE' }))
    await waitFor(() => expect(calls).toEqual(['link', 'restore']))
  })

  it('actualiza una conversación anónima ya restaurada después de asociarla', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) return Promise.resolve(jsonResponse({ access_token: 'CLIENTE-token', token_type: 'bearer', user: sessionFor('CLIENTE').user }))
      if (url.endsWith('/link-user')) return Promise.resolve(jsonResponse({ id: '11111111-1111-4111-8111-111111111111', user_id: 'CLIENTE-1', status: 'ACTIVE' }))
      return Promise.resolve(jsonResponse(emptyConversation))
    })
    await renderHarness(<LoginAndConversationProbe />)
    expect(await screen.findByRole('status', { name: 'Usuario asociado' })).toHaveTextContent('anonymous')

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión de prueba' }))

    await waitFor(() => expect(screen.getByRole('status', { name: 'Usuario asociado' })).toHaveTextContent('CLIENTE-1'))
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it.each([403, 404])('limpia el ID cuando link-user responde %s', async (status) => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    setSession(sessionFor('CLIENTE'))
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'No accesible' }, status))
    await renderHarness()

    await waitFor(() => expect(sessionStorage.getItem('chat_conversation_id')).toBeNull())
  })

  it('conserva el ID cuando link-user falla temporalmente', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    setSession(sessionFor('CLIENTE'))
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Temporal' }, 500))
    await renderHarness()

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos asociar la conversación/i)
    expect(sessionStorage.getItem('chat_conversation_id')).toBe('11111111-1111-4111-8111-111111111111')
  })

  it('no restaura ni muestra el chatbot dentro del Design System', async () => {
    sessionStorage.setItem('chat_conversation_id', emptyConversation.id)
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(emptyConversation))
    renderHarness(<ChatbotWidget />, '/design-system')

    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled())
    expect(screen.queryByRole('button', { name: /abrir asistente de atención/i })).not.toBeInTheDocument()
  })

  it('reintenta la asociación temporal antes de restaurar la conversación', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    setSession(sessionFor('CLIENTE'))
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ message: 'Temporal' }, 500))
      .mockResolvedValueOnce(jsonResponse({ id: '11111111-1111-4111-8111-111111111111', user_id: 'CLIENTE-1', status: 'ACTIVE' }))
      .mockResolvedValueOnce(jsonResponse({ ...emptyConversation, user_id: 'CLIENTE-1', messages: [botMessage] }))
    await renderHarness()

    const error = await screen.findByRole('alert')
    expect(error).toHaveTextContent(/no pudimos asociar/i)
    await userEvent.click(within(error).getByRole('button', { name: /reintentar/i }))
    expect(await screen.findByText(botMessage.content)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it.each(['ASESOR', 'SUPERVISOR'] as const)('permanece totalmente inactivo para %s', async (role) => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    setSession(sessionFor(role))
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await renderHarness()

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Escribe tu consulta')).not.toBeInTheDocument()
  })

  it('espera /auth/me antes de decidir si puede restaurar una conversación', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    setAccessToken('staff-token')
    let resolveCurrentUser!: (response: Response) => void
    const currentUserPromise = new Promise<Response>((resolve) => { resolveCurrentUser = resolve })
    const calls: string[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/auth/me')) { calls.push('me'); return currentUserPromise }
      calls.push('chat')
      return Promise.resolve(jsonResponse(emptyConversation))
    })

    await renderHarness()
    await waitFor(() => expect(calls).toEqual(['me']))
    await act(async () => { resolveCurrentUser(jsonResponse(sessionFor('ASESOR').user)) })
    expect(screen.queryByLabelText('Escribe tu consulta')).not.toBeInTheDocument()
    expect(calls).toEqual(['me'])
  })

  it('no restaura el chatbot en /personal/login aunque aún no exista sesión', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await renderHarness(undefined, '/personal/login')

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('descarta un ID de conversación malformado antes de cualquier llamada', async () => {
    sessionStorage.setItem('chat_conversation_id', '../not-a-uuid')
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await renderHarness()

    await waitFor(() => expect(sessionStorage.getItem('chat_conversation_id')).toBeNull())
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('no persiste el ID cuando crear conversación devuelve un identificador inválido', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ...emptyConversation, id: 'conversation-1' }, 201))
    await renderHarness()

    await userEvent.click(screen.getByRole('button', { name: /nueva conversación/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos iniciar/i)
    expect(sessionStorage.getItem('chat_conversation_id')).toBeNull()
  })
})

describe('widget y escalamiento visual', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearAuthSession()
    setSession(null)
    vi.restoreAllMocks()
  })

  it('abre y cierra el diálogo con controles accesibles y Escape', async () => {
    await renderHarness(<ChatbotWidget />)
    const launcher = screen.getByRole('button', { name: /abrir asistente de atención/i })
    expect(launcher).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(launcher)
    expect(screen.getByRole('dialog', { name: /asistente de atención/i })).toBeInTheDocument()
    expect(screen.getByText('Asistente GNB')).toBeInTheDocument()
    expect(screen.getByText('En línea')).toBeInTheDocument()
    expect(screen.getByText(/no ingreses números de tarjeta, claves, cvv, tokens/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Escribe tu consulta')).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: /asistente de atención/i })).not.toBeInTheDocument()
    expect(launcher).toHaveFocus()
  })

  it('no muestra un launcher duplicado dentro de /chat', async () => {
    await renderHarness(<ChatbotWidget />, '/chat')
    expect(screen.queryByRole('button', { name: /abrir asistente de atención/i })).not.toBeInTheDocument()
  })

  it('permite iniciar explícitamente una conversación desde el estado inicial', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(emptyConversation, 201))
    await renderHarness()

    await userEvent.click(screen.getByRole('button', { name: /nueva conversación/i }))
    await waitFor(() => expect(sessionStorage.getItem('chat_conversation_id')).toBe('11111111-1111-4111-8111-111111111111'))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('pide confirmación antes de sustituir una conversación con mensajes', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ ...emptyConversation, messages: [userMessage, botMessage] }))
      .mockResolvedValueOnce(jsonResponse({ ...emptyConversation, id: '22222222-2222-4222-8222-222222222222' }, 201))
    await renderHarness()
    await screen.findByText(botMessage.content)

    await userEvent.click(screen.getByRole('button', { name: /nueva conversación/i }))
    expect(screen.getByRole('alertdialog', { name: /crear una nueva conversación/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /conservar conversación/i }))
    expect(sessionStorage.getItem('chat_conversation_id')).toBe('11111111-1111-4111-8111-111111111111')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: /nueva conversación/i }))
    await userEvent.click(screen.getByRole('button', { name: /^crear nueva$/i }))
    await waitFor(() => expect(sessionStorage.getItem('chat_conversation_id')).toBe('22222222-2222-4222-8222-222222222222'))
  })

  it('ofrece login y registro al visitante cuando el backend ofrece ticket', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(emptyConversation, 201))
      .mockResolvedValueOnce(jsonResponse({ user_message: userMessage, bot_message: botMessage, resolved: false, offers_ticket: true }))
    await renderHarness()

    await userEvent.type(screen.getByLabelText('Escribe tu consulta'), userMessage.content)
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText(/inicia sesión o crea una cuenta/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /registrarse/i })).toHaveAttribute('href', '/registro')
    expect(sessionStorage.getItem('chat_conversation_id')).toBe('11111111-1111-4111-8111-111111111111')
  })

  it('prepara la acción futura para CLIENTE sin llamar tickets automáticamente', async () => {
    setSession(sessionFor('CLIENTE'))
    const onCreateTicket = vi.fn()
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(emptyConversation, 201))
      .mockResolvedValueOnce(jsonResponse({ user_message: userMessage, bot_message: botMessage, resolved: false, offers_ticket: true }))
    await renderHarness(<ConversationPanel onCreateTicket={onCreateTicket} />)

    await userEvent.type(screen.getByLabelText('Escribe tu consulta'), userMessage.content)
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText(/puede convertirse en un ticket/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /crear ticket/i }))
    expect(onCreateTicket).toHaveBeenCalledTimes(1)
  })
})
