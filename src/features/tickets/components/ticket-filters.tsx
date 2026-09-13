import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CategoryRead } from '../../faqs/types/faq-types'
import type { TicketListFilters } from '../types/ticket-types'

// eslint-disable-next-line react-refresh/only-export-components
export const emptyTicketFilters: TicketListFilters = { status: '', category_id: '', priority: '', created_from: '', created_to: '' }
function toIsoDate(value: string, endOfDay = false): string { if (!value) return ''; return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`).toISOString() }
export function TicketFilters({ categories, onApply }: { categories: CategoryRead[]; onApply: (filters: TicketListFilters) => void }) {
  const [filters, setFilters] = useState(emptyTicketFilters); const [dateError, setDateError] = useState('')
  const set = (key: keyof TicketListFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => { event.preventDefault(); if (filters.created_from && filters.created_to && filters.created_from > filters.created_to) { setDateError('La fecha desde no puede ser posterior a la fecha hasta.'); return }; setDateError(''); onApply({ ...filters, created_from: toIsoDate(filters.created_from), created_to: toIsoDate(filters.created_to, true) }) }
  const clear = () => { setFilters(emptyTicketFilters); setDateError(''); onApply(emptyTicketFilters) }
  return <form className="ticket-filters" onSubmit={submit}>
    <label>Estado<select value={filters.status} onChange={(e) => set('status', e.target.value)}><option value="">Todos</option>{['NUEVO','ASIGNADO','EN_PROCESO','PENDIENTE_CLIENTE','RESUELTO','CERRADO','CANCELADO'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
    <label>Prioridad<select value={filters.priority} onChange={(e) => set('priority', e.target.value)}><option value="">Todas</option>{['BAJA','MEDIA','ALTA','URGENTE'].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
    <label>Categoría<select value={filters.category_id} onChange={(e) => set('category_id', e.target.value)}><option value="">Todas</option>{categories.filter((c) => c.is_active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <label>Desde<input type="date" value={filters.created_from} onChange={(e) => set('created_from', e.target.value)} /></label><label>Hasta<input type="date" value={filters.created_to} onChange={(e) => set('created_to', e.target.value)} /></label>
    {dateError && <div className="form-error ticket-filter-error" role="alert">{dateError}</div>}<button className="button button-small" type="submit">Aplicar filtros</button><button className="button button-small button-ghost" type="button" onClick={clear}>Limpiar filtros</button>
  </form>
}
