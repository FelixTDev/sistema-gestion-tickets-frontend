import { apiClient } from '../../../lib/api-client'
import { assertSafePathSegment } from '../../../lib/identifiers'
import type {
  ActiveStatusUpdate,
  CategoryCreate,
  CategoryRead,
  CategoryUpdate,
  FAQCreate,
  FAQRead,
  FAQUpdate,
} from '../types/faq-types'

export function getFaqs(): Promise<FAQRead[]> {
  return apiClient.get<FAQRead[]>('/faqs')
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
