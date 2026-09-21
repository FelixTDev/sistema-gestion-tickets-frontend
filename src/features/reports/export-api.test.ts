import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exportReport } from './api/report-api'

describe('exportación de reportes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sessionStorage.setItem('auth_token', 'report-token')
  })

  it('solicita únicamente CSV y conserva el nombre de archivo del servidor', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('id,total\n1,3\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': "attachment; filename*=UTF-8''reporte-resumen.csv",
      },
    }))

    const result = await exportReport('summary', {
      from: '2026-09-01T00:00:00Z',
      to: '2026-09-21T23:59:59Z',
      category_id: 'category-1',
      status: '',
      priority: '',
    })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/reports/summary/export?')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('format=csv')
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain('xlsx')
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Accept')).toBe('text/csv')
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe('Bearer report-token')
    expect(result.filename).toBe('reporte-resumen.csv')
    expect(await result.blob.text()).toContain('id,total')
  })

  it('rechaza XLSX antes de realizar una solicitud', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')

    await expect(exportReport('summary', { format: 'xlsx' })).rejects.toThrow(/solo csv/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
