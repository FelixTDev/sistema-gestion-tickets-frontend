import { useQuery } from '@tanstack/react-query'
import { listAudit } from '../api/audit-api'
import type { AuditFilters } from '../types/audit-types'

export const auditQueryKey = (filters: AuditFilters) => ['audit', filters] as const

export function useAudit(filters: AuditFilters = { page: 1, page_size: 20 }) {
  return useQuery({ queryKey: auditQueryKey(filters), queryFn: () => listAudit(filters), retry: false })
}
