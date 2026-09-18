import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useChatbot } from '../../chatbot/chatbot-provider'
import { getConversationId } from '../../chatbot/chatbot-storage'
import { MessageList } from '../../chatbot/components/message-list'
import { useConversationQuery } from '../../chatbot/hooks/use-chat-conversation'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { Card } from '../../../components/ui/card'
import { ErrorState, LoadingState } from '../../../components/ui/states'
import { Icon } from '../../../components/ui/icons'
import { TicketForm } from '../components/ticket-form'
import { ticketQueryKey } from '../hooks/use-tickets'
import type { TicketRead } from '../types/ticket-types'
import { isUuid } from '../../../lib/identifiers'

function InvalidConversationPage() { return <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6"><Link className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-muted" to="/cliente/tickets"><Icon.arrowL size={15} />Volver a mis tickets</Link><Card><ErrorState title="Conversación no válida" desc="No pudimos validar el identificador de la conversación." /></Card></section> }

export function ClientTicketCreatePage() {
  const [searchParams] = useSearchParams(); const rawConversationId = searchParams.get('conversationId')
  if (rawConversationId && !isUuid(rawConversationId)) return <InvalidConversationPage />
  return <ValidCreatePage conversationId={rawConversationId} />
}

function ValidCreatePage({ conversationId }: { conversationId: string | null }) {
  const navigate = useNavigate(); const queryClient = useQueryClient(); const chatbot = useChatbot(); const usesCurrentConversation = Boolean(conversationId && getConversationId() === conversationId); const directConversation = useConversationQuery(conversationId, Boolean(conversationId) && !usesCurrentConversation); const conversation = usesCurrentConversation ? chatbot.conversation : directConversation.data ?? null; const isConversationLoading = usesCurrentConversation ? chatbot.isRestoring : directConversation.isLoading; const conversationError = usesCurrentConversation ? chatbot.error : directConversation.isError ? 'No pudimos cargar el contexto de la conversación.' : null; const categories = useCategories()
  function handleCreated(ticket: TicketRead): void { queryClient.setQueryData(ticketQueryKey(ticket.id), ticket); if (conversationId) chatbot.clearConversationAfterTicket(conversationId); navigate(`/cliente/tickets/${ticket.id}`, { replace: true, state: { createdTrackingCode: ticket.tracking_code } }) }
  return <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6"><Link className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-muted" to="/cliente/tickets"><Icon.arrowL size={15} />Volver a mis tickets</Link><span className="block text-[12px] font-bold uppercase tracking-wider text-turq-dark">Portal del cliente</span><h1 className="mt-1 text-[26px] font-extrabold text-ink">{conversationId ? 'Convertir conversación en ticket' : 'Crear ticket'}</h1><p className="mb-6 mt-1 text-[14.5px] text-muted">Cuéntanos tu consulta y un asesor te ayudará.</p>{conversationId && <Card className="mb-5" pad={false}><div className="border-b border-[#eef2f3] p-5"><h2 className="flex items-center gap-2 text-[16px] font-bold text-ink"><Icon.bot size={18} />Contexto de la conversación</h2></div><div className="p-5">{isConversationLoading && <LoadingState message="Cargando conversación…" />}{conversationError && <ErrorState desc={conversationError} />}{conversation?.messages.length ? <MessageList messages={conversation.messages} /> : !isConversationLoading && !conversationError && <p className="text-[14px] text-muted">La conversación no contiene mensajes.</p>}</div></Card>}{categories.isLoading && <Card><LoadingState message="Cargando categorías…" /></Card>}{categories.isError && <Card><ErrorState title="No pudimos cargar las categorías" onRetry={() => { void categories.refetch() }} /></Card>}{!categories.isLoading && !categories.isError && <TicketForm categories={categories.data ?? []} conversationId={conversationId} onCreated={handleCreated} />}</section>
}
