import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCategory,
  createFaq,
  setCategoryStatus,
  setFaqStatus,
  updateCategory,
  updateFaq,
} from './api/faq-api'
import {
  categoriesQueryKey,
  faqsQueryKey,
  useCreateCategoryMutation,
  useCreateFaqMutation,
  useSetCategoryStatusMutation,
  useSetFaqStatusMutation,
  useUpdateCategoryMutation,
  useUpdateFaqMutation,
} from './hooks/use-faqs'
import type { CategoryRead, FAQRead } from './types/faq-types'

const faqId = '11111111-1111-4111-8111-111111111111'
const categoryId = '22222222-2222-4222-8222-222222222222'

const faqResponse: FAQRead = {
  id: faqId,
  category_id: categoryId,
  question: 'Pregunta devuelta',
  answer: 'Respuesta devuelta',
  keywords: 'consulta',
  is_active: true,
  created_by: 'user-response',
  created_at: '2026-09-14T00:00:00Z',
  updated_at: '2026-09-14T00:00:00Z',
}

const categoryResponse: CategoryRead = {
  id: categoryId,
  name: 'Categoría devuelta',
  description: 'Descripción devuelta',
  is_active: true,
  created_at: '2026-09-14T00:00:00Z',
  updated_at: '2026-09-14T00:00:00Z',
}

function jsonResponse(value: FAQRead | CategoryRead): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('API de conocimiento', () => {
  beforeEach(() => {
    sessionStorage.setItem('auth_token', 'knowledge-session-token')
  })

  afterEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([
    {
      name: 'crea una FAQ',
      invoke: () => createFaq({
        category_id: 'category-create',
        question: '¿Pregunta nueva?',
        answer: 'Respuesta nueva',
        keywords: 'nueva,consulta',
      }),
      path: '/faqs',
      method: 'POST',
      body: {
        category_id: 'category-create',
        question: '¿Pregunta nueva?',
        answer: 'Respuesta nueva',
        keywords: 'nueva,consulta',
      },
      response: faqResponse,
    },
    {
      name: 'actualiza una FAQ',
      invoke: () => updateFaq(faqId, { answer: null, keywords: 'actualizada' }),
      path: `/faqs/${faqId}`,
      method: 'PATCH',
      body: { answer: null, keywords: 'actualizada' },
      response: faqResponse,
    },
    {
      name: 'cambia el estado de una FAQ',
      invoke: () => setFaqStatus(faqId, { is_active: false }),
      path: `/faqs/${faqId}/status`,
      method: 'PATCH',
      body: { is_active: false },
      response: faqResponse,
    },
    {
      name: 'crea una categoría',
      invoke: () => createCategory({ name: 'Categoría nueva', description: 'Descripción nueva' }),
      path: '/categories',
      method: 'POST',
      body: { name: 'Categoría nueva', description: 'Descripción nueva' },
      response: categoryResponse,
    },
    {
      name: 'actualiza una categoría',
      invoke: () => updateCategory(categoryId, { name: null, description: 'Descripción actualizada' }),
      path: `/categories/${categoryId}`,
      method: 'PATCH',
      body: { name: null, description: 'Descripción actualizada' },
      response: categoryResponse,
    },
    {
      name: 'cambia el estado de una categoría',
      invoke: () => setCategoryStatus(categoryId, { is_active: true }),
      path: `/categories/${categoryId}/status`,
      method: 'PATCH',
      body: { is_active: true },
      response: categoryResponse,
    },
  ])('$name con el contrato HTTP verificado', async ({ invoke, path, method, body, response }) => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(response))
    const localStorageWrite = vi.spyOn(Storage.prototype, 'setItem')
    localStorageWrite.mockClear()
    vi.stubGlobal('fetch', fetchSpy)

    await invoke()

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(init.headers)
    expect(url).toBe(`http://localhost:8000/api/v1${path}`)
    expect(init.method).toBe(method)
    expect(init.body).toBe(JSON.stringify(body))
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer knowledge-session-token')
    expect(localStorageWrite).not.toHaveBeenCalled()
  })

  it('invalida solamente FAQs después de sus mutaciones exitosas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(faqResponse))))
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      createElement(QueryClientProvider, { client: queryClient }, children)
    )
    const { result } = renderHook(() => ({
      create: useCreateFaqMutation(),
      update: useUpdateFaqMutation(),
      status: useSetFaqStatusMutation(),
    }), { wrapper })

    await act(async () => {
      await result.current.create.mutateAsync({
        category_id: 'category-create',
        question: '¿Pregunta nueva?',
        answer: 'Respuesta nueva',
        keywords: 'nueva',
      })
      await result.current.update.mutateAsync({ faqId, data: { question: 'Pregunta actualizada' } })
      await result.current.status.mutateAsync({ faqId, data: { is_active: false } })
    })

    expect(invalidate).toHaveBeenCalledTimes(3)
    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual([
      { queryKey: faqsQueryKey },
      { queryKey: faqsQueryKey },
      { queryKey: faqsQueryKey },
    ])
  })

  it('invalida solamente categorías después de sus mutaciones exitosas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(categoryResponse))))
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      createElement(QueryClientProvider, { client: queryClient }, children)
    )
    const { result } = renderHook(() => ({
      create: useCreateCategoryMutation(),
      update: useUpdateCategoryMutation(),
      status: useSetCategoryStatusMutation(),
    }), { wrapper })

    await act(async () => {
      await result.current.create.mutateAsync({ name: 'Categoría nueva', description: 'Descripción nueva' })
      await result.current.update.mutateAsync({ categoryId, data: { description: null } })
      await result.current.status.mutateAsync({ categoryId, data: { is_active: true } })
    })

    expect(invalidate).toHaveBeenCalledTimes(3)
    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual([
      { queryKey: categoriesQueryKey },
      { queryKey: categoriesQueryKey },
      { queryKey: categoriesQueryKey },
    ])
  })

  it('rechaza identificadores manipulados antes de realizar una solicitud', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    expect(() => updateFaq('../admin', { question: 'No enviar' })).toThrow(/identificador de faq/i)
    expect(() => setCategoryStatus('javascript:alert(1)', { is_active: false })).toThrow(/identificador de categoría/i)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
