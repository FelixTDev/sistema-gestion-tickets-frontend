import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useChatbot } from '../../chatbot/chatbot-provider'
import { getConversationId } from '../../chatbot/chatbot-storage'
import { MessageList } from '../../chatbot/components/message-list'
import { useConversationQuery } from '../../chatbot/hooks/use-chat-conversation'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketForm } from '../components/ticket-form'
import { ticketQueryKey } from '../hooks/use-tickets'
import type { TicketRead } from '../types/ticket-types'

export function ClientTicketCreatePage() {
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get('conversationId')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const chatbot = useChatbot()
  const usesCurrentConversation = Boolean(conversationId && getConversationId() === conversationId)
  const directConversation = useConversationQuery(conversationId, Boolean(conversationId) && !usesCurrentConversation)
  const conversation = usesCurrentConversation ? chatbot.conversation : directConversation.data ?? null
  const isConversationLoading = usesCurrentConversation ? chatbot.isRestoring : directConversation.isLoading
  const conversationError = usesCurrentConversation ? chatbot.error : directConversation.isError ? 'No pudimos cargar el contexto de la conversación.' : null
  const categories = useCategories()

  function handleCreated(ticket: TicketRead): void {
    queryClient.setQueryData(ticketQueryKey(ticket.id), ticket)
    if (conversationId) chatbot.clearConversationAfterTicket(conversationId)
    navigate(`/cliente/tickets/${ticket.id}`, { replace: true, state: { createdTrackingCode: ticket.tracking_code } })
  }

  return <section className="client-ticket-create-page">
    <Link className="back-link" to="/cliente/tickets">← Volver a mis tickets</Link>
    <span className="eyebrow">Portal del cliente</span><h1>{conversationId ? 'Convertir conversación en ticket' : 'Crear ticket'}</h1>
    <p className="lead">Completa información de demostración. No ingreses credenciales ni datos bancarios reales.</p>
    {conversationId && <section className="ticket-conversation-context" aria-labelledby="conversation-context-title"><h2 id="conversation-context-title">Contexto de la conversación</h2>
      {isConversationLoading && <div className="state" role="status">Cargando conversación…</div>}
      {conversationError && <div className="state state-error" role="alert"><span>{conversationError}</span></div>}
      {conversation?.messages.length ? <MessageList messages={conversation.messages} /> : !isConversationLoading && !conversationError && <div className="state"><strong>La conversación no contiene mensajes.</strong></div>}
    </section>}
    {categories.isLoading && <div className="state" role="status">Cargando categorías…</div>}
    {categories.isError && <div className="state state-error" role="alert"><strong>No pudimos cargar las categorías.</strong><button className="button button-small" type="button" onClick={() => { void categories.refetch() }}>Reintentar</button></div>}
    {!categories.isLoading && !categories.isError && <TicketForm categories={categories.data ?? []} conversationId={conversationId} onCreated={handleCreated} />}
  </section>
}
