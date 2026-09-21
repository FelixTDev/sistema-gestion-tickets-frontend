import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ApiError } from '../../lib/api-client'
import { useAuth } from '../auth/auth-provider'
import { clearConversationId, getConversationId, isConversationId, setConversationId } from './chatbot-storage'
import {
  conversationQueryKey,
  useConversationQuery,
  useCreateConversationMutation,
  useEscalateConversationMutation,
  useFeedbackConversationMutation,
  useLinkConversationMutation,
  useResetConversationMutation,
  useSendMessageMutation,
} from './hooks/use-chat-conversation'
import { chatMessageSchema } from './schemas/chat-message-schema'
import type { ConversationRead, SendMessageResponse } from './types/chatbot-types'

interface ChatbotContextValue {
  conversation: ConversationRead | null
  draft: string
  error: string | null
  validationError: string | null
  isRestoring: boolean
  isCreating: boolean
  isSending: boolean
  isResetting: boolean
  isEscalating: boolean
  isSendingFeedback: boolean
  offersTicket: boolean
  resolved: boolean
  lastResponse: SendMessageResponse | null
  feedbackSubmitted: boolean
  canUseChatbot: boolean
  setDraft: (value: string) => void
  sendMessage: () => Promise<void>
  startNewConversation: () => Promise<void>
  resetCurrentConversation: () => Promise<void>
  escalateConversation: (reason?: string | null) => Promise<void>
  sendFeedback: (isHelpful: boolean, escalationAccepted?: boolean | null, reason?: string | null) => Promise<void>
  clearConversationAfterTicket: (conversationId: string) => void
  retry: () => void
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null)

function isNonChatbotPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/registro' ||
    pathname === '/recuperar-contrasena' ||
    pathname === '/personal/login' ||
    pathname === '/design-system' ||
    pathname === '/personal' ||
    pathname.startsWith('/personal/') ||
    pathname === '/panel' ||
    pathname.startsWith('/panel/')
  )
}

