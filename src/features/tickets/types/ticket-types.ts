export type TicketPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'
export type TicketStatus = 'NUEVO' | 'ASIGNADO' | 'EN_PROCESO' | 'PENDIENTE_CLIENTE' | 'RESUELTO' | 'CERRADO' | 'CANCELADO'
export type TicketSource = 'CHATBOT' | 'MANUAL'

export interface TicketCreate {
  category_id: string
  subject: string
  description: string
  priority: TicketPriority
}

export interface TicketRead {
  id: string
  tracking_code: string
  client_id: string
  conversation_id: string | null
  category_id: string
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  source: TicketSource
  assigned_advisor_id: string | null
  created_at: string
  assigned_at: string | null
  resolved_at: string | null
  closed_at: string | null
  cancelled_at: string | null
}

export interface CommentCreate {
  content: string
}

export interface CommentRead {
  id: string
  ticket_id: string
  author_id: string
  content: string
  created_at: string
}

export interface HistoryRead {
  id: string
  ticket_id: string
  actor_id: string | null
  action: string
  old_value: string | null
  new_value: string | null
  description: string
  created_at: string
}

export interface TicketStatusChange {
  status: TicketStatus
  reason: string | null
}

export interface ReasonRequest {
  reason: string
}

export interface AssignmentCreate {
  advisor_id: string
}

export interface TicketListFilters {
  status: TicketStatus | ''
  category_id: string
  priority: TicketPriority | ''
  created_from: string
  created_to: string
}
