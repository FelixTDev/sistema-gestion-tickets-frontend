import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createConversation,
  getConversation,
  linkConversationToUser,
  sendConversationMessage,
} from '../api/chatbot-api'
import { isUuid } from '../../../lib/identifiers'

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
  return useMutation({ mutationFn: linkConversationToUser })
}
