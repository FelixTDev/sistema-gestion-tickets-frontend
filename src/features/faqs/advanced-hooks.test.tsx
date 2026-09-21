import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFaqFeedbackMutation, useFaqHistory, useFaqs } from './hooks/use-faqs'

const faqPage = { page: 1, page_size: 10, total: 1, total_pages: 1, items: [] }
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrapper = ({ children }: { children: ReactNode }) => createElement(
  QueryClientProvider,
  { client: queryClient },
  children,
)

describe('hooks de conocimiento', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
    sessionStorage.setItem('auth_token', 'hook-token')
  })

  it('mantiene paginación y filtros en la clave y la solicitud de FAQ públicas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(faqPage), { status: 200 }))
    const { result } = renderHook(() => useFaqs({ search: 'saldo', page: 2, page_size: 10 }), { wrapper })

    await act(async () => { await result.current.refetch() })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('search=saldo')
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('page=2')
    expect(result.current.data?.page ?? 1).toBe(1)
  })

  it('envía feedback y deja la mutación observable para la UI', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 'feedback-1', is_helpful: false, created_at: '2026-09-21T00:00:00Z' }), { status: 201 }))
    const { result } = renderHook(() => useFaqFeedbackMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ faqId: 'faq-1', data: { is_helpful: false } })
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    await waitFor(() => expect(result.current.data?.is_helpful).toBe(false))
  })

  it('carga el historial solo cuando se selecciona una FAQ', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('[]', { status: 200 }))
    const { result, rerender } = renderHook(({ faqId }: { faqId: string | null }) => useFaqHistory(faqId), {
      initialProps: { faqId: null as string | null },
      wrapper,
    })

    expect(fetchMock).not.toHaveBeenCalled()
    rerender({ faqId: 'faq-1' })
    await act(async () => { await result.current.refetch() })
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('/faqs/faq-1/history')
  })
})
