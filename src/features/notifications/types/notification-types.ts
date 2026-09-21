export type NotificationType = 'ticket_created' | 'ticket_status_changed' | 'ticket_assigned' | 'ticket_commented' | 'ticket_reopened' | 'ticket_closed' | 'password_changed' | 'security_event' | 'sla_warning' | 'sla_breached' | 'chat_escalated'

export type NotificationMetadataValue = string | number | boolean | null
export type NotificationRead = {
  id: string
  recipient_user_id: string
  type: NotificationType
  title: string
  message: string
  related_ticket_id?: string | null
  related_conversation_id?: string | null
  is_read: boolean
  created_at: string
  read_at?: string | null
  metadata?: Record<string, NotificationMetadataValue>
}

export type NotificationPage = {
  page: number
  page_size: number
  total: number
  total_pages: number
  items: NotificationRead[]
}

export type UnreadCountRead = { unread_count: number }
export type ReadAllResponse = { updated_count: number }
export type NotificationListParams = { page?: number; page_size?: number }
