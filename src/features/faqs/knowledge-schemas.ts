import { z } from 'zod'

/** Bounds mirror the backend OpenAPI/Pydantic schemas. */
export const faqFormSchema = z.object({
  category_id: z.string().trim().min(1, 'Selecciona una categoría.'),
  question: z.string().trim().min(3, 'La pregunta debe tener al menos 3 caracteres.').max(2000, 'La pregunta no puede superar 2000 caracteres.'),
  answer: z.string().trim().min(1, 'La respuesta es obligatoria.').max(10000, 'La respuesta no puede superar 10000 caracteres.'),
  keywords: z.string().trim().min(1, 'Indica al menos una palabra clave.').max(2000, 'Las palabras clave no pueden superar 2000 caracteres.'),
})

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(80, 'El nombre no puede superar 80 caracteres.'),
  description: z.string().trim().min(1, 'La descripción es obligatoria.').max(1000, 'La descripción no puede superar 1000 caracteres.'),
})

export type FaqFormValues = z.infer<typeof faqFormSchema>
export type CategoryFormValues = z.infer<typeof categoryFormSchema>
