const CONVERSATION_ID_KEY = 'chat_conversation_id'

export function getConversationId(): string | null {
  return sessionStorage.getItem(CONVERSATION_ID_KEY)
}

export function setConversationId(conversationId: string): void {
  sessionStorage.setItem(CONVERSATION_ID_KEY, conversationId)
}

export function clearConversationId(): void {
  sessionStorage.removeItem(CONVERSATION_ID_KEY)
}
