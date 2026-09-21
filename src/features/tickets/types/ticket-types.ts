export type TicketPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'
export type TicketStatus = 'NUEVO' | 'ASIGNADO' | 'EN_PROCESO' | 'PENDIENTE_CLIENTE' | 'RESUELTO' | 'CERRADO' | 'CANCELADO'
export type TicketSource = 'CHATBOT' | 'MANUAL'
export type OperationalQueue = 'assigned_to_me' | 'unassigned' | 'assigned_to_advisor' | 'sla_soon' | 'sla_overdue' | 'pending_first_response' | 'recently_updated'
export type SlaStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'BREACHED' | 'CANCELLED'
export type AttachmentStatus = 'ACTIVE' | 'DELETED'

export interface PaginatedResponse<T> {
  page: number
  page_size: number
  total: number
  total_pages: number
  items: T[]
}

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
  updated_at?: string
  version?: number
  assigned_at: string | null
  resolved_at: string | null
  closed_at: string | null
  cancelled_at: string | null
}

export interface CommentCreate {
  content: string
  expected_version?: number | null
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
  expected_version?: number | null
}

export interface ReasonRequest {
  reason: string
  expected_version?: number | null
}

export interface AssignmentCreate {
  advisor_id: string
  expected_version?: number | null
}

export interface TicketListFilters {
  status: TicketStatus | ''
  category_id: string
  priority: TicketPriority | ''
  created_from: string
  created_to: string
  search?: string
  source?: TicketSource | ''
  updated_from?: string
  updated_to?: string
  page?: number
  page_size?: number
  queue?: OperationalQueue
  advisor_id?: string
  assigned_advisor_id?: string
  recent_hours?: number
}

export interface TicketSlaRead {
  id: string
  ticket_id: string
  policy_id: string
  policy_priority?: TicketPriority | null
  policy_category_id?: string | null
  policy_source?: TicketSource | null
  policy_timezone_name: string
  policy_calendar_name: string
  started_at: string
  first_response_due_at: string
  resolution_due_at: string
  first_responded_at: string | null
  first_response_within_sla: boolean | null
  first_response_warning_sent_at: string | null
  resolution_warning_sent_at: string | null
  first_response_breached_at: string | null
  resolved_at: string | null
  paused_at: string | null
  total_paused_seconds: number
  status: SlaStatus
  warning_sent_at: string | null
  warning_stage: string | null
  breached_at: string | null
  resolution_breached_at: string | null
  completed_within_sla: boolean | null
  reopen_count: number
  created_at: string
  updated_at: string
}

export interface SlaActionRequest {
  reason: string
}

export interface AttachmentRead {
  id: string
  ticket_id: string
  comment_id: string | null
  uploaded_by_user_id: string
  original_filename: string
  mime_type_declared: string
  mime_type_detected: string
  file_size: number
  sha256: string
  status: AttachmentStatus
  created_at: string
  deleted_at: string | null
}
