import { apiClient } from '../../../lib/api-client'
import { assertSafePathSegment } from '../../../lib/identifiers'
import type { CategoryReportItem, CsvReportDownload, PriorityReportItem, Report, ReportExportFilters, ReportFilters, ReportName, ResolutionTimeReport, StatusReportItem, SummaryReport } from '../types/report-types'

function query(filters: ReportFilters): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value) })
  const value = params.toString(); return value ? `?${value}` : ''
}
export function getReportSummary(filters: ReportFilters): Promise<SummaryReport> { return apiClient.get<SummaryReport>(`/reports/summary${query(filters)}`) }
export function getStatusReport(filters: ReportFilters): Promise<Report<StatusReportItem>> { return apiClient.get<Report<StatusReportItem>>(`/reports/by-status${query(filters)}`) }
export function getCategoryReport(filters: ReportFilters): Promise<Report<CategoryReportItem>> { return apiClient.get<Report<CategoryReportItem>>(`/reports/by-category${query(filters)}`) }
export function getPriorityReport(filters: ReportFilters): Promise<Report<PriorityReportItem>> { return apiClient.get<Report<PriorityReportItem>>(`/reports/by-priority${query(filters)}`) }
export function getResolutionTimeReport(filters: ReportFilters): Promise<ResolutionTimeReport> { return apiClient.get<ResolutionTimeReport>(`/reports/resolution-time${query(filters)}`) }

function exportQuery(filters: ReportExportFilters): string {
  const params = new URLSearchParams()
  params.set('format', filters.format ?? 'csv')
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'format' || value === undefined || value === '') return
    params.set(key, String(value))
  })
  return params.toString()
}

function getFilename(contentDisposition: string | null, reportName: ReportName): string {
  const disposition = contentDisposition ?? ''
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const quoted = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  const candidate = encoded ? decodeURIComponent(encoded) : quoted
  const safeCandidate = candidate?.replace(/[/\\?%*:|"<>]/g, '-').trim()
  return safeCandidate || `${reportName}.csv`
}

export async function exportReport(reportName: ReportName, filters: ReportExportFilters = {}): Promise<CsvReportDownload> {
  const format = filters.format ?? 'csv'
  if (format !== 'csv') throw new Error('Solo CSV está disponible para exportar reportes.')
  assertSafePathSegment(reportName, 'Nombre de reporte')
  const response = await apiClient.download(`/reports/${reportName}/export?${exportQuery({ ...filters, format })}`, { headers: { Accept: 'text/csv' } })
  return {
    blob: response.blob,
    filename: getFilename(response.contentDisposition, reportName),
    contentType: response.contentType ?? 'text/csv',
  }
}

export function saveCsvDownload(download: CsvReportDownload): void {
  const url = URL.createObjectURL(download.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = download.filename
  link.click()
  URL.revokeObjectURL(url)
}
