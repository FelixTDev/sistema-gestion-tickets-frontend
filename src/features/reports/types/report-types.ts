import type { TicketPriority, TicketStatus } from '../../tickets/types/ticket-types'

export interface ReportFilters { from: string; to: string; category_id: string; status: TicketStatus | ''; priority: TicketPriority | '' }
export interface SummaryReport { total_tickets: number; new_tickets: number; assigned_tickets: number; in_process_tickets: number; pending_client_tickets: number; resolved_tickets: number; closed_tickets: number; cancelled_tickets: number; average_resolution_time_hours: number }
export interface StatusReportItem { status: TicketStatus; count: number }
export interface CategoryReportItem { category_id: string; category_name: string; count: number }
export interface PriorityReportItem { priority: TicketPriority; count: number }
export interface ResolutionTimeReport { resolved_tickets: number; average_resolution_time_hours: number }
export interface Report<T> { items: T[] }
