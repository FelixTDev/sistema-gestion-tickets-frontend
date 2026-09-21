import { useState } from 'react'
import { Card } from '../../../components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { PageHeader } from '../../../components/layout/page-header'
import { AuditFiltersForm } from '../components/audit-filters'
import { AuditPagination } from '../components/audit-pagination'
import { AuditTable } from '../components/audit-table'
import { useAudit } from '../hooks/use-audit'
import type { AuditFilters } from '../types/audit-types'

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, page_size: 20 })
  const audit = useAudit(filters)
  const page = audit.data
  return <section className="audit-page">
    <PageHeader eyebrow="Supervisión" title="Auditoría" subtitle="Consulta global de eventos operativos con datos sensibles ocultos." />
    <AuditFiltersForm onApply={setFilters} />
    {audit.isLoading && <LoadingState message="Cargando auditoría…" />}
    {audit.isError && <Card><ErrorState title="No pudimos cargar la auditoría" onRetry={() => { void audit.refetch() }} /></Card>}
    {!audit.isLoading && !audit.isError && page && <Card pad={false}>
      {page.items.length === 0 ? <EmptyState title="No hay eventos de auditoría" desc="No existen eventos para los filtros seleccionados." /> : <AuditTable items={page.items} />}
      <div className="px-5 sm:px-6"><AuditPagination page={page.page} totalPages={page.total_pages} onPageChange={(nextPage) => setFilters((current) => ({ ...current, page: nextPage }))} /></div>
    </Card>}
  </section>
}
