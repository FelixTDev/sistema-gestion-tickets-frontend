import { apiClient } from '../../../lib/api-client'
import type {
  ChatFeedbackCreate,
  ChatFeedbackRead,
  ConversationActionRequest,
  ConversationRead,
  LinkConversationResponse,
  SendMessageResponse,
} from '../types/chatbot-types'
import { assertUuid } from '../../../lib/identifiers'
import type { TicketCreate, TicketRead } from '../../tickets/types/ticket-types'

export function createConversation(): Promise<ConversationRead> {
  return apiClient.post<ConversationRead>('/chat/conversations')
}

export async function getConversation(conversationId: string, signal?: AbortSignal): Promise<ConversationRead> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.get<ConversationRead>(`/chat/conversations/${conversationId}`, { signal }, { retries: 0 })
}

export async function sendConversationMessage(conversationId: string, content: string): Promise<SendMessageResponse> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<SendMessageResponse>(`/chat/conversations/${conversationId}/messages`, { content })
}

export async function linkConversationToUser(conversationId: string, signal?: AbortSignal): Promise<LinkConversationResponse> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<LinkConversationResponse>(`/chat/conversations/${conversationId}/link-user`, undefined, { signal })
}

export async function escalateConversation(conversationId: string, request: ConversationActionRequest): Promise<ConversationRead> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<ConversationRead>(`/chat/conversations/${conversationId}/escalate`, request)
}

export async function resetConversation(conversationId: string): Promise<ConversationRead> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<ConversationRead>(`/chat/conversations/${conversationId}/reset`)
}

export async function feedbackConversation(conversationId: string, request: ChatFeedbackCreate): Promise<ChatFeedbackRead> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<ChatFeedbackRead>(`/chat/conversations/${conversationId}/feedback`, request)
}

export async function convertConversationToTicket(conversationId: string, request: TicketCreate): Promise<TicketRead> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<TicketRead>(`/chat/conversations/${conversationId}/convert-to-ticket`, request)
}
