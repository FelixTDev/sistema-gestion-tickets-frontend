import { useMemo, useState } from 'react'
import { Card } from '../../../components/ui/card'
import { PageHeader } from '../../../components/layout/page-header'
import { LoadingState, ErrorState, EmptyState } from '../../../components/ui/states'
import { Icon } from '../../../components/ui/icons'
import { TicketAssignment } from '../components/ticket-assignment'
import { emptyTicketFilters } from '../components/ticket-filters'
import { useAdvisors, useOperationalTickets } from '../hooks/use-tickets'

export function TicketAssignmentPage() {
  const tickets = useOperationalTickets(emptyTicketFilters)
  const advisors = useAdvisors()
  const unassigned = useMemo(() => (tickets.data ?? []).filter((ticket) => ticket.assigned_advisor_id === null && ticket.status !== 'CERRADO' && ticket.status !== 'CANCELADO'), [tickets.data])
  const [selectedId, setSelectedId] = useState('')
  const selected = unassigned.find((ticket) => ticket.id === selectedId) ?? unassigned[0]
  return <section className="ticket-assignment-page">
    <PageHeader eyebrow="Supervisión" title="Asignación de tickets" subtitle="Distribuye las solicitudes entre los asesores activos." />
    {tickets.isLoading && <LoadingState message="Cargando tickets sin asignar…" />}
    {tickets.isError && <Card><ErrorState title="No pudimos cargar los tickets" onRetry={() => { void tickets.refetch() }} /></Card>}
    {!tickets.isLoading && !tickets.isError && unassigned.length === 0 && <Card><EmptyState icon={Icon.inbox} title="No hay tickets sin asignar" desc="Las solicitudes pendientes ya tienen un asesor o no hay actividad disponible." /></Card>}
    {!tickets.isLoading && !tickets.isError && unassigned.length > 0 && <div className="assignment-page-grid"><div className="assignment-column"><Card><h2>Asignar ticket</h2><label htmlFor="assignment-ticket">Ticket</label><select id="assignment-ticket" value={selected?.id ?? ''} onChange={(event) => setSelectedId(event.target.value)}>{unassigned.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.tracking_code} · {ticket.subject}</option>)}</select>{selected && <div className="assignment-ticket-summary"><span>Estado actual</span><strong>{selected.status.replaceAll('_', ' ')}</strong><span>Prioridad</span><strong>{selected.priority}</strong></div>}</Card>{selected && <TicketAssignment ticket={selected} />}</div><Card><h2>Asesores activos</h2>{advisors.isLoading && <LoadingState message="Cargando asesores…" />}{advisors.isError && <ErrorState title="No pudimos cargar los asesores" onRetry={() => { void advisors.refetch() }} />}{!advisors.isLoading && !advisors.isError && (advisors.data ?? []).filter((advisor) => advisor.role === 'ASESOR').length === 0 && <EmptyState icon={Icon.users} title="No hay asesores activos" desc="No hay candidatos disponibles para asignación." />}{!advisors.isLoading && !advisors.isError && <ul className="advisor-list">{(advisors.data ?? []).filter((advisor) => advisor.role === 'ASESOR').map((advisor) => <li key={advisor.id}><span aria-hidden="true">{advisor.full_name.slice(0, 1)}</span><div><strong>{advisor.full_name}</strong><small>{advisor.email}</small></div></li>)}</ul>}</Card></div>}
  </section>
}
