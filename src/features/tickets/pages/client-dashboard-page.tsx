import { Link } from 'react-router-dom'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { Card } from '../../../components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { Icon, type IconComponent } from '../../../components/ui/icons'
import { TicketList } from '../components/ticket-list'
import { sortTicketsNewestFirst } from '../ticket-utils'
import { useMyTickets } from '../hooks/use-tickets'

export function ClientDashboardPage() {
  const tickets = useMyTickets()
  const categories = useCategories()
  const data = Array.isArray(tickets.data) ? tickets.data : []
  const categoryData = Array.isArray(categories.data) ? categories.data : []
  const counts = {
    total: data.length,
    nuevos: data.filter((ticket) => ticket.status === 'NUEVO').length,
    attention: data.filter((ticket) => ['ASIGNADO', 'EN_PROCESO', 'PENDIENTE_CLIENTE'].includes(ticket.status)).length,
    resolved: data.filter((ticket) => ['RESUELTO', 'CERRADO'].includes(ticket.status)).length,
  }
  const recent = sortTicketsNewestFirst(data).slice(0, 3)
  const isLoading = tickets.isLoading || categories.isLoading
  const isError = tickets.isError || categories.isError
  return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6" aria-busy={isLoading}>
    <div className="mb-6"><span className="text-[12px] font-bold uppercase tracking-wider text-turq-dark">Portal del cliente</span><h1 className="mt-1 text-[27px] font-extrabold text-ink">Tu espacio de atención</h1><p className="mt-1 text-[14.5px] text-muted">Revisa tus solicitudes recientes o inicia una nueva consulta.</p></div>
    {isLoading && <LoadingState message="Cargando resumen de tickets…" />}
    {isError && <Card><ErrorState title="No pudimos cargar tu resumen" onRetry={() => { void tickets.refetch(); void categories.refetch() }} /></Card>}
    {!isLoading && !isError && <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Resumen de tickets"><StatTile label="Total de tickets" value={counts.total} icon={Icon.ticket} tone="ink" /><StatTile label="Nuevos" value={counts.nuevos} icon={Icon.plus} tone="turq" /><StatTile label="En atención" value={counts.attention} icon={Icon.clock} tone="warn" /><StatTile label="Resueltos" value={counts.resolved} icon={Icon.check} tone="green" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><Card className="flex items-center justify-between gap-4 border-none bg-gradient-to-br from-[#06243a] to-[#0b4963] !p-5 text-white"><div><h2 className="text-[16px] font-bold">Registrar una solicitud</h2><p className="mt-1 text-[13px] text-[#c6d7de]">Crea un ticket y recibe seguimiento.</p></div><Link className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border border-white bg-white px-5 text-[14px] font-semibold text-ink-800" to="/cliente/tickets/nuevo"><Icon.plus size={17} />Crear ticket</Link></Card><Card className="flex items-center justify-between gap-4 !p-5"><div><h2 className="text-[16px] font-bold text-ink">Abrir asistente</h2><p className="mt-1 text-[13px] text-muted">Resuelve dudas frecuentes al instante.</p></div><Link className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] bg-turq px-5 text-[14px] font-semibold text-white" to="/chat"><Icon.bot size={17} />Abrir asistente</Link></Card></div>
      <Card pad={false}><div className="flex items-center justify-between p-5 pb-3"><h2 className="text-[17px] font-bold text-ink">Últimos tickets</h2><Link className="inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-turq hover:underline" to="/cliente/tickets">Ver todos <Icon.chevronR size={14} /></Link></div>{recent.length ? <TicketList tickets={recent} categories={categoryData} /> : <EmptyState title="Todavía no tienes actividad de tickets" desc="Cuando registres una solicitud aparecerá aquí." action={<Link className="inline-flex h-11 items-center rounded-[10px] bg-turq px-5 text-[14px] font-semibold text-white" to="/cliente/tickets/nuevo">Crear ticket</Link>} />}</Card>
    </div>}
  </section>
}

function StatTile({ label, value, icon: StatIcon, tone }: { label: string; value: number; icon: IconComponent; tone: 'ink' | 'turq' | 'warn' | 'green' }) {
  const toneClass = { ink: 'bg-[#e4eff4] text-ink-800', turq: 'bg-[#d9f0f1] text-turq-dark', warn: 'bg-[#fff1d6] text-warn', green: 'bg-[#e9f4d7] text-[#4c7a15]' }[tone]
  const marker = label === 'En atención' ? 'dashboard-open-count' : label === 'Resueltos' ? 'dashboard-finished-count' : ''
  return <Card className="!p-4 sm:!p-5"><span className={`mb-3 grid h-10 w-10 place-items-center rounded-[10px] ${toneClass}`}><StatIcon size={20} /></span><strong className={`block text-[25px] font-extrabold leading-none text-ink ${marker}`}>{value}</strong><span className="mt-1 block text-[12px] font-semibold text-muted">{label}</span></Card>
}
