import { useState } from 'react'
import type { CategoryRead } from '../../faqs/types/faq-types'
import type { ReportFilters } from '../types/report-types'

// eslint-disable-next-line react-refresh/only-export-components
export const emptyReportFilters: ReportFilters = { from: '', to: '', category_id: '', status: '', priority: '' }
function toIsoDate(value: string, endOfDay = false): string { if (!value) return ''; return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`).toISOString() }
export function ReportFiltersForm({ categories, onApply }: { categories: CategoryRead[]; onApply: (filters: ReportFilters) => void }) {
  const [filters, setFilters] = useState(emptyReportFilters)
  const update = (key: keyof ReportFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  return <form className="report-filters" onSubmit={(event) => { event.preventDefault(); onApply({ ...filters, from: toIsoDate(filters.from), to: toIsoDate(filters.to, true) }) }}>
    <label>Desde<input type="date" value={filters.from} onChange={(event) => update('from', event.target.value)} /></label>
    <label>Hasta<input type="date" value={filters.to} onChange={(event) => update('to', event.target.value)} /></label>
    <label>Categoría<select value={filters.category_id} onChange={(event) => update('category_id', event.target.value)}><option value="">Todas</option>{categories.filter((category) => category.is_active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <label>Estado<select value={filters.status} onChange={(event) => update('status', event.target.value)}><option value="">Todos</option>{['NUEVO','ASIGNADO','EN_PROCESO','PENDIENTE_CLIENTE','RESUELTO','CERRADO','CANCELADO'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
    <label>Prioridad<select value={filters.priority} onChange={(event) => update('priority', event.target.value)}><option value="">Todas</option>{['BAJA','MEDIA','ALTA','URGENTE'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
    <button className="button button-small" type="submit">Aplicar filtros</button>
  </form>
}
