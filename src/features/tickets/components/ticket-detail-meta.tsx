import type { CategoryRead } from '../../faqs/types/faq-types'
import { Card } from '../../../components/ui/card'
import { Icon } from '../../../components/ui/icons'
import { ticketSourceLabel } from '../ticket-utils'
import type { TicketRead } from '../types/ticket-types'
import { TicketPriorityBadge, TicketStatusBadge } from './ticket-badges'

const dateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' })
export function TicketDetailMeta({ ticket, categories, internal = false }: { ticket: TicketRead; categories: CategoryRead[]; internal?: boolean }) {
  const category = categories.find((item) => item.is_active && item.id === ticket.category_id)
  const dates = ([['Creado', ticket.created_at], ['Asignado', ticket.assigned_at], ['Resuelto', ticket.resolved_at], ['Cerrado', ticket.closed_at], ['Cancelado', ticket.cancelled_at]] as const).flatMap(([label, value]) => value ? [{ label, value }] : [])
  return <><div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><span className="font-mono text-[13px] font-bold text-turq-dark">{ticket.tracking_code}</span><h1 className="mt-1 text-[25px] font-extrabold text-ink">{ticket.subject}</h1></div><div className="flex flex-wrap gap-2"><TicketStatusBadge status={ticket.status} /><TicketPriorityBadge priority={ticket.priority} /></div></div><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Card><h2 className="mb-3 flex items-center gap-2 text-[16px] font-bold text-ink"><Icon.ticket size={17} />Detalle de la solicitud</h2><p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{ticket.description}</p></Card><Card aria-label="Datos del ticket"><h2 className="mb-4 text-[16px] font-bold text-ink">Datos del ticket</h2><dl className="space-y-3 text-[13px]"><div><dt className="text-muted">Categoría</dt><dd className="font-semibold text-ink">{category?.name ?? 'Categoría no disponible'}</dd></div><div><dt className="text-muted">Origen</dt><dd className="font-semibold text-ink">Origen: {ticketSourceLabel(ticket.source)}</dd></div>{internal && <div><dt className="text-muted">Cliente</dt><dd className="font-semibold text-ink">Cliente asociado</dd></div>}{ticket.assigned_advisor_id && <div><dt className="text-muted">Asesor asignado</dt><dd className="font-semibold text-ink">Asesor asignado</dd></div>}{dates.map(({ label, value }) => <div key={label}><dt className="text-muted">{label}</dt><dd className="font-semibold text-ink"><time dateTime={value}>{dateFormatter.format(new Date(value))}</time></dd></div>)}</dl></Card></div></>
}
