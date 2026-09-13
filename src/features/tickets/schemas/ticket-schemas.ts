import { z } from 'zod'

export const ticketPrioritySchema = z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'], {
  error: 'Selecciona una prioridad.',
})

export const ticketCreateSchema = z.object({
  category_id: z.string().min(1, 'Selecciona una categoría.'),
  subject: z.string().trim().min(3, 'El asunto debe tener al menos 3 caracteres.').max(200, 'El asunto no puede superar 200 caracteres.'),
  description: z.string().trim().min(5, 'La descripción debe tener al menos 5 caracteres.').max(10000, 'La descripción no puede superar 10000 caracteres.'),
  priority: ticketPrioritySchema,
})

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'Escribe un comentario.').max(5000, 'El comentario no puede superar 5000 caracteres.'),
})

export type TicketFormValues = z.infer<typeof ticketCreateSchema>
export type CommentFormValues = z.infer<typeof commentSchema>
