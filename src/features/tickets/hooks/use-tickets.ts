import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addTicketComment,
  assignTicket,
  cancelTicket,
  changeTicketStatus,
  closeTicket,
  convertConversationToTicket,
  createTicket,
  downloadAttachment,
  getTicket,
  getTicketComments,
  getTicketHistory,
  getTicketSla,
  listAttachments,
  listAdvisors,
  listMyTickets,
  listOperationalTickets,
  markAttachmentDeleted,
  pauseTicketSla,
  releaseTicket,
  reopenTicket,
  resumeTicketSla,
  takeTicket,
  uploadAttachment,
} from '../api/ticket-api'
import type { AssignmentCreate, CommentCreate, PaginatedResponse, ReasonRequest, SlaActionRequest, TicketCreate, TicketListFilters, TicketRead, TicketSlaRead, TicketStatusChange } from '../types/ticket-types'
import { isUuid } from '../../../lib/identifiers'

export const ticketsQueryKey = ['client-tickets'] as const
export const clientTicketsQueryKey = (filters: Partial<TicketListFilters>) => [...ticketsQueryKey, filters] as const
export const ticketQueryKey = (ticketId: string) => ['ticket', ticketId] as const
export const ticketHistoryQueryKey = (ticketId: string) => ['ticket-history', ticketId] as const
export const ticketCommentsQueryKey = (ticketId: string) => ['ticket-comments', ticketId] as const
export const operationalTicketsQueryKey = (filters: TicketListFilters) => ['operational-tickets', filters] as const
export const ticketSlaQueryKey = (ticketId: string) => ['ticket-sla', ticketId] as const
export const ticketAttachmentsQueryKey = (ticketId: string) => ['ticket-attachments', ticketId] as const

export type TicketCollection = TicketRead[] | PaginatedResponse<TicketRead>

export function ticketItems(data: TicketCollection | undefined): TicketRead[] {
  return Array.isArray(data) ? data : data?.items ?? []
}

export function pageData(data: TicketCollection | undefined): PaginatedResponse<TicketRead> | null {
  return data && !Array.isArray(data) ? data : null
}

export function useMyTickets(filters: Partial<TicketListFilters> = {}) {
  return useQuery({ queryKey: clientTicketsQueryKey(filters), queryFn: () => listMyTickets(filters), retry: false })
}

export function useTicket(ticketId: string) {
  return useQuery({ queryKey: ticketQueryKey(ticketId), queryFn: () => getTicket(ticketId), retry: false, enabled: isUuid(ticketId) })
}

export function useTicketHistory(ticketId: string) {
  return useQuery({ queryKey: ticketHistoryQueryKey(ticketId), queryFn: () => getTicketHistory(ticketId), retry: false, enabled: isUuid(ticketId) })
}

export function useTicketComments(ticketId: string) {
  return useQuery({ queryKey: ticketCommentsQueryKey(ticketId), queryFn: () => getTicketComments(ticketId), retry: false, enabled: isUuid(ticketId) })
}

export function useOperationalTickets(filters: TicketListFilters) {
  const queue = filters.queue ?? 'assigned_to_me'
  return useQuery({ queryKey: operationalTicketsQueryKey({ ...filters, queue }), queryFn: () => listOperationalTickets({ ...filters, queue }), retry: false })
}

export function useTicketSla(ticketId: string) {
  return useQuery({ queryKey: ticketSlaQueryKey(ticketId), queryFn: () => getTicketSla(ticketId), retry: false, enabled: isUuid(ticketId) })
}

export function useTicketAttachments(ticketId: string) {
  return useQuery({ queryKey: ticketAttachmentsQueryKey(ticketId), queryFn: () => listAttachments(ticketId), retry: false, enabled: isUuid(ticketId) })
}

export const advisorsQueryKey = ['advisors'] as const
export function useAdvisors(enabled = true) { return useQuery({ queryKey: advisorsQueryKey, queryFn: listAdvisors, retry: false, enabled }) }

export function useCreateTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, conversationId }: { data: TicketCreate; conversationId: string | null }) => conversationId ? convertConversationToTicket(conversationId, data) : createTicket(data),
    onSuccess: (ticket) => { queryClient.setQueryData(ticketQueryKey(ticket.id), ticket); void queryClient.invalidateQueries({ queryKey: ticketsQueryKey }) },
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
      void queryClient.invalidateQueries({ queryKey: ticketSlaQueryKey(ticketId) })
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
      void queryClient.invalidateQueries({ queryKey: ticketSlaQueryKey(ticket.id) })
      void queryClient.invalidateQueries({ queryKey: ticketsQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['operational-tickets'] })
      void queryClient.invalidateQueries({ queryKey: ['report'] })
    },
  })
}

export function useChangeTicketStatusMutation(ticketId: string) { return useTicketOperation((data: TicketStatusChange) => changeTicketStatus(ticketId, data)) }
export function useCloseTicketMutation(ticketId: string) { return useTicketOperation(() => closeTicket(ticketId)) }
export function useReopenTicketMutation(ticketId: string) { return useTicketOperation((data: ReasonRequest) => reopenTicket(ticketId, data)) }
export function useCancelTicketMutation(ticketId: string) { return useTicketOperation((data: ReasonRequest) => cancelTicket(ticketId, data)) }
export function useAssignTicketMutation(ticketId: string) { return useTicketOperation((data: AssignmentCreate) => assignTicket(ticketId, data)) }
export function useTakeTicketMutation(ticketId: string) { return useTicketOperation(() => takeTicket(ticketId)) }
export function useReleaseTicketMutation(ticketId: string) { return useTicketOperation(() => releaseTicket(ticketId)) }

export function usePauseTicketSlaMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (data: SlaActionRequest) => pauseTicketSla(ticketId, data), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ticketSlaQueryKey(ticketId) }) } })
}

export function useResumeTicketSlaMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: () => resumeTicketSla(ticketId), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ticketSlaQueryKey(ticketId) }) } })
}

export function useUploadAttachmentMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: ({ file, commentId }: { file: File; commentId?: string }) => uploadAttachment(ticketId, file, commentId), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ticketAttachmentsQueryKey(ticketId) }) } })
}

export function useDeleteAttachmentMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (attachmentId: string) => markAttachmentDeleted(attachmentId), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ticketAttachmentsQueryKey(ticketId) }) } })
}

export function useDownloadAttachment() {
  return useMutation({ mutationFn: (attachmentId: string) => downloadAttachment(attachmentId) })
}

export type SlaResponse = TicketSlaRead
