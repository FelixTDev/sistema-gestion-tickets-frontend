import { apiClient } from '../../../lib/api-client'
import type { CommentCreate, CommentRead, HistoryRead, ReasonRequest, TicketCreate, TicketListFilters, TicketRead, TicketStatusChange, AssignmentCreate } from '../types/ticket-types'
import type { AuthUser } from '../../../types/auth'

export function listMyTickets(): Promise<TicketRead[]> {
  return apiClient.get<TicketRead[]>('/tickets/mine')
}

export function createTicket(data: TicketCreate): Promise<TicketRead> {
  return apiClient.post<TicketRead>('/tickets', data)
}

export function getTicket(ticketId: string): Promise<TicketRead> {
  return apiClient.get<TicketRead>(`/tickets/${ticketId}`)
}

export function getTicketHistory(ticketId: string): Promise<HistoryRead[]> {
  return apiClient.get<HistoryRead[]>(`/tickets/${ticketId}/history`)
}

export function addTicketComment(ticketId: string, data: CommentCreate): Promise<CommentRead> {
  return apiClient.post<CommentRead>(`/tickets/${ticketId}/comments`, data)
}

export function getTicketComments(ticketId: string): Promise<CommentRead[]> {
  return apiClient.get<CommentRead[]>(`/tickets/${ticketId}/comments`)
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

export function changeTicketStatus(ticketId: string, data: TicketStatusChange): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketId}/status`, data)
}

export function closeTicket(ticketId: string): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketId}/close`, {})
}

export function reopenTicket(ticketId: string, data: ReasonRequest): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketId}/reopen`, data)
}

export function cancelTicket(ticketId: string, data: ReasonRequest): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketId}/cancel`, data)
}

export function listAdvisors(): Promise<AuthUser[]> {
  return apiClient.get<AuthUser[]>('/users/advisors')
}

export function assignTicket(ticketId: string, data: AssignmentCreate): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/tickets/${ticketId}/assignments`, data)
}

export function convertConversationToTicket(conversationId: string, data: TicketCreate): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/chat/conversations/${conversationId}/convert-to-ticket`, data)
}
