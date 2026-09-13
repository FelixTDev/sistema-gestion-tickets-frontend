import type { CategoryRead } from '../../faqs/types/faq-types'
import { TicketPriorityBadge, TicketStatusBadge } from './ticket-badges'
import { ticketSourceLabel } from '../ticket-utils'
import type { TicketRead } from '../types/ticket-types'

const dateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' })
export function TicketDetailMeta({ ticket, categories, internal = false }: { ticket: TicketRead; categories: CategoryRead[]; internal?: boolean }) {
  const category = categories.find((item) => item.is_active && item.id === ticket.category_id)
  const dates = ([['Creado', ticket.created_at], ['Asignado', ticket.assigned_at], ['Resuelto', ticket.resolved_at], ['Cerrado', ticket.closed_at], ['Cancelado', ticket.cancelled_at]] as const).flatMap(([label, value]) => value ? [{ label, value }] : [])
  return <>
    <div className="ticket-detail-heading"><div><span className="eyebrow">{ticket.tracking_code}</span><h1>{ticket.subject}</h1></div><div className="ticket-badge-row"><TicketStatusBadge status={ticket.status} /><TicketPriorityBadge priority={ticket.priority} /></div></div>
    <div className="ticket-detail-grid"><article className="card ticket-detail-main"><h2>Detalle de la solicitud</h2><p>{ticket.description}</p></article><aside className="card ticket-detail-meta" aria-label="Datos del ticket"><dl>
      <div><dt>Categoría</dt><dd>{category?.name ?? 'Categoría no disponible'}</dd></div><div><dt>Origen</dt><dd>Origen: {ticketSourceLabel(ticket.source)}</dd></div>
      {internal && <div><dt>Cliente</dt><dd>Cliente asociado</dd></div>}{ticket.assigned_advisor_id && <div><dt>Asesor asignado</dt><dd>Asesor asignado</dd></div>}
      {dates.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd><time dateTime={value}>{dateFormatter.format(new Date(value))}</time></dd></div>)}
    </dl></aside></div>
  </>
}
