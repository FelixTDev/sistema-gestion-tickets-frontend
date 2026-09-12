import { apiClient } from '../../../lib/api-client'
import type { CategoryRead, FAQRead } from '../types/faq-types'

export function getFaqs(): Promise<FAQRead[]> {
  return apiClient.get<FAQRead[]>('/faqs')
}

export function getCategories(): Promise<CategoryRead[]> {
  return apiClient.get<CategoryRead[]>('/categories')
}
