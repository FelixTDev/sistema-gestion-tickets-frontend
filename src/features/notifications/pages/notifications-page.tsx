import { useMemo, useState } from 'react'
import { Card } from '../../../components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { Button } from '../../../components/ui/button'
import { Select } from '../../../components/ui/form-controls'
import { Icon } from '../../../components/ui/icons'
import { NotificationList } from '../components/notification-list'
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useNotifications, useUnreadNotificationCount } from '../hooks/use-notifications'
import type { NotificationType } from '../types/notification-types'

const notificationTypes: ReadonlyArray<{ value: NotificationType | ''; label: string }> = [
  { value: '', label: 'Todas las notificaciones' },
  { value: 'ticket_created', label: 'Tickets creados' },
  { value: 'ticket_status_changed', label: 'Cambios de estado' },
  { value: 'ticket_assigned', label: 'Asignaciones' },
  { value: 'ticket_commented', label: 'Comentarios' },
  { value: 'password_changed', label: 'Contraseña' },
  { value: 'security_event', label: 'Seguridad' },
  { value: 'sla_warning', label: 'Alertas de SLA' },
  { value: 'sla_breached', label: 'Incumplimientos de SLA' },
  { value: 'chat_escalated', label: 'Escalaciones del asistente' },
]

export function NotificationsPage({ isStaff = false }: { isStaff?: boolean }) {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<NotificationType | ''>('')
  const notifications = useNotifications(page)
  const unread = useUnreadNotificationCount()
  const readMutation = useMarkNotificationReadMutation()
  const readAllMutation = useMarkAllNotificationsReadMutation()
  const items = notifications.data?.items ?? []
  const filteredItems = useMemo(() => type ? items.filter((notification) => notification.type === type) : items, [items, type])

  return <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6" aria-busy={notifications.isLoading || unread.isLoading}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-[12px] font-bold uppercase tracking-wider text-turq-dark">{isStaff ? 'Portal interno' : 'Portal del cliente'}</span><h1 className="mt-1 text-[26px] font-extrabold text-ink">Notificaciones</h1><p className="mt-1 text-[14.5px] text-muted">Consulta los avisos relacionados con tu actividad.</p></div><div className="rounded-full bg-[#e4eff4] px-3.5 py-2 text-[13px] font-semibold text-ink-800" aria-live="polite">{unread.isLoading ? 'Consultando…' : unread.isError ? 'Contador no disponible' : `${unread.data?.unread_count ?? 0} sin leer`}</div></div>
    {unread.isError && <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] px-4 py-3 text-[13.5px] text-[#8b1e1e]" role="alert"><span>No pudimos cargar el contador de no leídas.</span><Button variant="tertiary" size="sm" onClick={() => { void unread.refetch() }}>Reintentar</Button></div>}
    {readAllMutation.isSuccess && <p role="status" className="rounded-[10px] border border-[#b9d991] bg-[#f3f9e9] px-4 py-3 text-[13.5px] text-[#3f6512]">Notificaciones marcadas como leídas.</p>}
    <Card pad={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f3] p-4"><Select aria-label="Filtrar notificaciones" value={type} onChange={(event) => { setType(event.target.value as NotificationType | ''); setPage(1) }} className="min-w-[220px] !w-auto">{notificationTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select><Button variant="secondary" size="sm" icon={Icon.check} disabled={readAllMutation.isPending || (unread.data?.unread_count ?? 0) === 0} loading={readAllMutation.isPending} onClick={() => { void readAllMutation.mutateAsync() }}>Marcar todas como leídas</Button></div>
      {notifications.isLoading && <LoadingState message="Cargando tus notificaciones…" />}
      {notifications.isError && <ErrorState title="No pudimos cargar tus notificaciones" onRetry={() => { void notifications.refetch() }} />}
      {!notifications.isLoading && !notifications.isError && filteredItems.length === 0 && <EmptyState icon={Icon.bell} title="No tienes notificaciones" desc={type ? 'No hay avisos de este tipo en la página actual.' : 'Cuando exista actividad, aparecerá aquí.'} />}
      {!notifications.isLoading && !notifications.isError && filteredItems.length > 0 && <NotificationList notifications={filteredItems} readingId={readMutation.isPending ? readMutation.variables : undefined} onRead={(notificationId) => { void readMutation.mutateAsync(notificationId) }} />}
      {!notifications.isLoading && !notifications.isError && notifications.data && notifications.data.total_pages > 1 && <div className="flex items-center justify-between gap-3 border-t border-[#eef2f3] p-4"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button><span className="text-[13px] text-muted">Página {notifications.data.page} de {notifications.data.total_pages}</span><Button variant="secondary" size="sm" disabled={page >= notifications.data.total_pages} onClick={() => setPage((current) => current + 1)}>Siguiente</Button></div>}
    </Card>
  </section>
}
