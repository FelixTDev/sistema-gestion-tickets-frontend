import { apiClient } from '../../../lib/api-client'
import type { AuditFilters, AuditPage } from '../types/audit-types'

function query(filters: AuditFilters): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  const value = params.toString()
  return value ? `?${value}` : ''
}

export function listAudit(filters: AuditFilters = {}): Promise<AuditPage> {
  const page = filters.page ?? 1
  const pageSize = filters.page_size ?? 20
  return apiClient.get<AuditPage>(`/audit${query({ ...filters, page, page_size: pageSize })}`)
}
