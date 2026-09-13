import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTicketComment, convertConversationToTicket, createTicket, getTicket, getTicketHistory, listMyTickets } from '../api/ticket-api'
import type { CommentCreate, TicketCreate } from '../types/ticket-types'

export const ticketsQueryKey = ['client-tickets'] as const
export const ticketQueryKey = (ticketId: string) => ['ticket', ticketId] as const
export const ticketHistoryQueryKey = (ticketId: string) => ['ticket-history', ticketId] as const

export function useMyTickets() {
  return useQuery({ queryKey: ticketsQueryKey, queryFn: listMyTickets, retry: false })
}

export function useTicket(ticketId: string) {
  return useQuery({ queryKey: ticketQueryKey(ticketId), queryFn: () => getTicket(ticketId), retry: false, enabled: Boolean(ticketId) })
}

export function useTicketHistory(ticketId: string) {
  return useQuery({ queryKey: ticketHistoryQueryKey(ticketId), queryFn: () => getTicketHistory(ticketId), retry: false, enabled: Boolean(ticketId) })
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, conversationId }: { data: TicketCreate; conversationId: string | null }) => conversationId ? convertConversationToTicket(conversationId, data) : createTicket(data),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKey(ticket.id), ticket)
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKey })
    },
  })
}

export function useAddTicketCommentMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CommentCreate) => addTicketComment(ticketId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketQueryKey(ticketId) })
      void queryClient.invalidateQueries({ queryKey: ticketHistoryQueryKey(ticketId) })
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKey })
    },
  })
}
