import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAudit } from './use-audit'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrapper = ({ children }: { children: ReactNode }) => createElement(
  QueryClientProvider,
  { client: queryClient },
  children,
)

describe('hook de auditoría', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
    sessionStorage.setItem('auth_token', 'audit-hook-token')
  })

  it('refleja la página solicitada en la query y conserva sus resultados', async () => {
    const page = { page: 3, page_size: 20, total: 41, total_pages: 3, items: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(page), { status: 200 }))
    const { result } = renderHook(() => useAudit({ page: 3, page_size: 20 }), { wrapper })

    await act(async () => { await result.current.refetch() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('page=3')
  })
})
