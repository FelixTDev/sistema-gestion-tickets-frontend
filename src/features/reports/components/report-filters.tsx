import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CategoryRead } from '../../faqs/types/faq-types'
import type { ReportFilters } from '../types/report-types'

// eslint-disable-next-line react-refresh/only-export-components
export const emptyReportFilters: ReportFilters = { from: '', to: '', category_id: '', status: '', priority: '' }
function toIsoDate(value: string, endOfDay = false): string { if (!value) return ''; return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`).toISOString() }
export function ReportFiltersForm({ categories, onApply }: { categories: CategoryRead[]; onApply: (filters: ReportFilters) => void }) {
  const [filters, setFilters] = useState(emptyReportFilters); const [dateError, setDateError] = useState('')
  const update = (key: keyof ReportFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => { event.preventDefault(); if (filters.from && filters.to && filters.from > filters.to) { setDateError('La fecha desde no puede ser posterior a la fecha hasta.'); return }; setDateError(''); onApply({ ...filters, from: toIsoDate(filters.from), to: toIsoDate(filters.to, true) }) }
  const clear = () => { const empty = { ...emptyReportFilters }; setFilters(empty); setDateError(''); onApply(empty) }
  return <form className="report-filters" onSubmit={submit}>
    <label htmlFor="report-from">Desde<input id="report-from" name="from" autoComplete="off" type="date" value={filters.from} onChange={(event) => update('from', event.target.value)} /></label>
    <label htmlFor="report-to">Hasta<input id="report-to" name="to" autoComplete="off" type="date" value={filters.to} onChange={(event) => update('to', event.target.value)} /></label>
    <label htmlFor="report-category">Categoría<select id="report-category" name="category_id" autoComplete="off" value={filters.category_id} onChange={(event) => update('category_id', event.target.value)}><option value="">Todas</option>{categories.filter((category) => category.is_active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <label htmlFor="report-status">Estado<select id="report-status" name="status" autoComplete="off" value={filters.status} onChange={(event) => update('status', event.target.value)}><option value="">Todos</option>{['NUEVO','ASIGNADO','EN_PROCESO','PENDIENTE_CLIENTE','RESUELTO','CERRADO','CANCELADO'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
    <label htmlFor="report-priority">Prioridad<select id="report-priority" name="priority" autoComplete="off" value={filters.priority} onChange={(event) => update('priority', event.target.value)}><option value="">Todas</option>{['BAJA','MEDIA','ALTA','URGENTE'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
    {dateError && <div className="form-error report-filter-error" role="alert">{dateError}</div>}<button className="button button-small" type="submit">Aplicar filtros</button><button className="button button-small button-ghost" type="button" onClick={clear}>Limpiar filtros</button>
  </form>
}
