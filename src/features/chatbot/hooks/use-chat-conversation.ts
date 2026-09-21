import { useMutation, useQuery } from '@tanstack/react-query'
import {
  convertConversationToTicket,
  createConversation,
  escalateConversation,
  feedbackConversation,
  getConversation,
  linkConversationToUser,
  resetConversation,
  sendConversationMessage,
} from '../api/chatbot-api'
import { isUuid } from '../../../lib/identifiers'
import type { TicketCreate } from '../../tickets/types/ticket-types'

export const conversationQueryKey = (conversationId: string) => ['chat-conversation', conversationId] as const

export function useConversationQuery(conversationId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: conversationQueryKey(conversationId ?? 'none'),
    queryFn: ({ signal }) => getConversation(conversationId!, signal),
    enabled: enabled && conversationId !== null && isUuid(conversationId),
    retry: false,
    staleTime: 30_000,
  })
}

export function useCreateConversationMutation() {
  return useMutation({ mutationFn: createConversation })
}

export function useSendMessageMutation() {
  return useMutation({ mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) => sendConversationMessage(conversationId, content) })
}

export function useLinkConversationMutation() {
  return useMutation({ mutationFn: ({ conversationId, signal }: { conversationId: string; signal?: AbortSignal }) => linkConversationToUser(conversationId, signal) })
}

export function useEscalateConversationMutation() {
  return useMutation({ mutationFn: ({ conversationId, reason }: { conversationId: string; reason?: string | null }) => escalateConversation(conversationId, { reason }) })
}

export function useResetConversationMutation() {
  return useMutation({ mutationFn: resetConversation })
}

export function useFeedbackConversationMutation() {
  return useMutation({ mutationFn: ({ conversationId, isHelpful, escalationAccepted, reason }: { conversationId: string; isHelpful: boolean; escalationAccepted?: boolean | null; reason?: string | null }) => feedbackConversation(conversationId, { is_helpful: isHelpful, escalation_accepted: escalationAccepted, reason }) })
}

export function useConvertConversationToTicketMutation() {
  return useMutation({ mutationFn: ({ conversationId, payload }: { conversationId: string; payload: TicketCreate }) => convertConversationToTicket(conversationId, payload) })
}
