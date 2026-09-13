import { useState } from 'react'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketFilters, emptyTicketFilters } from '../components/ticket-filters'
import { TicketList } from '../components/ticket-list'
import { useOperationalTickets } from '../hooks/use-tickets'
import type { TicketListFilters } from '../types/ticket-types'

export function StaffTicketsPage() {
  const [filters, setFilters] = useState<TicketListFilters>(emptyTicketFilters)
  const tickets = useOperationalTickets(filters); const categories = useCategories()
  const data = Array.isArray(tickets.data) ? tickets.data : []; const cats = Array.isArray(categories.data) ? categories.data : []
  return <section className="staff-tickets-page"><span className="eyebrow">Operaciones</span><h1>Bandeja de tickets</h1><p className="lead">Gestiona las solicitudes que requieren atención del equipo.</p><TicketFilters categories={cats} onApply={setFilters} />
    {(tickets.isLoading || categories.isLoading) && <div className="state" role="status">Cargando bandeja…</div>}
    {(tickets.isError || categories.isError) && <div className="state state-error" role="alert"><strong>No pudimos cargar la bandeja.</strong><button className="button button-small" type="button" onClick={() => { void tickets.refetch(); void categories.refetch() }}>Reintentar</button></div>}
    {!tickets.isLoading && !tickets.isError && data.length === 0 && <div className="state"><strong>No hay tickets para mostrar.</strong><span>Prueba con otros filtros.</span></div>}
    {!tickets.isLoading && !tickets.isError && data.length > 0 && <TicketList tickets={data} categories={cats} detailBasePath="/personal/tickets" />}
  </section>
}
