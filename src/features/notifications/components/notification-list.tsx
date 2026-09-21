import { Link } from 'react-router-dom'
import { Icon } from '../../../components/ui/icons'
import type { NotificationRead } from '../types/notification-types'

const notificationDateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })

export function NotificationList({ notifications, onRead, readingId }: { notifications: NotificationRead[]; onRead: (notificationId: string) => void; readingId?: string }) {
  return <ul className="divide-y divide-[#eef2f3]" aria-label="Lista de notificaciones">
    {notifications.map((notification) => <li key={notification.id} className={`flex gap-3 p-4 sm:p-5 ${notification.is_read ? 'bg-white' : 'bg-[#f2fafb]'}`}>
      <span className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full ${notification.is_read ? 'bg-[#eef4f5] text-muted' : 'bg-[#d8f2f3] text-turq-dark'}`} aria-hidden="true"><Icon.bell size={17} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-bold text-ink">{notification.title}</h3>
          <time className="text-[12px] text-muted" dateTime={notification.created_at}>{notificationDateFormatter.format(new Date(notification.created_at))}</time>
        </div>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">{notification.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {notification.related_ticket_id && <Link className="text-[13px] font-semibold text-turq-dark hover:underline" to={`/cliente/tickets/${notification.related_ticket_id}`}>Ver ticket</Link>}
          {!notification.is_read && <button type="button" className="min-h-11 text-[13px] font-semibold text-turq-dark underline-offset-2 hover:underline" disabled={readingId === notification.id} onClick={() => onRead(notification.id)} aria-label={`Marcar como leída: ${notification.title}`}>{readingId === notification.id ? 'Marcando…' : 'Marcar como leída'}</button>}
        </div>
      </div>
    </li>)}
  </ul>
}
