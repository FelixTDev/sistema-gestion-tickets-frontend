export interface ChatMessageRead {
  id: string
  sender_type: string
  content: string
  intent: string | null
  confidence: number | null
  created_at: string
}

export interface ConversationRead {
  id: string
  user_id: string | null
  status: string
  started_at: string
  ended_at: string | null
  messages: ChatMessageRead[]
}

export interface SendMessageRequest {
  content: string
}

export interface SendMessageResponse {
  user_message: ChatMessageRead
  bot_message: ChatMessageRead
  resolved: boolean
  offers_ticket: boolean
}

export interface LinkConversationResponse {
  id: string
  user_id: string
  status: string
}
