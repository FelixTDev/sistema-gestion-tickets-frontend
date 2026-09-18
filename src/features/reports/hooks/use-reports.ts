import { useQuery } from '@tanstack/react-query'
import { getCategoryReport, getPriorityReport, getReportSummary, getResolutionTimeReport, getStatusReport } from '../api/report-api'
import type { ReportFilters } from '../types/report-types'

export const reportQueryKey = (name: string, filters: ReportFilters) => ['report', name, filters] as const
export function useReportSummary(filters: ReportFilters) { return useQuery({ queryKey: reportQueryKey('summary', filters), queryFn: () => getReportSummary(filters), retry: false }) }
export const useSummaryReport = useReportSummary
export function useStatusReport(filters: ReportFilters) { return useQuery({ queryKey: reportQueryKey('status', filters), queryFn: () => getStatusReport(filters), retry: false }) }
export function useCategoryReport(filters: ReportFilters) { return useQuery({ queryKey: reportQueryKey('category', filters), queryFn: () => getCategoryReport(filters), retry: false }) }
export function usePriorityReport(filters: ReportFilters) { return useQuery({ queryKey: reportQueryKey('priority', filters), queryFn: () => getPriorityReport(filters), retry: false }) }
export function useResolutionTimeReport(filters: ReportFilters) { return useQuery({ queryKey: reportQueryKey('resolution-time', filters), queryFn: () => getResolutionTimeReport(filters), retry: false }) }
