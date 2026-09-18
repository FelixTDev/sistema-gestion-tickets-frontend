import { useState } from 'react'
import { PageHeader } from '../../../components/layout/page-header'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { ReportDistribution } from '../components/report-distribution'
import { ReportFiltersForm, emptyReportFilters } from '../components/report-filters'
import { ReportState } from '../components/report-state'
import { useCategoryReport, usePriorityReport, useReportSummary, useResolutionTimeReport, useStatusReport } from '../hooks/use-reports'
import type { ReportFilters } from '../types/report-types'

const cards = [['total_tickets', 'Total de tickets'], ['new_tickets', 'Nuevos'], ['assigned_tickets', 'Asignados'], ['in_process_tickets', 'En proceso'], ['pending_client_tickets', 'Pendientes del cliente'], ['resolved_tickets', 'Resueltos'], ['closed_tickets', 'Cerrados'], ['cancelled_tickets', 'Cancelados']] as const
export function SupervisorDashboardPage() {
  const [filters, setFilters] = useState<ReportFilters>(emptyReportFilters); const categories = useCategories(); const summary = useReportSummary(filters); const status = useStatusReport(filters); const category = useCategoryReport(filters); const priority = usePriorityReport(filters); const resolution = useResolutionTimeReport(filters)
  const reportsLoading = summary.isLoading || status.isLoading || category.isLoading || priority.isLoading || resolution.isLoading || categories.isLoading
  return <section className="supervisor-dashboard"><PageHeader eyebrow="Supervisión" title="Dashboard de supervisión" subtitle="Vista general de la operación de atención." /><ReportFiltersForm categories={categories.data ?? []} onApply={setFilters} />{categories.isError && <div className="state state-error" role="alert">No pudimos cargar las categorías de los filtros. Puedes consultar el reporte sin categoría.</div>}
    <ReportState isLoading={reportsLoading} isError={summary.isError} onRetry={() => { void summary.refetch(); void status.refetch(); void category.refetch(); void priority.refetch(); void resolution.refetch() }}>
      {summary.data && <div className="report-summary-grid">{cards.map(([key, title]) => <div className="card report-summary-card" key={key}><span>{title}</span><strong>{summary.data[key]}</strong></div>)}<div className="card report-summary-card"><span>Tiempo promedio de resolución</span><strong>{summary.data.average_resolution_time_hours} h</strong></div></div>}
    </ReportState>
    <div className="report-grid"><ReportState isLoading={status.isLoading} isError={status.isError} onRetry={() => { void status.refetch() }}><ReportDistribution title="Distribución por estado" items={status.data?.items ?? []} label={(item) => 'status' in item ? item.status.replaceAll('_', ' ') : ''} /></ReportState><ReportState isLoading={category.isLoading} isError={category.isError} onRetry={() => { void category.refetch() }}><ReportDistribution title="Distribución por categoría" items={category.data?.items ?? []} label={(item) => 'category_name' in item ? item.category_name : ''} /></ReportState><ReportState isLoading={priority.isLoading} isError={priority.isError} onRetry={() => { void priority.refetch() }}><ReportDistribution title="Distribución por prioridad" items={priority.data?.items ?? []} label={(item) => 'priority' in item ? item.priority : ''} /></ReportState><ReportState isLoading={resolution.isLoading} isError={resolution.isError} onRetry={() => { void resolution.refetch() }}><section className="report-card card"><h2>Tiempo de resolución</h2><p className="report-metric"><strong>{resolution.data?.average_resolution_time_hours ?? '—'}</strong> horas promedio</p><p>{resolution.data?.resolved_tickets ?? 0} tickets resueltos.</p></section></ReportState></div>
  </section>
}
