import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { Input, Select } from '../../../components/ui/form-controls'
import { Icon } from '../../../components/ui/icons'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketList } from '../components/ticket-list'
import { useMyTickets } from '../hooks/use-tickets'

export function ClientTicketsPage() {
  const tickets = useMyTickets()
  const categories = useCategories()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('recent')
  const ticketData = Array.isArray(tickets.data) ? tickets.data : []
  const categoryData = Array.isArray(categories.data) ? categories.data : []
  const list = useMemo(() => ticketData.filter((ticket) => (!status || ticket.status === status) && (!search.trim() || `${ticket.tracking_code} ${ticket.subject}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))).sort((a, b) => sort === 'recent' ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)), [search, sort, status, ticketData])
  const isLoading = tickets.isLoading || categories.isLoading
  const isError = tickets.isError || categories.isError
  return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6" aria-busy={isLoading}><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><span className="text-[12px] font-bold uppercase tracking-wider text-turq-dark">Portal del cliente</span><h1 className="mt-1 text-[26px] font-extrabold text-ink">Mis tickets</h1><p className="mt-1 text-[14.5px] text-muted">Consulta y da seguimiento a tus solicitudes.</p></div><Link className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-turq px-5 text-[14px] font-semibold text-white" to="/cliente/tickets/nuevo"><Icon.plus size={17} />Crear ticket</Link></div>
    {isLoading && <LoadingState message="Cargando mis tickets…" />}
    {isError && <Card><ErrorState title="No pudimos cargar tus tickets" onRetry={() => { void tickets.refetch(); void categories.refetch() }} /></Card>}
    {!isLoading && !isError && ticketData.length === 0 && <Card><EmptyState title="Aún no tienes tickets" desc="Puedes crear una solicitud manual o comenzar desde el asistente." action={<Link className="inline-flex h-11 items-center rounded-[10px] bg-turq px-5 text-[14px] font-semibold text-white" to="/cliente/tickets/nuevo">Crear ticket</Link>} /></Card>}
    {!isLoading && !isError && ticketData.length > 0 && <Card pad={false}><div className="flex flex-wrap gap-3 border-b border-[#eef2f3] p-4"><label className="relative min-w-[180px] flex-1"><span className="sr-only">Buscar por código o asunto</span><Icon.search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Buscar por código o asunto…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><Select aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value)} className="min-w-[160px] !w-auto"><option value="">Todos los estados</option><option value="NUEVO">Nuevo</option><option value="ASIGNADO">Asignado</option><option value="EN_PROCESO">En proceso</option><option value="PENDIENTE_CLIENTE">Pendiente del cliente</option><option value="RESUELTO">Resuelto</option><option value="CERRADO">Cerrado</option><option value="CANCELADO">Cancelado</option></Select><Select aria-label="Ordenar tickets" value={sort} onChange={(event) => setSort(event.target.value)} className="min-w-[150px] !w-auto"><option value="recent">Más recientes</option><option value="old">Más antiguos</option></Select></div>{list.length ? <TicketList tickets={list} categories={categoryData} /> : <EmptyState icon={Icon.search} title="Sin resultados" desc="No encontramos tickets con esos criterios. Ajusta la búsqueda o los filtros." />}</Card>}
  </section>
}
