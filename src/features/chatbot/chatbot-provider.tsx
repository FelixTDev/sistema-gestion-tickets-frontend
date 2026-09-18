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
  useLinkConversationMutation,
  useSendMessageMutation,
} from './hooks/use-chat-conversation'
import { chatMessageSchema } from './schemas/chat-message-schema'
import type { ConversationRead } from './types/chatbot-types'

interface ChatbotContextValue {
  conversation: ConversationRead | null
  draft: string
  error: string | null
  validationError: string | null
  isRestoring: boolean
  isCreating: boolean
  isSending: boolean
  offersTicket: boolean
  resolved: boolean
  canUseChatbot: boolean
  setDraft: (value: string) => void
  sendMessage: () => Promise<void>
  startNewConversation: () => Promise<void>
  clearConversationAfterTicket: (conversationId: string) => void
  retry: () => void
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null)

function isInternalPath(pathname: string): boolean {
  return pathname === '/design-system' || pathname === '/personal' || pathname.startsWith('/personal/') || pathname === '/panel' || pathname.startsWith('/panel/')
}

function isUnavailableError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
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
  const [readyClientConversationId, setReadyClientConversationId] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const [linkRetryNonce, setLinkRetryNonce] = useState(0)
  const linkAttempts = useRef(new Set<string>())
  const isStaff = user?.role === 'ASESOR' || user?.role === 'SUPERVISOR'
  const canUseChatbot = !isAuthLoading && !isStaff && !isInternalPath(pathname)
  const requiresLink = user?.role === 'CLIENTE' && conversationId !== null && readyClientConversationId !== conversationId
  const conversationQuery = useConversationQuery(conversationId, canUseChatbot && !requiresLink && !isLinking)
  const createMutation = useCreateConversationMutation()
  const sendMutation = useSendMessageMutation()
  const linkMutation = useLinkConversationMutation()

  function clearCurrentConversation(): void {
    if (conversationId) queryClient.removeQueries({ queryKey: conversationQueryKey(conversationId) })
    clearConversationId()
    setCurrentConversationId(null)
    setReadyClientConversationId(null)
    setOffersTicket(false)
    setResolved(false)
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
    setIsLinking(true)
    void queryClient.cancelQueries({ queryKey: conversationQueryKey(conversationId) })
      .then(() => linkMutation.mutateAsync(conversationId))
      .then((linked) => {
        if (!isActive) return
        if (!isConversationId(linked.id) || linked.id !== conversationId) throw new Error('El servicio devolvió una asociación inválida.')
        queryClient.setQueryData<ConversationRead>(conversationQueryKey(conversationId), (current) => current ? { ...current, user_id: linked.user_id, status: linked.status } : current)
        setReadyClientConversationId(conversationId)
      })
      .catch((error: unknown) => {
        if (!isActive) return
        linkAttempts.current.delete(attemptKey)
        if (isUnavailableError(error)) clearCurrentConversation()
        else setOperationError('No pudimos asociar la conversación. Podrás intentarlo nuevamente más tarde.')
      })
      .finally(() => { if (isActive) setIsLinking(false) })
    return () => {
      isActive = false
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
      }))
      setOffersTicket(response.offers_ticket)
      setResolved(response.resolved)
      setDraft('')
    } catch { setOperationError('No pudimos enviar tu consulta. Inténtalo nuevamente.') }
  }

  async function startNewConversation(): Promise<void> {
    if (!canUseChatbot) return
    setOperationError(null)
    try { await createAndSelectConversation() }
    catch { setOperationError('No pudimos iniciar una nueva conversación.') }
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
    offersTicket, resolved, canUseChatbot, setDraft, sendMessage, startNewConversation, clearConversationAfterTicket,
    retry: () => {
      setOperationError(null)
      if (user?.role === 'CLIENTE' && conversationId && readyClientConversationId !== conversationId) {
        setLinkRetryNonce((current) => current + 1)
      } else {
        void conversationQuery.refetch()
      }
    },
  }), [canUseChatbot, conversation, conversationId, conversationQuery, createMutation.isPending, draft, error, isLinking, offersTicket, readyClientConversationId, resolved, sendMutation.isPending, user, validationError])

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
