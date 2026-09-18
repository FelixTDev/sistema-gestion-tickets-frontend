import { isUuid } from '../../lib/identifiers'

const CONVERSATION_ID_KEY = 'chat_conversation_id'

export function isConversationId(value: unknown): value is string {
  return isUuid(value)
}

export function getConversationId(): string | null {
  const stored = sessionStorage.getItem(CONVERSATION_ID_KEY)
  if (!stored) return null
  if (isConversationId(stored)) return stored
  sessionStorage.removeItem(CONVERSATION_ID_KEY)
  return null
}

export function setConversationId(conversationId: string): void {
  if (isConversationId(conversationId)) sessionStorage.setItem(CONVERSATION_ID_KEY, conversationId)
  else sessionStorage.removeItem(CONVERSATION_ID_KEY)
}

export function clearConversationId(): void {
  sessionStorage.removeItem(CONVERSATION_ID_KEY)
}
