import { useState } from 'react'
import { useAuth } from '../../auth/auth-provider'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketFilters, emptyTicketFilters } from '../components/ticket-filters'
import { TicketList } from '../components/ticket-list'
import { pageData, ticketItems, useOperationalTickets } from '../hooks/use-tickets'
import type { OperationalQueue, TicketListFilters } from '../types/ticket-types'

const queues: ReadonlyArray<{ value: OperationalQueue; label: string }> = [
  { value: 'assigned_to_me', label: 'Asignados a mí' },
  { value: 'unassigned', label: 'Sin asignar' },
  { value: 'assigned_to_advisor', label: 'Asignados a asesor' },
  { value: 'sla_soon', label: 'SLA próximo a vencer' },
  { value: 'sla_overdue', label: 'SLA vencido' },
  { value: 'pending_first_response', label: 'Pendientes de primera respuesta' },
  { value: 'recently_updated', label: 'Actualizados recientemente' },
]

export function StaffTicketsPage() {
  const { user } = useAuth()
  const isSupervisor = user?.role === 'SUPERVISOR'
  const [filters, setFilters] = useState<TicketListFilters>(emptyTicketFilters)
  const [selectedQueue, setSelectedQueue] = useState<OperationalQueue>('assigned_to_me')
  const queue = isSupervisor && selectedQueue === 'assigned_to_me' ? 'unassigned' : selectedQueue
  const visibleQueues = queues.filter((item) => item.value !== 'assigned_to_advisor' && !(isSupervisor && item.value === 'assigned_to_me'))
  const tickets = useOperationalTickets({ ...filters, queue }); const categories = useCategories()
  const data = ticketItems(tickets.data); const cats = Array.isArray(categories.data) ? categories.data : []
  const pagination = pageData(tickets.data)
  return <section className="staff-tickets-page"><span className="eyebrow">Operaciones</span><h1>Bandeja de tickets</h1><p className="lead">Gestiona las solicitudes que requieren atención del equipo.</p><div className="mb-4 flex flex-wrap items-end gap-3"><label className="grid gap-1 text-[13px] font-semibold text-ink" htmlFor="operations-queue">Cola operativa<select id="operations-queue" className="min-h-11 rounded-[10px] border border-[#cdd9de] bg-white px-3 font-normal" value={queue} onChange={(event) => { setSelectedQueue(event.target.value as OperationalQueue); setFilters((current) => ({ ...current, page: 1 })) }}>{visibleQueues.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div><TicketFilters categories={cats} onApply={(next) => setFilters({ ...next, page: 1 })} />
    {(tickets.isLoading || categories.isLoading) && <div className="state" role="status">Cargando bandeja…</div>}
    {(tickets.isError || categories.isError) && <div className="state state-error" role="alert"><strong>No pudimos cargar la bandeja.</strong><button className="button button-small" type="button" onClick={() => { void tickets.refetch(); void categories.refetch() }}>Reintentar</button></div>}
    {!tickets.isLoading && !tickets.isError && data.length === 0 && <div className="state"><strong>No hay tickets para mostrar.</strong><span>Prueba con otros filtros.</span></div>}
    {!tickets.isLoading && !tickets.isError && data.length > 0 && <><TicketList tickets={data} categories={cats} detailBasePath="/personal/tickets" />{pagination && pagination.total_pages > 1 && <div className="mt-5 flex items-center justify-between gap-3"><button className="button button-small" type="button" disabled={pagination.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, (current.page ?? pagination.page) - 1) }))}>Anterior</button><span className="text-[13px] text-muted">Página {pagination.page} de {pagination.total_pages}</span><button className="button button-small" type="button" disabled={pagination.page >= pagination.total_pages} onClick={() => setFilters((current) => ({ ...current, page: Math.min(pagination.total_pages, (current.page ?? pagination.page) + 1) }))}>Siguiente</button></div>}</>}
  </section>
}
