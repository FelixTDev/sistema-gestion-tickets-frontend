import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { PageHeader } from '../../../components/layout/page-header'
import { useCategories } from '../../faqs/hooks/use-faqs'
import { ReportDistribution } from '../components/report-distribution'
import { ReportFiltersForm, emptyReportFilters } from '../components/report-filters'
import { ReportState } from '../components/report-state'
import { useCategoryReport, usePriorityReport, useReportSummary, useResolutionTimeReport, useStatusReport } from '../hooks/use-reports'
import type { ReportFilters } from '../types/report-types'

const summaryCards = [
  ['total_tickets', 'Total de solicitudes'], ['new_tickets', 'Nuevos'], ['assigned_tickets', 'Asignados'], ['in_process_tickets', 'En proceso'],
  ['pending_client_tickets', 'Pendientes del cliente'], ['resolved_tickets', 'Resueltos'], ['closed_tickets', 'Cerrados'], ['cancelled_tickets', 'Cancelados'],
] as const

export function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>(emptyReportFilters)
  const categories = useCategories(); const summary = useReportSummary(filters); const status = useStatusReport(filters); const category = useCategoryReport(filters); const priority = usePriorityReport(filters); const resolution = useResolutionTimeReport(filters)
  const retryAll = () => { void summary.refetch(); void status.refetch(); void category.refetch(); void priority.refetch(); void resolution.refetch(); void categories.refetch() }
  const reportLoading = summary.isLoading || status.isLoading || category.isLoading || priority.isLoading || resolution.isLoading
  return <section className="reports-page">
    <PageHeader eyebrow="Supervisión" title="Reportes" subtitle="Resumen ejecutivo del desempeño de atención." action={<Button variant="secondary" disabled title="Funcionalidad no disponible">Exportar</Button>} />
    <p className="reports-unavailable" role="note">Exportar: Funcionalidad no disponible.</p>
    <ReportFiltersForm categories={categories.data ?? []} onApply={setFilters} />
    <ReportState isLoading={reportLoading} isError={summary.isError} onRetry={retryAll}>
      {summary.data ? <div className="report-summary-grid">{summaryCards.map(([key, label]) => <Card className="report-summary-card" key={key}><span>{label}</span><strong>{summary.data[key]}</strong></Card>)}<Card className="report-summary-card"><span>Tiempo promedio de resolución</span><strong>{summary.data.average_resolution_time_hours} h</strong></Card></div> : <Card><p className="state">No hay resumen para los filtros seleccionados.</p></Card>}
    </ReportState>
    <div className="report-grid">
      <ReportState isLoading={status.isLoading} isError={status.isError} onRetry={() => { void status.refetch() }}><ReportDistribution title="Tickets por estado" items={status.data?.items ?? []} label={(item) => 'status' in item ? item.status.replaceAll('_', ' ') : ''} /></ReportState>
      <ReportState isLoading={category.isLoading} isError={category.isError} onRetry={() => { void category.refetch() }}><ReportDistribution title="Tickets por categoría" items={category.data?.items ?? []} label={(item) => 'category_name' in item ? item.category_name : ''} /></ReportState>
      <ReportState isLoading={priority.isLoading} isError={priority.isError} onRetry={() => { void priority.refetch() }}><ReportDistribution title="Tickets por prioridad" items={priority.data?.items ?? []} label={(item) => 'priority' in item ? item.priority : ''} /></ReportState>
      <ReportState isLoading={resolution.isLoading} isError={resolution.isError} onRetry={() => { void resolution.refetch() }}><Card className="report-card"><h2>Tiempo de resolución</h2>{resolution.data ? <><p className="report-metric"><strong>{resolution.data.average_resolution_time_hours}</strong> horas promedio</p><p>{resolution.data.resolved_tickets} tickets resueltos.</p></> : <p className="state">Sin datos para mostrar.</p>}</Card></ReportState>
    </div>
  </section>
}