function isUnavailableError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
}

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()
  const [conversationId, setCurrentConversationId] = useState(getConversationId)
  const [draft, setDraft] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [offersTicket, setOffersTicket] = useState(false)
  const [resolved, setResolved] = useState(false)
  const [lastResponse, setLastResponse] = useState<SendMessageResponse | null>(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [readyClientConversationId, setReadyClientConversationId] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const [linkRetryNonce, setLinkRetryNonce] = useState(0)
  const linkAttempts = useRef(new Set<string>())
  const isStaff = user?.role === 'ASESOR' || user?.role === 'SUPERVISOR'
  const canUseChatbot = !isAuthLoading && !isStaff && !isNonChatbotPath(pathname)
  const requiresLink = user?.role === 'CLIENTE' && conversationId !== null && readyClientConversationId !== conversationId
  const conversationQuery = useConversationQuery(conversationId, canUseChatbot && !requiresLink && !isLinking)
  const createMutation = useCreateConversationMutation()
  const sendMutation = useSendMessageMutation()
  const linkMutation = useLinkConversationMutation()
  const resetMutation = useResetConversationMutation()
  const escalateMutation = useEscalateConversationMutation()
  const feedbackMutation = useFeedbackConversationMutation()

  function clearCurrentConversation(): void {
    if (conversationId) queryClient.removeQueries({ queryKey: conversationQueryKey(conversationId) })
    clearConversationId()
    setCurrentConversationId(null)
    setReadyClientConversationId(null)
    setOffersTicket(false)
    setResolved(false)
    setLastResponse(null)
    setFeedbackSubmitted(false)
  }

  useEffect(() => {
    if (!conversationQuery.error || !isUnavailableError(conversationQuery.error)) return
    clearCurrentConversation()
  }, [conversationQuery.error])

  useEffect(() => {
    const restored = conversationQuery.data
    if (!restored || isConversationId(restored.id)) return
    clearCurrentConversation()
    setOperationError('No pudimos recuperar la conversación.')
  }, [conversationQuery.data])

  useEffect(() => {
    if (!canUseChatbot || user?.role !== 'CLIENTE' || !conversationId || readyClientConversationId === conversationId) return
    const attemptKey = `${user.id}:${conversationId}`
    if (linkAttempts.current.has(attemptKey)) return
    linkAttempts.current.add(attemptKey)
    let isActive = true
    const controller = new AbortController()
    setIsLinking(true)
    void queryClient.cancelQueries({ queryKey: conversationQueryKey(conversationId) })
      .then(() => linkMutation.mutateAsync({ conversationId, signal: controller.signal }))
      .then((linked) => {
        if (!isActive) return
        if (!isConversationId(linked.id) || linked.id !== conversationId) throw new Error('El servicio devolvió una asociación inválida.')
        queryClient.setQueryData<ConversationRead>(conversationQueryKey(conversationId), (current) => current ? { ...current, user_id: linked.user_id, status: linked.status } : current)
        setReadyClientConversationId(conversationId)
      })
      .catch((error: unknown) => {
        if (!isActive || isAbortError(error)) return
        linkAttempts.current.delete(attemptKey)
        if (isUnavailableError(error)) clearCurrentConversation()
        else setOperationError('No pudimos asociar la conversación. Podrás intentarlo nuevamente más tarde.')
      })
      .finally(() => { if (isActive) setIsLinking(false) })
    return () => {
      isActive = false
      controller.abort()
      linkAttempts.current.delete(attemptKey)
    }
  }, [canUseChatbot, conversationId, linkRetryNonce, queryClient, readyClientConversationId, user])

  async function createAndSelectConversation(): Promise<ConversationRead> {
    const created = await createMutation.mutateAsync()
    if (!isConversationId(created.id)) throw new Error('El servicio devolvió un identificador de conversación inválido.')
    setConversationId(created.id)
    setCurrentConversationId(created.id)
    setReadyClientConversationId(user?.role === 'CLIENTE' ? created.id : null)
    queryClient.setQueryData(conversationQueryKey(created.id), created)
    setOffersTicket(false)
    setResolved(false)
    setLastResponse(null)
    setFeedbackSubmitted(false)
    return created
  }

  async function sendMessage(): Promise<void> {
    if (!canUseChatbot) return
    const parsed = chatMessageSchema.safeParse(draft)
    if (!parsed.success) { setValidationError(parsed.error.issues[0]?.message ?? 'Consulta inválida.'); return }
    setValidationError(null)
    setOperationError(null)
    try {
      const target = conversationId ? { id: conversationId } : await createAndSelectConversation()
      const response = await sendMutation.mutateAsync({ conversationId: target.id, content: parsed.data })
      queryClient.setQueryData<ConversationRead>(conversationQueryKey(target.id), (current) => ({
        ...(current ?? emptyConversation(target.id)),
        messages: [...(current?.messages ?? []), response.user_message, response.bot_message],
        status: response.conversation_status ?? current?.status ?? 'ACTIVE',
        last_confidence: response.confidence ?? current?.last_confidence ?? null,
        last_faq_id: response.faq_id ?? current?.last_faq_id ?? null,
      }))
      setOffersTicket(response.offers_ticket)
      setResolved(response.resolved)
      setLastResponse(response)
      setFeedbackSubmitted(false)
      setDraft('')
    } catch { setOperationError('No pudimos enviar tu consulta. Inténtalo nuevamente.') }
  }

  async function resetCurrentConversation(): Promise<void> {
    if (!canUseChatbot) return
    if (!conversationId) {
      await startNewConversation()
      return
    }
    const previousConversationId = conversationId
    clearCurrentConversation()
    setDraft('')
    setValidationError(null)
    setOperationError(null)
    try {
      // The reset endpoint returns the existing transcript. It is only a server-side
      // lifecycle action here; never put that response back in the active cache.
      await resetMutation.mutateAsync(previousConversationId)
      await createAndSelectConversation()
    } catch { setOperationError('No pudimos reiniciar la conversación. Inténtalo nuevamente.') }
  }

  async function startNewConversation(): Promise<void> {
    if (!canUseChatbot) return
    setOperationError(null)
    try { await createAndSelectConversation() }
    catch { setOperationError('No pudimos iniciar una nueva conversación.') }
  }

  async function escalateConversation(reason?: string | null): Promise<void> {
    if (!canUseChatbot || !conversationId) return
    setOperationError(null)
    try {
      const escalated = await escalateMutation.mutateAsync({ conversationId, reason })
      queryClient.setQueryData(conversationQueryKey(conversationId), escalated)
      setOffersTicket(true)
    } catch { setOperationError('No pudimos escalar la conversación. Inténtalo nuevamente.') }
  }

  async function sendFeedback(isHelpful: boolean, escalationAccepted?: boolean | null, reason?: string | null): Promise<void> {
    if (!canUseChatbot || !conversationId) return
    setOperationError(null)
    try {
      await feedbackMutation.mutateAsync({ conversationId, isHelpful, escalationAccepted, reason })
      setFeedbackSubmitted(true)
    } catch { setOperationError('No pudimos registrar tu valoración. Inténtalo nuevamente.') }
  }

  function clearConversationAfterTicket(convertedConversationId: string): void {
    if (conversationId === convertedConversationId) clearCurrentConversation()
  }

  const conversation = conversationId ? queryClient.getQueryData<ConversationRead>(conversationQueryKey(conversationId)) ?? conversationQuery.data ?? null : null
  const error = operationError ?? (conversationQuery.isError && !isUnavailableError(conversationQuery.error) ? 'No pudimos recuperar la conversación.' : null)
  const value = useMemo<ChatbotContextValue>(() => ({
    conversation, draft, error, validationError,
    isRestoring: conversationQuery.isLoading || isLinking,
    isCreating: createMutation.isPending,
    isSending: sendMutation.isPending,
    isResetting: resetMutation.isPending,
    isEscalating: escalateMutation.isPending,
    isSendingFeedback: feedbackMutation.isPending,
    offersTicket, resolved, lastResponse, feedbackSubmitted, canUseChatbot, setDraft, sendMessage, startNewConversation, resetCurrentConversation, escalateConversation, sendFeedback, clearConversationAfterTicket,
    retry: () => {
      setOperationError(null)
      if (user?.role === 'CLIENTE' && conversationId && readyClientConversationId !== conversationId) {
        setLinkRetryNonce((current) => current + 1)
      } else {
        void conversationQuery.refetch()
      }
    },
  }), [canUseChatbot, conversation, conversationId, conversationQuery, createMutation.isPending, draft, error, escalateMutation.isPending, feedbackMutation.isPending, feedbackSubmitted, isLinking, lastResponse, offersTicket, readyClientConversationId, resetMutation.isPending, resolved, sendMutation.isPending, user, validationError])

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
}

function emptyConversation(id: string): ConversationRead {
  return { id, user_id: null, status: 'ACTIVE', started_at: new Date().toISOString(), ended_at: null, messages: [] }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChatbot(): ChatbotContextValue {
  const context = useContext(ChatbotContext)
  if (!context) throw new Error('useChatbot debe utilizarse dentro de ChatbotProvider')
  return context
}
