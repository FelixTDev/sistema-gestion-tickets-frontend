import { useState, type FormEvent } from 'react'
import type { AuditFilters } from '../types/audit-types'

const emptyFilters: AuditFilters = { page: 1, page_size: 20 }

export function AuditFiltersForm({ onApply }: { onApply: (filters: AuditFilters) => void }) {
  const [filters, setFilters] = useState<AuditFilters>(emptyFilters)
  const update = (key: keyof AuditFilters, value: string | boolean | undefined) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onApply({ ...filters, page: 1 }) }
  const clear = () => { setFilters(emptyFilters); onApply(emptyFilters) }

  return (
    <form className="audit-filters" onSubmit={submit}>
      <label htmlFor="audit-search">Buscar<input id="audit-search" value={filters.search ?? ''} onChange={(event) => update('search', event.target.value)} /></label>
      <label htmlFor="audit-resource-type">Recurso<input id="audit-resource-type" value={filters.resource_type ?? ''} onChange={(event) => update('resource_type', event.target.value)} /></label>
      <label htmlFor="audit-action">Acción<input id="audit-action" value={filters.action ?? ''} onChange={(event) => update('action', event.target.value)} /></label>
      <label htmlFor="audit-success">Resultado<select id="audit-success" value={filters.success === undefined ? '' : String(filters.success)} onChange={(event) => update('success', event.target.value === '' ? undefined : event.target.value === 'true')}><option value="">Todos</option><option value="true">Exitoso</option><option value="false">Fallido</option></select></label>
      <div className="flex gap-2"><button className="button button-small" type="submit">Aplicar filtros</button><button className="button button-small button-ghost" type="button" onClick={clear}>Limpiar filtros</button></div>
    </form>
  )
}
