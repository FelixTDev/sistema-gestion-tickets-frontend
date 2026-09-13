import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCategoryReport, getPriorityReport, getReportSummary, getResolutionTimeReport, getStatusReport } from './api/report-api'
import { listAdvisors, assignTicket } from '../tickets/api/ticket-api'
import type { ReportFilters } from './types/report-types'

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
const filters: ReportFilters = { from: '2026-09-01T00:00:00Z', to: '2026-09-13T23:59:59Z', category_id: 'cat-1', status: 'EN_PROCESO', priority: 'ALTA' }

describe('API de reportes y asesores', () => {
  beforeEach(() => { vi.restoreAllMocks() })
  it('consume el resumen y reportes con query params reales', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse({ items: [] })))
    await getReportSummary(filters); await getStatusReport(filters); await getCategoryReport(filters); await getPriorityReport(filters); await getResolutionTimeReport(filters)
    expect(fetchMock.mock.calls).toHaveLength(5)
    for (const [input] of fetchMock.mock.calls) expect(String(input)).toContain('from=2026-09-01T00%3A00%3A00Z')
    expect(String(fetchMock.mock.calls[0][0])).toContain('/reports/summary')
    expect(String(fetchMock.mock.calls[1][0])).toContain('/reports/by-status')
    expect(String(fetchMock.mock.calls[2][0])).toContain('/reports/by-category')
    expect(String(fetchMock.mock.calls[3][0])).toContain('/reports/by-priority')
    expect(String(fetchMock.mock.calls[4][0])).toContain('/reports/resolution-time')
  })
  it('lista asesores y asigna sin inventar campos', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse([])))
    await listAdvisors(); await assignTicket('ticket-1', { advisor_id: 'advisor-1' })
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/users\/advisors$/)
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ advisor_id: 'advisor-1' })
  })
})
