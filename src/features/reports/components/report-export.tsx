import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Icon } from '../../../components/ui/icons'
import { saveCsvDownload } from '../api/report-api'
import { useExportReportMutation } from '../hooks/use-reports'
import type { ReportExportFilters, ReportName } from '../types/report-types'

const exportableReports: Array<{ value: ReportName; label: string }> = [
  { value: 'summary', label: 'Resumen' },
  { value: 'by-status', label: 'Por estado' },
  { value: 'by-priority', label: 'Por prioridad' },
  { value: 'by-category', label: 'Por categoría' },
  { value: 'by-source', label: 'Por canal' },
  { value: 'by-advisor', label: 'Por asesor' },
  { value: 'created-tickets', label: 'Tickets creados' },
  { value: 'resolved-tickets', label: 'Tickets resueltos' },
  { value: 'first-response-time', label: 'Primera respuesta' },
  { value: 'resolution-time', label: 'Tiempo de resolución' },
  { value: 'sla-compliance', label: 'Cumplimiento SLA' },
  { value: 'conversations', label: 'Conversaciones' },
  { value: 'faq-utility', label: 'Utilidad FAQ' },
  { value: 'operational-activity', label: 'Actividad operativa' },
]

export function ReportExport({ filters }: { filters: ReportExportFilters }) {
  const [reportName, setReportName] = useState<ReportName>('summary')
  const exportMutation = useExportReportMutation()
  const download = async () => {
    try {
      const result = await exportMutation.mutateAsync({ reportName, filters: { ...filters, format: 'csv' } })
      saveCsvDownload(result)
    } catch {
      // The mutation exposes the error state below; no fabricated download is created.
    }
  }
  return <div className="flex flex-wrap items-center gap-2">
    <label className="sr-only" htmlFor="report-export-name">Reporte a exportar</label>
    <select id="report-export-name" value={reportName} onChange={(event) => setReportName(event.target.value as ReportName)} disabled={exportMutation.isPending}>
      {exportableReports.map((report) => <option key={report.value} value={report.value}>{report.label}</option>)}
    </select>
    <Button variant="secondary" icon={Icon.report} loading={exportMutation.isPending} onClick={() => { void download() }}>Exportar CSV</Button>
    {exportMutation.isError && <span className="text-[13px] text-danger" role="alert">No pudimos exportar el CSV. Inténtalo nuevamente.</span>}
    {exportMutation.isSuccess && <span className="text-[13px] text-turq-dark" role="status">CSV descargado.</span>}
  </div>
}
