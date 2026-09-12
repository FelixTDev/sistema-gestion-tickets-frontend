export interface FAQRead {
  id: string
  category_id: string
  question: string
  answer: string
  keywords: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface CategoryRead {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
