import { apiClient } from '../../../lib/api-client'
import { assertSafePathSegment } from '../../../lib/identifiers'
import type {
  ActiveStatusUpdate,
  CategoryCreate,
  CategoryRead,
  CategoryUpdate,
  FAQCreate,
  FAQAdminFilters,
  FAQAdminPage,
  FAQFeedbackCreate,
  FAQFeedbackRead,
  FAQPage,
  FAQPublicFilters,
  FAQRead,
  FAQUtilityMetrics,
  FAQVersionRead,
  FAQUpdate,
  WorkflowStatusUpdate,
} from '../types/faq-types'

type FaqListResponse = FAQPage | FAQRead[]
type FAQPageData = Omit<FAQPage, 'filter' | 'slice' | 'map'>

function query(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') searchParams.set(key, String(value))
  })
  const value = searchParams.toString()
  return value ? `?${value}` : ''
}

function decoratePage(page: FAQPageData): FAQPage {
  const items = Array.isArray(page.items) ? page.items : []
  const decorated = { ...page, items } as FAQPage
  Object.defineProperties(decorated, {
    filter: { value: (predicate: (value: FAQRead, index: number, array: FAQRead[]) => unknown) => items.filter(predicate), enumerable: false },
    slice: { value: (start?: number, end?: number) => items.slice(start, end), enumerable: false },
    map: { value: <U>(callback: (value: FAQRead, index: number, array: FAQRead[]) => U) => items.map(callback), enumerable: false },
  })
  return decorated
}

function normalizePage(response: unknown, page = 1, pageSize = 20): FAQPage {
  if (Array.isArray(response)) {
    return decoratePage({
      page,
      page_size: pageSize,
      total: response.length,
      total_pages: response.length > 0 ? 1 : 0,
      items: response as FAQRead[],
    })
  }

  if (typeof response !== 'object' || response === null) {
    return decoratePage({ page, page_size: pageSize, total: 0, total_pages: 0, items: [] })
  }

  const value = response as Record<string, unknown>
  const items = Array.isArray(value.items) ? value.items as FAQRead[] : []
  return decoratePage({
    page: typeof value.page === 'number' ? value.page : page,
    page_size: typeof value.page_size === 'number' ? value.page_size : pageSize,
    total: typeof value.total === 'number' ? value.total : items.length,
    total_pages: typeof value.total_pages === 'number' ? value.total_pages : items.length > 0 ? 1 : 0,
    items,
  })
}

export async function getFaqs(filters: FAQPublicFilters = {}): Promise<FAQPage> {
  const response = await apiClient.get<FaqListResponse>(`/faqs${query({ ...filters })}`)
  return normalizePage(response, filters.page, filters.page_size)
}

export function getAdminFaqs(filters: FAQAdminFilters = {}): Promise<FAQAdminPage> {
  const page = filters.page ?? 1
  const pageSize = filters.page_size ?? 20
  return apiClient.get<FAQAdminPage>(`/faqs/admin${query({ ...filters, page, page_size: pageSize })}`)
}

export function getCategories(): Promise<CategoryRead[]> {
  return apiClient.get<CategoryRead[]>('/categories')
}

export function createFaq(data: FAQCreate): Promise<FAQRead> {
  return apiClient.post<FAQRead>('/faqs', data)
}

export function updateFaq(faqId: string, data: FAQUpdate): Promise<FAQRead> {
  assertSafePathSegment(faqId, 'Identificador de FAQ')
  return apiClient.patch<FAQRead>(`/faqs/${faqId}`, data)
}

export function setFaqStatus(faqId: string, data: ActiveStatusUpdate): Promise<FAQRead> {
  assertSafePathSegment(faqId, 'Identificador de FAQ')
  return apiClient.patch<FAQRead>(`/faqs/${faqId}/status`, data)
}

export function updateFaqWorkflow(faqId: string, data: WorkflowStatusUpdate): Promise<FAQRead> {
  assertSafePathSegment(faqId, 'Identificador de FAQ')
  return apiClient.patch<FAQRead>(`/faqs/${faqId}/workflow`, data)
}

export function getFaqHistory(faqId: string): Promise<FAQVersionRead[]> {
  assertSafePathSegment(faqId, 'Identificador de FAQ')
  return apiClient.get<FAQVersionRead[]>(`/faqs/${faqId}/history`)
}

export function getFaqUtilityMetrics(): Promise<FAQUtilityMetrics> {
  return apiClient.get<FAQUtilityMetrics>('/faqs/admin/metrics/utility')
}

export function addFaqFeedback(faqId: string, data: FAQFeedbackCreate): Promise<FAQFeedbackRead> {
  assertSafePathSegment(faqId, 'Identificador de FAQ')
  return apiClient.post<FAQFeedbackRead>(`/faqs/${faqId}/feedback`, data)
}

export function createCategory(data: CategoryCreate): Promise<CategoryRead> {
  return apiClient.post<CategoryRead>('/categories', data)
}

export function updateCategory(categoryId: string, data: CategoryUpdate): Promise<CategoryRead> {
  assertSafePathSegment(categoryId, 'Identificador de categoría')
  return apiClient.patch<CategoryRead>(`/categories/${categoryId}`, data)
}

export function setCategoryStatus(categoryId: string, data: ActiveStatusUpdate): Promise<CategoryRead> {
  assertSafePathSegment(categoryId, 'Identificador de categoría')
  return apiClient.patch<CategoryRead>(`/categories/${categoryId}/status`, data)
}
