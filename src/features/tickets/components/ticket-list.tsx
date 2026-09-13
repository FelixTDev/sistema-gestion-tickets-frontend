import { Link } from 'react-router-dom'
import type { CategoryRead } from '../../faqs/types/faq-types'
import { TicketPriorityBadge, TicketStatusBadge } from './ticket-badges'
import { sortTicketsNewestFirst, ticketSourceLabel } from '../ticket-utils'
import type { TicketRead } from '../types/ticket-types'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function TicketList({ tickets, categories, detailBasePath = '/cliente/tickets' }: { tickets: TicketRead[]; categories: CategoryRead[]; detailBasePath?: string }) {
  const categoryNames = new Map(categories.filter((category) => category.is_active).map((category) => [category.id, category.name]))
  return <div className="ticket-list">
    {sortTicketsNewestFirst(tickets).map((ticket) => <article className="ticket-card" key={ticket.id}>
      <div className="ticket-card-topline"><strong>{ticket.tracking_code}</strong><time dateTime={ticket.created_at}>{formatDate(ticket.created_at)}</time></div>
      <h2>{ticket.subject}</h2>
      <div className="ticket-card-badges"><TicketStatusBadge status={ticket.status} /><TicketPriorityBadge priority={ticket.priority} /></div>
      <dl className="ticket-card-meta">
        <div><dt>Categoría</dt><dd>{categoryNames.get(ticket.category_id) ?? 'Categoría no disponible'}</dd></div>
        <div><dt>Fuente</dt><dd>Origen: {ticketSourceLabel(ticket.source)}</dd></div>
      </dl>
      <Link className="text-link" to={`${detailBasePath}/${ticket.id}`} aria-label={`Ver ticket ${ticket.tracking_code}`}>Ver detalle <span aria-hidden="true">→</span></Link>
    </article>)}
  </div>
}
