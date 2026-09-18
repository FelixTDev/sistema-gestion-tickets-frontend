import { apiClient } from '../../../lib/api-client'
import type { CommentCreate, CommentRead, HistoryRead, ReasonRequest, TicketCreate, TicketListFilters, TicketRead, TicketStatusChange, AssignmentCreate } from '../types/ticket-types'
import type { AuthUser } from '../../../types/auth'
import { assertSafePathSegment } from '../../../lib/identifiers'

function ticketPath(ticketId: string): string {
  assertSafePathSegment(ticketId, 'Identificador del ticket')
  return ticketId
}

export function listMyTickets(): Promise<TicketRead[]> {
  return apiClient.get<TicketRead[]>('/tickets/mine')
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

export function listTickets(filters: TicketListFilters): Promise<TicketRead[]> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.category_id) params.set('category_id', filters.category_id)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.created_from) params.set('created_from', filters.created_from)
  if (filters.created_to) params.set('created_to', filters.created_to)
  const query = params.toString()
  return apiClient.get<TicketRead[]>(query ? `/tickets?${query}` : '/tickets')
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

export async function convertConversationToTicket(conversationId: string, data: TicketCreate): Promise<TicketRead> {
  assertSafePathSegment(conversationId, 'Identificador de conversación')
  return apiClient.post<TicketRead>(`/chat/conversations/${conversationId}/convert-to-ticket`, data)
}
