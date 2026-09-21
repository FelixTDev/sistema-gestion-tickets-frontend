import { apiClient } from '../../../lib/api-client'
import type { CommentCreate, CommentRead, HistoryRead, ReasonRequest, TicketCreate, TicketListFilters, TicketRead, TicketStatusChange, AssignmentCreate, AttachmentRead, PaginatedResponse, SlaActionRequest, TicketSlaRead } from '../types/ticket-types'
import type { AuthUser } from '../../../types/auth'
import { assertSafePathSegment } from '../../../lib/identifiers'
import type { DownloadResponse } from '../../../lib/api-client'

function ticketPath(ticketId: string): string {
  assertSafePathSegment(ticketId, 'Identificador del ticket')
  return ticketId
}

type TicketCollection = TicketRead[] | PaginatedResponse<TicketRead>

function ticketQuery(filters: Partial<TicketListFilters>): string {
  const params = new URLSearchParams()
  const values: Array<[string, string | number | undefined]> = [
    ['status', filters.status], ['category_id', filters.category_id], ['priority', filters.priority],
    ['created_from', filters.created_from], ['created_to', filters.created_to], ['source', filters.source],
    ['search', filters.search], ['updated_from', filters.updated_from], ['updated_to', filters.updated_to],
    ['queue', filters.queue], ['advisor_id', filters.advisor_id], ['assigned_advisor_id', filters.assigned_advisor_id], ['recent_hours', filters.recent_hours],
    ['page', filters.page], ['page_size', filters.page_size],
  ]
  values.forEach(([key, value]) => {
    if (value === undefined || value === '') return
    if ((key === 'page' && value === 1) || (key === 'page_size' && value === 20)) return
    params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function listMyTickets(filters: Partial<TicketListFilters> = {}): Promise<TicketCollection> {
  return apiClient.get<TicketCollection>(`/tickets/mine${ticketQuery(filters)}`)
}

export function createTicket(data: TicketCreate): Promise<TicketRead> {
  return apiClient.post<TicketRead>('/tickets', data)
}

export async function getTicket(ticketId: string): Promise<TicketRead> {
  return apiClient.get<TicketRead>(`/tickets/${ticketPath(ticketId)}`)
}

export async function getTicketHistory(ticketId: string): Promise<HistoryRead[]> {
  return apiClient.get<HistoryRead[]>(`/tickets/${ticketPath(ticketId)}/history`)
}

export async function addTicketComment(ticketId: string, data: CommentCreate): Promise<CommentRead> {
  return apiClient.post<CommentRead>(`/tickets/${ticketPath(ticketId)}/comments`, data)
}

export async function getTicketComments(ticketId: string): Promise<CommentRead[]> {
  return apiClient.get<CommentRead[]>(`/tickets/${ticketPath(ticketId)}/comments`)
}

export function listTickets(filters: Partial<TicketListFilters> = {}): Promise<TicketCollection> {
  return apiClient.get<TicketCollection>(`/tickets${ticketQuery(filters)}`)
}

export function listOperationalTickets(filters: Partial<TicketListFilters> & Pick<TicketListFilters, 'queue'>): Promise<TicketCollection> {
  return apiClient.get<TicketCollection>(`/tickets/operations${ticketQuery(filters)}`)
}

export async function changeTicketStatus(ticketId: string, data: TicketStatusChange): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketPath(ticketId)}/status`, data)
}

export async function closeTicket(ticketId: string): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketPath(ticketId)}/close`, {})
}

export async function reopenTicket(ticketId: string, data: ReasonRequest): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketPath(ticketId)}/reopen`, data)
}

export async function cancelTicket(ticketId: string, data: ReasonRequest): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketPath(ticketId)}/cancel`, data)
}

export function listAdvisors(): Promise<AuthUser[]> {
  return apiClient.get<AuthUser[]>('/users/advisors')
}

export async function assignTicket(ticketId: string, data: AssignmentCreate): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketPath(ticketId)}/assignments`, data)
}

export async function takeTicket(ticketId: string): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketPath(ticketId)}/take`, {})
}

export async function releaseTicket(ticketId: string): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketPath(ticketId)}/release`, {})
}

export function getTicketSla(ticketId: string): Promise<TicketSlaRead> {
  return apiClient.get<TicketSlaRead>(`/tickets/${ticketPath(ticketId)}/sla`)
}

export function pauseTicketSla(ticketId: string, data: SlaActionRequest): Promise<TicketSlaRead> {
  return apiClient.post<TicketSlaRead>(`/tickets/${ticketPath(ticketId)}/sla/pause`, data)
}

export function resumeTicketSla(ticketId: string): Promise<TicketSlaRead> {
  return apiClient.post<TicketSlaRead>(`/tickets/${ticketPath(ticketId)}/sla/resume`, {})
}

export function listAttachments(ticketId: string): Promise<AttachmentRead[]> {
  return apiClient.get<AttachmentRead[]>(`/tickets/${ticketPath(ticketId)}/attachments`)
}

export function uploadAttachment(ticketId: string, file: File, commentId?: string): Promise<AttachmentRead> {
  const formData = new FormData()
  formData.append('file', file)
  if (commentId) formData.append('comment_id', commentId)
  return apiClient.postForm<AttachmentRead>(`/tickets/${ticketPath(ticketId)}/attachments`, formData)
}

export function downloadAttachment(attachmentId: string): Promise<DownloadResponse> {
  assertSafePathSegment(attachmentId, 'Identificador del adjunto')
  return apiClient.download(`/attachments/${attachmentId}/download`)
}

export function markAttachmentDeleted(attachmentId: string): Promise<AttachmentRead> {
  assertSafePathSegment(attachmentId, 'Identificador del adjunto')
  return apiClient.delete<AttachmentRead>(`/attachments/${attachmentId}`)
}

export async function convertConversationToTicket(conversationId: string, data: TicketCreate): Promise<TicketRead> {
  assertSafePathSegment(conversationId, 'Identificador de conversación')
  return apiClient.post<TicketRead>(`/chat/conversations/${conversationId}/convert-to-ticket`, data)
}
