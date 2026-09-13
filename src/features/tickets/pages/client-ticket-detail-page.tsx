import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError } from '../../../lib/api-client'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketDetailMeta } from '../components/ticket-detail-meta'
import { TicketComments } from '../components/ticket-comments'
import { TicketHistory } from '../components/ticket-history'
import { useTicket, useTicketHistory } from '../hooks/use-tickets'

function detailError(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para consultar este ticket.'
  if (error instanceof ApiError && error.status === 404) return 'No encontramos el ticket solicitado.'
  return 'No pudimos cargar el detalle del ticket.'
}

export function ClientTicketDetailPage() {
  const { ticketId = '' } = useParams()
  const location = useLocation()
  const createdTrackingCode = (location.state as { createdTrackingCode?: string } | null)?.createdTrackingCode
  const ticketQuery = useTicket(ticketId)
  const historyQuery = useTicketHistory(ticketId)
  const categoriesQuery = useCategories()
  const ticket = ticketQuery.data
  const creationNotice = createdTrackingCode && <div className="form-success" role="status"><strong>Ticket creado correctamente</strong><span>{createdTrackingCode}</span></div>

  if (ticketQuery.isLoading || historyQuery.isLoading || categoriesQuery.isLoading) return <>{creationNotice}<div className="state" role="status">Cargando detalle del ticket…</div></>
  if (ticketQuery.isError || historyQuery.isError || categoriesQuery.isError) {
    const error = ticketQuery.error ?? historyQuery.error ?? categoriesQuery.error
    return <>{creationNotice}<div className="state state-error" role="alert"><strong>{detailError(error)}</strong><button className="button button-small" type="button" onClick={() => { void ticketQuery.refetch(); void historyQuery.refetch(); void categoriesQuery.refetch() }}>Reintentar</button></div></>
  }
  if (!ticket) return null

  return <section className="ticket-detail-page">
    <Link className="back-link" to="/cliente/tickets">← Volver a mis tickets</Link>
    {creationNotice}
    <TicketDetailMeta ticket={ticket} categories={categoriesQuery.data ?? []} />
    <section className="ticket-history" aria-labelledby="ticket-history-title"><h2 id="ticket-history-title">Historial</h2><TicketHistory items={historyQuery.data ?? []} /></section>
    <TicketComments ticket={ticket} />
  </section>
}
