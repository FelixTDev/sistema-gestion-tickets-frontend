export interface ChatMessageRead {
  id: string
  sender_type: string
  content: string
  intent: string | null
  confidence: number | null
  faq_id?: string | null
  response_source?: string | null
  created_at: string
}

export interface ConversationRead {
  id: string
  user_id: string | null
  status: string
  started_at: string
  ended_at: string | null
  detected_intent?: string | null
  last_faq_id?: string | null
  category_id?: string | null
  pending_question?: string | null
  turn_count?: number
  last_confidence?: number | null
  escalation_reason?: string | null
  escalated_at?: string | null
  converted_at?: string | null
  last_activity_at?: string | null
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
  confidence?: number
  faq_id?: string | null
  source_category?: string | null
  requires_clarification?: boolean
  clarification_options?: string[]
  fallback_reason?: string | null
  conversation_status?: string
  response_source?: string
  sources?: Array<Record<string, string | null>>
}

export interface ConversationActionRequest {
  reason?: string | null
}

export interface ChatFeedbackCreate {
  is_helpful: boolean
  escalation_accepted?: boolean | null
  reason?: string | null
}

export interface ChatFeedbackRead {
  id: string
  is_helpful: boolean
  escalation_accepted?: boolean | null
  created_at: string
}

export interface LinkConversationResponse {
  id: string
  user_id: string
  status: string
}
