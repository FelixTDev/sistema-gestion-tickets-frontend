import { apiClient } from '../../../lib/api-client'
import type { CommentCreate, CommentRead, HistoryRead, TicketCreate, TicketRead } from '../types/ticket-types'

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

export function convertConversationToTicket(conversationId: string, data: TicketCreate): Promise<TicketRead> {
  return apiClient.post<TicketRead>(`/chat/conversations/${conversationId}/convert-to-ticket`, data)
}
