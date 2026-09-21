import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { Input, Select } from '../../../components/ui/form-controls'
import { Icon } from '../../../components/ui/icons'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketList } from '../components/ticket-list'
import { pageData, ticketItems, useMyTickets } from '../hooks/use-tickets'
import type { TicketListFilters, TicketPriority, TicketStatus } from '../types/ticket-types'

const pageSize = 20

export function ClientTicketsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [page, setPage] = useState(1)
  const filters = useMemo<Partial<TicketListFilters>>(() => ({ status, category_id: categoryId, priority, created_from: '', created_to: '', search: search.trim(), page, page_size: pageSize }), [categoryId, page, priority, search, status])
  const tickets = useMyTickets(filters)
  const categories = useCategories()
  const ticketData = ticketItems(tickets.data)
  const pageInfo = pageData(tickets.data)
  const categoryData = Array.isArray(categories.data) ? categories.data : []
  const isLoading = tickets.isLoading || categories.isLoading
  const isError = tickets.isError || categories.isError

  function resetPage<T>(setter: Dispatch<SetStateAction<T>>, value: T): void {
    setter(value)
    setPage(1)
  }

  return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6" aria-busy={isLoading}>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><span className="text-[12px] font-bold uppercase tracking-wider text-turq-dark">Portal del cliente</span><h1 className="mt-1 text-[26px] font-extrabold text-ink">Mis tickets</h1><p className="mt-1 text-[14.5px] text-muted">Consulta y da seguimiento a tus solicitudes.</p></div><Link className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-turq px-5 text-[14px] font-semibold text-white" to="/cliente/tickets/nuevo"><Icon.plus size={17} />Crear ticket</Link></div>
    {isLoading && <LoadingState message="Cargando mis tickets…" />}
    {isError && <Card><ErrorState title="No pudimos cargar tus tickets" onRetry={() => { void tickets.refetch(); void categories.refetch() }} /></Card>}
    {!isLoading && !isError && <Card pad={false}>
      <div className="flex flex-wrap gap-3 border-b border-[#eef2f3] p-4">
        <label className="relative min-w-[180px] flex-1"><span className="sr-only">Buscar por código, asunto o descripción</span><Icon.search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Buscar por código, asunto o descripción…" value={search} onChange={(event) => resetPage(setSearch, event.target.value)} /></label>
        <Select aria-label="Filtrar por estado" value={status} onChange={(event) => resetPage(setStatus, event.target.value as TicketStatus | '')} className="min-w-[160px] !w-auto"><option value="">Todos los estados</option><option value="NUEVO">Nuevo</option><option value="ASIGNADO">Asignado</option><option value="EN_PROCESO">En proceso</option><option value="PENDIENTE_CLIENTE">Pendiente del cliente</option><option value="RESUELTO">Resuelto</option><option value="CERRADO">Cerrado</option><option value="CANCELADO">Cancelado</option></Select>
        <Select aria-label="Filtrar por categoría" value={categoryId} onChange={(event) => resetPage(setCategoryId, event.target.value)} className="min-w-[160px] !w-auto"><option value="">Todas las categorías</option>{categoryData.filter((category) => category.is_active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
        <Select aria-label="Filtrar por prioridad" value={priority} onChange={(event) => resetPage(setPriority, event.target.value as TicketPriority | '')} className="min-w-[150px] !w-auto"><option value="">Todas las prioridades</option><option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="URGENTE">Urgente</option></Select>
      </div>
      {ticketData.length === 0 ? <EmptyState icon={Icon.search} title={search || status || categoryId || priority ? 'Sin resultados' : 'Aún no tienes tickets'} desc={search || status || categoryId || priority ? 'No encontramos tickets con esos criterios. Ajusta la búsqueda o los filtros.' : 'Puedes crear una solicitud manual o comenzar desde el asistente.'} action={!search && !status && !categoryId && !priority ? <Link className="inline-flex h-11 items-center rounded-[10px] bg-turq px-5 text-[14px] font-semibold text-white" to="/cliente/tickets/nuevo">Crear ticket</Link> : undefined} /> : <TicketList tickets={ticketData} categories={categoryData} />}
      {pageInfo && pageInfo.total_pages > 1 && <nav className="flex items-center justify-between border-t border-[#eef2f3] p-4" aria-label="Paginación de tickets"><button type="button" className="min-h-11 rounded-[10px] border border-[#cdd9de] px-3 text-[13px] font-semibold text-ink-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={pageInfo.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button><span className="text-[13px] text-muted" aria-live="polite">Página {pageInfo.page} de {pageInfo.total_pages}</span><button type="button" className="min-h-11 rounded-[10px] border border-[#cdd9de] px-3 text-[13px] font-semibold text-ink-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={pageInfo.page >= pageInfo.total_pages} onClick={() => setPage((current) => Math.min(pageInfo.total_pages, current + 1))}>Siguiente</button></nav>}
    </Card>}
  </section>
}
