import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../../lib/api-client'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketActions } from '../components/ticket-actions'
import { TicketAssignment } from '../components/ticket-assignment'
import { TicketComments } from '../components/ticket-comments'
import { TicketDetailMeta } from '../components/ticket-detail-meta'
import { TicketHistory } from '../components/ticket-history'
import { useTicket, useTicketHistory } from '../hooks/use-tickets'
import { isUuid } from '../../../lib/identifiers'
function errorText(error: unknown) { return error instanceof ApiError && error.status === 401 ? 'Tu sesión expiró. Inicia sesión nuevamente.' : error instanceof ApiError && error.status === 403 ? 'No tienes permiso para consultar este ticket.' : error instanceof ApiError && error.status === 404 ? 'No encontramos el ticket solicitado.' : 'No pudimos cargar el detalle del ticket.' }
export function StaffTicketDetailPage() { const { ticketId: rawTicketId = '' } = useParams(); if (!isUuid(rawTicketId)) return <div className="state state-error" role="alert"><strong>No encontramos el ticket solicitado.</strong><Link className="button button-small" to="/personal/tickets">Volver a la bandeja</Link></div>; const ticketId = rawTicketId; const ticket = useTicket(ticketId); const history = useTicketHistory(ticketId); const categories = useCategories(); const loading = ticket.isLoading || history.isLoading || categories.isLoading; const failed = ticket.isError || history.isError || categories.isError
  if (loading) return <div className="state" role="status">Cargando detalle del ticket…</div>
  if (failed) return <div className="state state-error" role="alert"><strong>{errorText(ticket.error ?? history.error ?? categories.error)}</strong><button className="button button-small" type="button" onClick={() => { void ticket.refetch(); void history.refetch(); void categories.refetch() }}>Reintentar</button></div>
  if (!ticket.data) return null
  return <section className="ticket-detail-page"><Link className="back-link" to="/personal/tickets">← Volver a la bandeja</Link><TicketDetailMeta ticket={ticket.data} categories={categories.data ?? []} internal />{<TicketAssignment ticket={ticket.data} />}<TicketActions ticket={ticket.data} /><section className="ticket-history" aria-labelledby="ticket-history-title"><h2 id="ticket-history-title">Historial</h2><TicketHistory items={history.data ?? []} /></section><TicketComments ticket={ticket.data} /></section>
}
