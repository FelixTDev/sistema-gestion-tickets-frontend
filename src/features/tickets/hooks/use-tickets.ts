import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTicketComment, assignTicket, cancelTicket, changeTicketStatus, closeTicket, convertConversationToTicket, createTicket, getTicket, getTicketComments, getTicketHistory, listAdvisors, listMyTickets, listTickets, reopenTicket } from '../api/ticket-api'
import type { CommentCreate, ReasonRequest, TicketCreate, TicketListFilters, TicketStatusChange, TicketRead } from '../types/ticket-types'

export const ticketsQueryKey = ['client-tickets'] as const
export const ticketQueryKey = (ticketId: string) => ['ticket', ticketId] as const
export const ticketHistoryQueryKey = (ticketId: string) => ['ticket-history', ticketId] as const
export const ticketCommentsQueryKey = (ticketId: string) => ['ticket-comments', ticketId] as const
export const operationalTicketsQueryKey = (filters: TicketListFilters) => ['operational-tickets', filters] as const

export function useMyTickets() {
  return useQuery({ queryKey: ticketsQueryKey, queryFn: listMyTickets, retry: false })
}

export function useTicket(ticketId: string) {
  return useQuery({ queryKey: ticketQueryKey(ticketId), queryFn: () => getTicket(ticketId), retry: false, enabled: Boolean(ticketId) })
}

export function useTicketHistory(ticketId: string) {
  return useQuery({ queryKey: ticketHistoryQueryKey(ticketId), queryFn: () => getTicketHistory(ticketId), retry: false, enabled: Boolean(ticketId) })
}

export function useTicketComments(ticketId: string) {
  return useQuery({ queryKey: ticketCommentsQueryKey(ticketId), queryFn: () => getTicketComments(ticketId), retry: false, enabled: Boolean(ticketId) })
}

export function useOperationalTickets(filters: TicketListFilters) {
  return useQuery({ queryKey: operationalTicketsQueryKey(filters), queryFn: () => listTickets(filters), retry: false })
}

export const advisorsQueryKey = ['advisors'] as const
export function useAdvisors(enabled = true) { return useQuery({ queryKey: advisorsQueryKey, queryFn: listAdvisors, retry: false, enabled }) }

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
      void queryClient.invalidateQueries({ queryKey: ticketCommentsQueryKey(ticketId) })
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKey })
    },
  })
}

function useTicketOperation<TVariables>(mutationFn: (variables: TVariables) => Promise<TicketRead>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKey(ticket.id), ticket)
      void queryClient.invalidateQueries({ queryKey: ticketHistoryQueryKey(ticket.id) })
      void queryClient.invalidateQueries({ queryKey: ticketCommentsQueryKey(ticket.id) })
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['operational-tickets'] })
    },
  })
}

export function useChangeTicketStatusMutation(ticketId: string) {
  return useTicketOperation((data: TicketStatusChange) => changeTicketStatus(ticketId, data))
}

export function useCloseTicketMutation(ticketId: string) {
  return useTicketOperation(() => closeTicket(ticketId))
}

export function useReopenTicketMutation(ticketId: string) {
  return useTicketOperation((data: ReasonRequest) => reopenTicket(ticketId, data))
}

export function useCancelTicketMutation(ticketId: string) {
  return useTicketOperation((data: ReasonRequest) => cancelTicket(ticketId, data))
}

export function useAssignTicketMutation(ticketId: string) {
  return useTicketOperation((data: { advisor_id: string }) => assignTicket(ticketId, data))
}
