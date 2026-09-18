import type { TicketPriority, TicketStatus } from '../types/ticket-types'

const statusLabels: Record<TicketStatus, string> = { NUEVO: 'Nuevo', ASIGNADO: 'Asignado', EN_PROCESO: 'En proceso', PENDIENTE_CLIENTE: 'Pendiente del cliente', RESUELTO: 'Resuelto', CERRADO: 'Cerrado', CANCELADO: 'Cancelado' }
const priorityLabels: Record<TicketPriority, string> = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente' }
function valueClass(value: string): string { return value.toLocaleLowerCase().replaceAll('_', '-') }

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const label = statusLabels[status]
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ticket-badge ticket-status-${valueClass(status)} ${status === 'NUEVO' ? 'border-[#b6e3e5] bg-[#e5f7f7] text-turq-dark' : status === 'CERRADO' || status === 'CANCELADO' ? 'border-[#e5c0bd] bg-[#fbe3e2] text-danger' : status === 'RESUELTO' ? 'border-[#cce5a5] bg-[#eef8df] text-[#4c7a15]' : 'border-[#d4e2e8] bg-[#eef4f5] text-ink-800'}`} aria-label={`Estado: ${label}`}>{label}</span>
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const label = priorityLabels[priority]
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ticket-badge ticket-priority-${valueClass(priority)} ${priority === 'URGENTE' || priority === 'ALTA' ? 'border-[#edcbc7] bg-[#fbe3e2] text-danger' : priority === 'MEDIA' ? 'border-[#ecd6a7] bg-[#fff6e4] text-warn' : 'border-[#d4e2e8] bg-[#eef4f5] text-muted'}`} aria-label={`Prioridad: ${label}`}>{label}</span>
}

export const StatusBadge = TicketStatusBadge
export const PriorityBadge = TicketPriorityBadge
