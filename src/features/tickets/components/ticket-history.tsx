import type { HistoryRead } from '../types/ticket-types'

function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
export function TicketHistory({ items }: { items: HistoryRead[] }) {
  if (items.length === 0) return <div className="rounded-[10px] bg-[#f4f7f8] p-4 text-[13.5px] text-muted"><strong className="block text-ink">Aún no hay eventos en el historial.</strong><span>Las actualizaciones del ticket aparecerán aquí.</span></div>
  const ordered = [...items].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
  return <ol className="relative space-y-5 border-l border-[#cdd9de] pl-6">{ordered.map((item) => <li key={item.id} className="relative"><span className="absolute -left-[31px] top-0.5 grid h-5 w-5 place-items-center rounded-full border-4 border-white bg-turq" aria-hidden="true" /><strong className="block text-[13.5px] text-ink">{item.description}</strong><time className="mt-1 block text-[11px] text-muted" dateTime={item.created_at}>{formatDate(item.created_at)}</time>{(item.old_value || item.new_value) && <small className="mt-1 block text-[12px] text-muted">{item.old_value ?? 'Sin valor'} → {item.new_value ?? 'Sin valor'}</small>}</li>)}</ol>
}
