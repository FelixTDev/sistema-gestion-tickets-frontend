export interface AuditRead {
  id: string
  event_type: string
  action: string
  actor_user_id: string | null
  actor_role: string | null
  resource_type: string
  resource_id: string | null
  target_user_id: string | null
  occurred_at: string
  success: boolean
  error_code: string | null
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  request_id: string | null
  correlation_id: string | null
}

export interface AuditPage {
  page: number
  page_size: number
  total: number
  total_pages: number
  items: AuditRead[]
}

export interface AuditFilters {
  page?: number
  page_size?: number
  actor_user_id?: string
  resource_type?: string
  resource_id?: string
  event_type?: string
  action?: string
  target_user_id?: string
  from?: string
  to?: string
  success?: boolean
  search?: string
}
