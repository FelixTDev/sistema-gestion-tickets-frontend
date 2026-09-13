import { apiClient } from '../../../lib/api-client'
import type { CategoryReportItem, PriorityReportItem, Report, ReportFilters, ResolutionTimeReport, StatusReportItem, SummaryReport } from '../types/report-types'

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
