import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExportReportMutation } from './use-reports'

const wrapper = ({ children }: { children: ReactNode }) => createElement(
  QueryClientProvider,
  { client: new QueryClient({ defaultOptions: { mutations: { retry: false } } }) },
  children,
)

describe('hook de exportación de reportes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sessionStorage.setItem('auth_token', 'report-hook-token')
  })

  it('expone el resultado CSV al componente de descarga', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('a,b\n1,2\n', {
      status: 200,
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="summary.csv"' },
    }))
    const { result } = renderHook(() => useExportReportMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ reportName: 'summary', filters: { format: 'csv' } })
    })

    await waitFor(() => expect(result.current.data?.filename).toBe('summary.csv'))
  })
})
