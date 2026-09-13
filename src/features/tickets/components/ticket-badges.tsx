import type { TicketPriority, TicketStatus } from '../types/ticket-types'

const statusLabels: Record<TicketStatus, string> = {
  NUEVO: 'Nuevo', ASIGNADO: 'Asignado', EN_PROCESO: 'En proceso', PENDIENTE_CLIENTE: 'Pendiente del cliente',
  RESUELTO: 'Resuelto', CERRADO: 'Cerrado', CANCELADO: 'Cancelado',
}
const priorityLabels: Record<TicketPriority, string> = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente' }

function valueClass(value: string): string {
  return value.toLocaleLowerCase().replaceAll('_', '-')
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const label = statusLabels[status]
  return <span className={`ticket-badge ticket-status-${valueClass(status)}`} aria-label={`Estado: ${label}`}>{label}</span>
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const label = priorityLabels[priority]
  return <span className={`ticket-badge ticket-priority-${valueClass(priority)}`} aria-label={`Prioridad: ${label}`}>{label}</span>
}
