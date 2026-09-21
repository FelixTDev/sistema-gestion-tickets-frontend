import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addFaqFeedback,
  getFaqHistory,
  getFaqs,
  getFaqUtilityMetrics,
  getAdminFaqs,
  updateFaqWorkflow,
} from './api/faq-api'

const faqId = '11111111-1111-4111-8111-111111111111'

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('contratos avanzados de conocimiento', () => {
  beforeEach(() => {
    sessionStorage.setItem('auth_token', 'knowledge-token')
    vi.restoreAllMocks()
  })

  it('consulta FAQ públicas paginadas y filtradas con los nombres reales del contrato', async () => {
    const response = { page: 2, page_size: 10, total: 12, total_pages: 2, items: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(response))

    await expect(getFaqs({
      search: 'saldo',
      category_id: 'category-1',
      tag: 'tarjeta',
      published_from: '2026-09-01T00:00:00Z',
      published_to: '2026-09-30T23:59:59Z',
      page: 2,
      page_size: 10,
    })).resolves.toEqual(response)

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/faqs?')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('search=saldo')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('category_id=category-1')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('page=2')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('page_size=10')
  })

  it('normaliza respuestas legacy en array sin romper consumidores de colección', async () => {
    const legacyFaq = {
      id: faqId,
      category_id: 'category-1',
      question: 'Pregunta legacy',
      answer: 'Respuesta legacy',
      keywords: 'legacy',
      is_active: true,
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([legacyFaq]))

    const result = await getFaqs()

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(result.items).toEqual([legacyFaq])
    expect(result.filter((faq) => faq.id === faqId)).toEqual([legacyFaq])
    expect(result.slice(0, 1)).toEqual([legacyFaq])
    expect(result.map((faq) => faq.question)).toEqual(['Pregunta legacy'])
  })

  it('consulta FAQ admin, workflow, historial, métricas y feedback sin inventar rutas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/feedback')) return jsonResponse({ id: 'feedback-1', is_helpful: true, created_at: '2026-09-21T00:00:00Z' })
      if (url.includes('/history')) return jsonResponse([])
      if (url.includes('/metrics/utility')) return jsonResponse({ total_feedback: 1, helpful: 1, not_helpful: 0, usefulness_rate: 100 })
      if (url.includes('/workflow')) return jsonResponse({ id: faqId, status: 'PUBLISHED' })
      return jsonResponse({ page: 1, page_size: 20, total: 0, total_pages: 0, items: [] })
    })

    await getAdminFaqs({ status: 'REVIEW', search: 'saldo', page: 1, page_size: 20 })
    await updateFaqWorkflow(faqId, { status: 'PUBLISHED' })
    await getFaqHistory(faqId)
    await getFaqUtilityMetrics()
    await addFaqFeedback(faqId, { is_helpful: true, comment: 'Claro' })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/faqs/admin?')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('status=REVIEW')
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(`http://localhost:8000/api/v1/faqs/${faqId}/workflow`)
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: 'PATCH' })
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ status: 'PUBLISHED' })
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain(`/faqs/${faqId}/history`)
    expect(String(fetchMock.mock.calls[3]?.[0])).toContain('/faqs/admin/metrics/utility')
    expect(fetchMock.mock.calls[4]?.[1]).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String(fetchMock.mock.calls[4]?.[1]?.body))).toEqual({ is_helpful: true, comment: 'Claro' })
    expect(new Headers(fetchMock.mock.calls[4]?.[1]?.headers).get('Authorization')).toBe('Bearer knowledge-token')
  })
})
