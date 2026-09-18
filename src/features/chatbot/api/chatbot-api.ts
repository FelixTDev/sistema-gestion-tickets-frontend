import { apiClient } from '../../../lib/api-client'
import type {
  ConversationRead,
  LinkConversationResponse,
  SendMessageResponse,
} from '../types/chatbot-types'
import { assertUuid } from '../../../lib/identifiers'

export function createConversation(): Promise<ConversationRead> {
  return apiClient.post<ConversationRead>('/chat/conversations')
}

export async function getConversation(conversationId: string, signal?: AbortSignal): Promise<ConversationRead> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.get<ConversationRead>(`/chat/conversations/${conversationId}`, { signal })
}

export async function sendConversationMessage(conversationId: string, content: string): Promise<SendMessageResponse> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<SendMessageResponse>(`/chat/conversations/${conversationId}/messages`, { content })
}

export async function linkConversationToUser(conversationId: string): Promise<LinkConversationResponse> {
  assertUuid(conversationId, 'Identificador de conversación')
  return apiClient.post<LinkConversationResponse>(`/chat/conversations/${conversationId}/link-user`)
}
