import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createConversation,
  linkConversationToUser,
  sendConversationMessage,
} from './api/chatbot-api'
import {
  clearConversationId,
  getConversationId,
  setConversationId,
} from './chatbot-storage'

const conversation = {
  id: 'conversation-1',
  user_id: null,
  status: 'ACTIVE',
  started_at: '2026-09-12T20:00:00Z',
  ended_at: null,
  messages: [],
}

describe('API del chatbot', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('crea una conversación sin inventar un body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(conversation), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(createConversation()).resolves.toEqual(conversation)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/chat/conversations')
    expect(init).toEqual(expect.objectContaining({ method: 'POST' }))
    expect(init?.body).toBeUndefined()
  })

  it('envía el contenido al endpoint de mensajes', async () => {
    const response = {
      user_message: { id: 'm1', sender_type: 'USER', content: 'Consulta', intent: null, confidence: null, created_at: '2026-09-12T20:01:00Z' },
      bot_message: { id: 'm2', sender_type: 'BOT', content: 'Respuesta', intent: 'faq', confidence: 0.9, created_at: '2026-09-12T20:01:01Z' },
      resolved: true,
      offers_ticket: false,
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    await expect(sendConversationMessage('conversation-1', 'Consulta')).resolves.toEqual(response)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/chat/conversations/conversation-1/messages')
    expect(init).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ content: 'Consulta' }) }))
  })

  it('devuelve el contrato definido de link-user', async () => {
    const linked = { id: 'conversation-1', user_id: 'client-1', status: 'ACTIVE' }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(linked), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    await expect(linkConversationToUser('conversation-1')).resolves.toEqual(linked)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/chat/conversations/conversation-1/link-user')
    expect(init).toEqual(expect.objectContaining({ method: 'POST' }))
    expect(init?.body).toBeUndefined()
  })
})

describe('persistencia del chatbot', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('guarda y limpia únicamente conversation_id en sessionStorage', () => {
    setConversationId('conversation-1')
    expect(getConversationId()).toBe('conversation-1')
    expect(sessionStorage.getItem('chat_conversation_id')).toBe('conversation-1')
    expect(localStorage.length).toBe(0)

    clearConversationId()
    expect(getConversationId()).toBeNull()
    expect(localStorage.length).toBe(0)
  })
})
