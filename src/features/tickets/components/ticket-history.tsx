import type { HistoryRead } from '../types/ticket-types'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function TicketHistory({ items }: { items: HistoryRead[] }) {
  if (items.length === 0) return <div className="state"><strong>Aún no hay eventos en el historial.</strong><span>Las actualizaciones del ticket aparecerán aquí.</span></div>

  const ordered = [...items].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
  return <ol className="ticket-history-list">
    {ordered.map((item) => <li key={item.id}>
      <span className="ticket-history-marker" aria-hidden="true" />
      <div><strong>{item.description}</strong><time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
        {(item.old_value || item.new_value) && <small>{item.old_value ?? 'Sin valor'} → {item.new_value ?? 'Sin valor'}</small>}
      </div>
    </li>)}
  </ol>
}
