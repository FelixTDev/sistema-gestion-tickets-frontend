import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError } from '../../../lib/api-client'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketPriorityBadge, TicketStatusBadge } from '../components/ticket-badges'
import { TicketComments } from '../components/ticket-comments'
import { TicketHistory } from '../components/ticket-history'
import { useTicket, useTicketHistory } from '../hooks/use-tickets'
import { ticketSourceLabel } from '../ticket-utils'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
}

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

  const category = categoriesQuery.data?.find((item) => item.is_active && item.id === ticket.category_id)
  const dates = ([
    ['Creado', ticket.created_at], ['Asignado', ticket.assigned_at], ['Resuelto', ticket.resolved_at], ['Cerrado', ticket.closed_at], ['Cancelado', ticket.cancelled_at],
  ] as const).flatMap(([label, value]) => value ? [{ label, value }] : [])

  return <section className="ticket-detail-page">
    <Link className="back-link" to="/cliente/tickets">← Volver a mis tickets</Link>
    {creationNotice}
    <div className="ticket-detail-heading"><div><span className="eyebrow">{ticket.tracking_code}</span><h1>{ticket.subject}</h1></div><div className="ticket-badge-row"><TicketStatusBadge status={ticket.status} /><TicketPriorityBadge priority={ticket.priority} /></div></div>
    <div className="ticket-detail-grid">
      <article className="card ticket-detail-main"><h2>Detalle de la solicitud</h2><p>{ticket.description}</p></article>
      <aside className="card ticket-detail-meta" aria-label="Datos del ticket"><dl>
        <div><dt>Categoría</dt><dd>{category?.name ?? 'Categoría no disponible'}</dd></div>
        <div><dt>Origen</dt><dd>Origen: {ticketSourceLabel(ticket.source)}</dd></div>
        {ticket.assigned_advisor_id && <div><dt>Asesor asignado</dt><dd>{ticket.assigned_advisor_id}</dd></div>}
        {dates.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd><time dateTime={value}>{formatDate(value)}</time></dd></div>)}
      </dl></aside>
    </div>
    <section className="ticket-history" aria-labelledby="ticket-history-title"><h2 id="ticket-history-title">Historial</h2><TicketHistory items={historyQuery.data ?? []} /></section>
    <TicketComments ticket={ticket} />
  </section>
}
