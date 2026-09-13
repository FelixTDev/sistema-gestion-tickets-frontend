import { Link } from 'react-router-dom'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { TicketList } from '../components/ticket-list'
import { useMyTickets } from '../hooks/use-tickets'

export function ClientTicketsPage() {
  const tickets = useMyTickets()
  const categories = useCategories()
  const ticketData = Array.isArray(tickets.data) ? tickets.data : []
  const categoryData = Array.isArray(categories.data) ? categories.data : []
  const isLoading = tickets.isLoading || categories.isLoading
  const isError = tickets.isError || categories.isError

  return <section className="client-tickets-page">
    <div className="page-heading-actions"><div><span className="eyebrow">Portal del cliente</span><h1>Mis tickets</h1><p className="lead">Consulta el estado y la trazabilidad de tus solicitudes.</p></div><Link className="button" to="/cliente/tickets/nuevo">Crear ticket</Link></div>
    {isLoading && <div className="state" role="status">Cargando mis tickets…</div>}
    {isError && <div className="state state-error" role="alert"><strong>No pudimos cargar tus tickets.</strong><button className="button button-small" type="button" onClick={() => { void tickets.refetch(); void categories.refetch() }}>Reintentar</button></div>}
    {!isLoading && !isError && (ticketData.length
      ? <TicketList tickets={ticketData} categories={categoryData} />
      : <div className="state"><strong>Aún no tienes tickets.</strong><span>Puedes crear una solicitud manual o comenzar desde el asistente.</span></div>)}
  </section>
}
