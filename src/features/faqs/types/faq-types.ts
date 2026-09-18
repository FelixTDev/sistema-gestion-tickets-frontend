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

export interface FAQCreate {
  category_id: string
  question: string
  answer: string
  keywords: string
}

export interface FAQUpdate {
  category_id?: string | null
  question?: string | null
  answer?: string | null
  keywords?: string | null
}

export interface ActiveStatusUpdate {
  is_active: boolean
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
