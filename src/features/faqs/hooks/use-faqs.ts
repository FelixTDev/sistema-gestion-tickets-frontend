import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addFaqFeedback,
  createCategory,
  createFaq,
  getCategories,
  getFaqHistory,
  getFaqUtilityMetrics,
  getFaqs,
  getAdminFaqs,
  setCategoryStatus,
  setFaqStatus,
  updateCategory,
  updateFaq,
  updateFaqWorkflow,
} from '../api/faq-api'
import type {
  ActiveStatusUpdate,
  CategoryCreate,
  CategoryUpdate,
  FAQAdminFilters,
  FAQCreate,
  FAQFeedbackCreate,
  FAQPublicFilters,
  FAQRead,
  FAQUpdate,
  WorkflowStatusUpdate,
} from '../types/faq-types'

interface FilterFaqsInput {
  faqs: FAQRead[]
  categoryId: string
  search: string
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()
}

/** Kept for small local consumers; the public page sends these filters to the backend. */
export function filterFaqs({ faqs, categoryId, search }: FilterFaqsInput): FAQRead[] {
  const term = normalize(search)
  return faqs.filter((faq) => {
    if (!faq.is_active) return false
    if (categoryId && faq.category_id !== categoryId) return false
    if (!term) return true
    return normalize(`${faq.title} ${faq.question} ${faq.summary} ${faq.keywords} ${faq.tags.join(' ')} ${faq.synonyms.join(' ')}`).includes(term)
  })
}

export const faqsQueryKey = ['faqs'] as const
export const categoriesQueryKey = ['categories'] as const
export const adminFaqsQueryKey = ['faqs', 'admin'] as const

export function useFaqs(filters: FAQPublicFilters = {}) {
  return useQuery({ queryKey: [...faqsQueryKey, filters] as const, queryFn: () => getFaqs(filters), retry: false })
}

export function useAdminFaqs(filters: FAQAdminFilters = { page: 1, page_size: 20 }) {
  return useQuery({ queryKey: [...adminFaqsQueryKey, filters] as const, queryFn: () => getAdminFaqs(filters), retry: false })
}

export function useCategories() {
  return useQuery({ queryKey: categoriesQueryKey, queryFn: getCategories, retry: false })
}

export function useFaqHistory(faqId: string | null) {
  return useQuery({
    queryKey: ['faq-history', faqId] as const,
    queryFn: () => getFaqHistory(faqId ?? ''),
    enabled: Boolean(faqId),
    retry: false,
  })
}

export function useFaqUtilityMetrics() {
  return useQuery({ queryKey: ['faq-utility-metrics'] as const, queryFn: getFaqUtilityMetrics, retry: false })
}

export function useCreateFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FAQCreate) => createFaq(data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: faqsQueryKey }) },
  })
}

export function useUpdateFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: FAQUpdate }) => updateFaq(faqId, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: faqsQueryKey }) },
  })
}

export function useSetFaqStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: ActiveStatusUpdate }) => setFaqStatus(faqId, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: faqsQueryKey }) },
  })
}

export function useUpdateFaqWorkflowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: WorkflowStatusUpdate }) => updateFaqWorkflow(faqId, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: faqsQueryKey }) },
  })
}

export function useFaqFeedbackMutation() {
  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: FAQFeedbackCreate }) => addFaqFeedback(faqId, data),
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryCreate) => createCategory(data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: categoriesQueryKey }) },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: CategoryUpdate }) => updateCategory(categoryId, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: categoriesQueryKey }) },
  })
}

export function useSetCategoryStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: ActiveStatusUpdate }) => setCategoryStatus(categoryId, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: categoriesQueryKey }) },
  })
}
