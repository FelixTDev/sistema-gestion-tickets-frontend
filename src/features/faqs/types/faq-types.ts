export type FaqStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'

export interface FAQRead {
  id: string
  category_id: string
  title: string
  question: string
  answer: string
  summary: string
  keywords: string
  tags: string[]
  synonyms: string[]
  intent: string | null
  status: FaqStatus
  priority: number
  display_order: number
  version: number
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface FAQAdminRead extends FAQRead {
  updated_by: string | null
  unpublished_at: string | null
}

export interface FAQCreate {
  category_id: string
  title?: string | null
  question: string
  answer: string
  summary?: string | null
  keywords: string
  tags?: string[]
  synonyms?: string[]
  intent?: string | null
  priority?: number
  display_order?: number
}

export interface FAQUpdate {
  category_id?: string | null
  title?: string | null
  question?: string | null
  answer?: string | null
  summary?: string | null
  keywords?: string | null
  tags?: string[] | null
  synonyms?: string[] | null
  intent?: string | null
  priority?: number | null
  display_order?: number | null
}

export interface ActiveStatusUpdate {
  is_active: boolean
}

export interface WorkflowStatusUpdate {
  status: FaqStatus
}

export interface FAQFeedbackCreate {
  is_helpful: boolean
  comment?: string | null
}

export interface FAQFeedbackRead {
  id: string
  is_helpful: boolean
  created_at: string
}

export interface FAQVersionRead {
  id: string
  faq_id: string
  version: number
  category_id: string
  title: string
  question: string
  answer: string
  summary: string
  keywords: string
  tags: string[]
  synonyms: string[]
  intent: string | null
  status: FaqStatus
  priority: number
  display_order: number
  is_active: boolean
  published_at: string | null
  unpublished_at: string | null
  changed_by: string
  action: string
  changed_at: string
}

export interface FAQUtilityMetrics {
  total_feedback: number
  helpful: number
  not_helpful: number
  usefulness_rate: number
}

export interface FAQPage {
  page: number
  page_size: number
  total: number
  total_pages: number
  items: FAQRead[]
  /** Backward-compatible collection methods for existing landing-page consumers. */
  filter(predicate: (value: FAQRead, index: number, array: FAQRead[]) => unknown): FAQRead[]
  slice(start?: number, end?: number): FAQRead[]
  map<U>(callback: (value: FAQRead, index: number, array: FAQRead[]) => U): U[]
}

export interface FAQAdminPage {
  page: number
  page_size: number
  total: number
  total_pages: number
  items: FAQAdminRead[]
}

export interface FAQPublicFilters {
  search?: string
  category_id?: string
  tag?: string
  published_from?: string
  published_to?: string
  page?: number
  page_size?: number
}

export interface FAQAdminFilters {
  status?: FaqStatus
  search?: string
  category_id?: string
  tag?: string
  created_from?: string
  created_to?: string
  updated_from?: string
  updated_to?: string
  page?: number
  page_size?: number
}

export interface CategoryRead {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryCreate {
  name: string
  description: string
}

export interface CategoryUpdate {
  name?: string | null
  description?: string | null
}
