import { apiClient } from '../../../lib/api-client'
import type {
  ConversationRead,
  LinkConversationResponse,
  SendMessageResponse,
} from '../types/chatbot-types'

export function createConversation(): Promise<ConversationRead> {
  return apiClient.post<ConversationRead>('/chat/conversations')
}

export function getConversation(conversationId: string, signal?: AbortSignal): Promise<ConversationRead> {
  return apiClient.get<ConversationRead>(`/chat/conversations/${conversationId}`, { signal })
}

export function sendConversationMessage(conversationId: string, content: string): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>(`/chat/conversations/${conversationId}/messages`, { content })
}

export function linkConversationToUser(conversationId: string): Promise<LinkConversationResponse> {
  return apiClient.post<LinkConversationResponse>(`/chat/conversations/${conversationId}/link-user`)
}
