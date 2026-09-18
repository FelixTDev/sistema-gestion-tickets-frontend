import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  createFaq,
  getCategories,
  getFaqs,
  setCategoryStatus,
  setFaqStatus,
  updateCategory,
  updateFaq,
} from '../api/faq-api'
import type {
  ActiveStatusUpdate,
  CategoryCreate,
  CategoryUpdate,
  FAQCreate,
  FAQRead,
  FAQUpdate,
} from '../types/faq-types'

interface FilterFaqsInput {
  faqs: FAQRead[]
  categoryId: string
  search: string
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()
}

export function filterFaqs({ faqs, categoryId, search }: FilterFaqsInput): FAQRead[] {
  const term = normalize(search)
  return faqs.filter((faq) => {
    if (!faq.is_active) return false
    if (categoryId && faq.category_id !== categoryId) return false
    if (!term) return true
    return normalize(`${faq.question} ${faq.keywords}`).includes(term)
  })
}

export const faqsQueryKey = ['faqs'] as const
export const categoriesQueryKey = ['categories'] as const

export function useFaqs() {
  return useQuery({ queryKey: faqsQueryKey, queryFn: getFaqs })
}

export function useCategories() {
  return useQuery({ queryKey: categoriesQueryKey, queryFn: getCategories })
}

export function useCreateFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FAQCreate) => createFaq(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

export function useUpdateFaqMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: FAQUpdate }) => updateFaq(faqId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

export function useSetFaqStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: ActiveStatusUpdate }) => setFaqStatus(faqId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqsQueryKey })
    },
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryCreate) => createCategory(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: CategoryUpdate }) => updateCategory(categoryId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useSetCategoryStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: ActiveStatusUpdate }) => setCategoryStatus(categoryId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}
