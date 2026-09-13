import { Link } from 'react-router-dom'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketList } from '../components/ticket-list'
import { sortTicketsNewestFirst } from '../ticket-utils'
import { useMyTickets } from '../hooks/use-tickets'

export function ClientDashboardPage() {
  const tickets = useMyTickets()
  const categories = useCategories()
  const data = Array.isArray(tickets.data) ? tickets.data : []
  const categoryData = Array.isArray(categories.data) ? categories.data : []
  const openCount = data.filter((ticket) => ticket.status !== 'CERRADO' && ticket.status !== 'CANCELADO').length
  const finishedCount = data.filter((ticket) => ticket.status === 'CERRADO' || ticket.status === 'CANCELADO').length
  const recent = sortTicketsNewestFirst(data).slice(0, 3)
  const isLoading = tickets.isLoading || categories.isLoading
  const isError = tickets.isError || categories.isError

  return <section className="client-dashboard">
    <span className="eyebrow">Portal del cliente</span><h1>Tu espacio de atención</h1><p className="lead">Revisa tus solicitudes recientes o inicia una nueva consulta.</p>
    <div className="client-dashboard-actions"><Link className="button" to="/cliente/tickets/nuevo">Crear ticket</Link><Link className="button button-outline" to="/chat">Usar el asistente</Link></div>
    {isLoading && <div className="state" role="status">Cargando resumen de tickets…</div>}
    {isError && <div className="state state-error" role="alert"><strong>No pudimos cargar tu resumen.</strong><button className="button button-small" type="button" onClick={() => { void tickets.refetch(); void categories.refetch() }}>Reintentar</button></div>}
    {!isLoading && !isError && <>
      <div className="client-dashboard-stats"><div className="card"><span>Tickets activos</span><strong className="dashboard-open-count">{openCount}</strong></div><div className="card"><span>Finalizados</span><strong className="dashboard-finished-count">{finishedCount}</strong></div><div className="card"><span>Total</span><strong>{data.length}</strong></div></div>
      <div className="dashboard-recent-heading"><h2>Tickets recientes</h2><Link className="text-link" to="/cliente/tickets">Ver todos mis tickets</Link></div>
      {recent.length ? <TicketList tickets={recent} categories={categoryData} /> : <div className="state"><strong>Todavía no tienes actividad de tickets.</strong><span>Cuando crees una solicitud aparecerá aquí.</span></div>}
    </>}
  </section>
}
