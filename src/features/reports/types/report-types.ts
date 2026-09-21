import type { TicketPriority, TicketStatus } from '../../tickets/types/ticket-types'

export interface ReportFilters {
  from: string
  to: string
  category_id: string
  status: TicketStatus | ''
  priority: TicketPriority | ''
}

export interface ReportExportFilters extends Partial<ReportFilters> {
  format?: ReportFormat
  source?: string
  advisor_id?: string
  client_id?: string
  sla_compliant?: boolean
  search?: string
  limit?: number
}

export type ReportName =
  | 'summary'
  | 'by-status'
  | 'by-priority'
  | 'by-category'
  | 'by-source'
  | 'by-advisor'
  | 'created-tickets'
  | 'resolved-tickets'
  | 'first-response-time'
  | 'resolution-time'
  | 'sla-compliance'
  | 'conversations'
  | 'faq-utility'
  | 'operational-activity'

export type ReportFormat = 'csv' | 'xlsx'

export interface SummaryReport {
  total_tickets: number
  new_tickets: number
  assigned_tickets: number
  in_process_tickets: number
  pending_client_tickets: number
  resolved_tickets: number
  closed_tickets: number
  cancelled_tickets: number
  average_resolution_time_hours: number
}

export interface StatusReportItem { status: TicketStatus; count: number }
export interface CategoryReportItem { category_id: string; category_name: string; count: number }
export interface PriorityReportItem { priority: TicketPriority; count: number }
export interface ResolutionTimeReport { resolved_tickets: number; average_resolution_time_hours: number }
export interface Report<T> { items: T[] }

export interface CsvReportDownload {
  blob: Blob
  filename: string
  contentType: string
}
