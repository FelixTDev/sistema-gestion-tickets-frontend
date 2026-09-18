import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { Icon, type IconComponent } from '../../../components/ui/icons'
import { useAuth } from '../../auth/auth-provider'
import { useOperationalTickets } from '../hooks/use-tickets'
import { sortTicketsNewestFirst } from '../ticket-utils'
import type { TicketRead } from '../types/ticket-types'
import { TicketStatusBadge } from '../components/ticket-badges'

function StatTile({ label, value, icon: StatIcon, tone }: { label: string; value: number; icon: IconComponent; tone: 'ink' | 'turq' | 'danger' }) {
  const toneClass = { ink: 'bg-[#e4eff4] text-ink-800', turq: 'bg-[#d9f0f1] text-turq-dark', danger: 'bg-[#fbe3e2] text-danger' }[tone]
  return <Card className="!p-4 sm:!p-5"><span className={`mb-3 grid h-10 w-10 place-items-center rounded-[10px] ${toneClass}`}><StatIcon size={20} /></span><strong className="block text-[25px] font-extrabold leading-none text-ink">{value}</strong><span className="mt-1 block text-[12px] font-semibold text-muted">{label}</span></Card>
}

function RecentQueue({ tickets }: { tickets: TicketRead[] }) {
  const recent = sortTicketsNewestFirst(tickets).slice(0, 4)
  if (recent.length === 0) return <EmptyState icon={Icon.inbox} title="Sin actividad reciente" desc="Los tickets recibidos aparecerán aquí." />
  return <ul className="divide-y divide-[#eef2f3]">{recent.map((ticket) => <li key={ticket.id}><Link to={`/personal/tickets/${ticket.id}`} className="flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#fafcfc] focus-visible:outline-2 focus-visible:outline-turq"><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-ink">{ticket.subject}</p><p className="mt-0.5 font-mono text-[12px] text-muted">{ticket.tracking_code}</p></div><TicketStatusBadge status={ticket.status} /></Link></li>)}</ul>
}

export function AdvisorDashboardPage() {
  const { user } = useAuth()
  const ticketsQuery = useOperationalTickets({ status: '', category_id: '', priority: '', created_from: '', created_to: '' })
  const tickets = Array.isArray(ticketsQuery.data) ? ticketsQuery.data : []
  const pending = tickets.filter((ticket) => ticket.status === 'NUEVO').length
  const assigned = tickets.filter((ticket) => ticket.assigned_advisor_id === user?.id).length
  const urgent = tickets.filter((ticket) => ticket.priority === 'URGENTE' && !['CERRADO', 'CANCELADO'].includes(ticket.status)).length

  if (ticketsQuery.isLoading) return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><LoadingState message="Cargando tu resumen operativo…" /></section>
  if (ticketsQuery.isError) return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><ErrorState title="No pudimos cargar tu resumen" desc="Comprueba tu conexión e inténtalo nuevamente." onRetry={() => { void ticketsQuery.refetch() }} /></section>
  if (tickets.length === 0) return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="mb-6"><h1 className="text-[27px] font-extrabold text-ink">Buen día, {user?.full_name ?? 'equipo de atención'}</h1><p className="mt-1 text-[14.5px] text-muted">Resumen operativo de tu jornada.</p></div><Card><EmptyState icon={Icon.inbox} title="Sin tickets para mostrar" desc="Cuando exista actividad operativa, aparecerá aquí." /></Card></section>
  return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <div className="mb-6"><h1 className="text-[27px] font-extrabold text-ink">Buen día, {user?.full_name ?? 'equipo de atención'}</h1><p className="mt-1 text-[14.5px] text-muted">Resumen operativo de tu jornada.</p></div>
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3"><StatTile label="Tickets pendientes" value={pending} icon={Icon.inbox} tone="ink" /><StatTile label="Asignados a ti" value={assigned} icon={Icon.ticket} tone="turq" /><StatTile label="Urgentes" value={urgent} icon={Icon.flag} tone="danger" /></div>
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Card pad={false}><div className="flex items-center justify-between p-5 pb-3"><h2 className="text-[17px] font-bold text-ink">Actividad reciente</h2><Link to="/personal/tickets" className="flex items-center gap-1 text-[13px] font-semibold text-turq hover:underline">Ir a bandeja <Icon.chevronR size={14} /></Link></div><RecentQueue tickets={tickets} /></Card><Card className="flex flex-col justify-center border-none bg-gradient-to-br from-[#06243a] to-[#0b4963] text-center text-white"><Icon.inbox size={32} className="mx-auto mb-3 text-green" /><p className="mb-1 text-[16px] font-bold">Bandeja operativa</p><p className="mb-4 text-[13px] text-[#c6d7de]">{pending} tickets esperan ser atendidos.</p><Link to="/personal/tickets" className="button button-light">Ir a bandeja</Link></Card></div>
  </section>
}
