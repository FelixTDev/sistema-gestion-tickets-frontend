import { useQuery } from '@tanstack/react-query'
import { getCategories, getFaqs } from '../api/faq-api'
import type { FAQRead } from '../types/faq-types'

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

export function useFaqs() {
  return useQuery({ queryKey: ['faqs'], queryFn: getFaqs })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories })
}
