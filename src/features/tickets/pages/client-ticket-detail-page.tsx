import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError } from '../../../lib/api-client'
import { Card } from '../../../components/ui/card'
import { ErrorState, LoadingState } from '../../../components/ui/states'
import { Icon } from '../../../components/ui/icons'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketDetailMeta } from '../components/ticket-detail-meta'
import { TicketComments } from '../components/ticket-comments'
import { TicketHistory } from '../components/ticket-history'
import { useTicket, useTicketHistory } from '../hooks/use-tickets'
import { isUuid } from '../../../lib/identifiers'

function detailError(error: unknown): string { if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para consultar este ticket.'; if (error instanceof ApiError && error.status === 404) return 'No encontramos el ticket solicitado.'; return 'No pudimos cargar el detalle del ticket.' }
function InvalidTicketPage() { return <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Link className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-muted" to="/cliente/tickets"><Icon.arrowL size={15} />Volver a mis tickets</Link><Card><ErrorState title="Ticket no válido" desc="No pudimos validar el identificador del ticket." /></Card></section> }
export function ClientTicketDetailPage() { const { ticketId = '' } = useParams(); return isUuid(ticketId) ? <ValidDetailPage ticketId={ticketId} /> : <InvalidTicketPage /> }

function ValidDetailPage({ ticketId }: { ticketId: string }) {
  const location = useLocation(); const createdTrackingCode = (location.state as { createdTrackingCode?: string } | null)?.createdTrackingCode; const ticketQuery = useTicket(ticketId); const historyQuery = useTicketHistory(ticketId); const categoriesQuery = useCategories(); const ticket = ticketQuery.data; const creationNotice = createdTrackingCode && <div className="mb-5 rounded-[10px] border border-[#cce5a5] bg-[#eef8df] p-3.5 text-[13px] text-[#4c7a15]" role="status"><strong className="mr-2">Ticket creado correctamente</strong>{createdTrackingCode}</div>
  if (ticketQuery.isLoading || historyQuery.isLoading || categoriesQuery.isLoading) return <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{creationNotice}<LoadingState message="Cargando detalle del ticket…" /></section>
  if (ticketQuery.isError || historyQuery.isError || categoriesQuery.isError) { const error = ticketQuery.error ?? historyQuery.error ?? categoriesQuery.error; return <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{creationNotice}<Card><ErrorState title="No pudimos cargar el detalle del ticket" desc={detailError(error)} onRetry={() => { void ticketQuery.refetch(); void historyQuery.refetch(); void categoriesQuery.refetch() }} /></Card></section> }
  if (!ticket) return <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Card><ErrorState title="No encontramos el ticket solicitado" /></Card></section>
  return <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Link className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink" to="/cliente/tickets"><Icon.arrowL size={15} />Volver a mis tickets</Link>{creationNotice}<TicketDetailMeta ticket={ticket} categories={categoriesQuery.data ?? []} /><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]"><div className="lg:col-start-2 lg:row-start-1"><Card><h2 className="mb-4 flex items-center gap-2 text-[16px] font-bold text-ink"><Icon.clock size={17} />Historial</h2><TicketHistory items={historyQuery.data ?? []} /></Card></div><div className="lg:col-start-1 lg:row-start-1 lg:row-span-2"><TicketComments ticket={ticket} /></div></div></section>
}
