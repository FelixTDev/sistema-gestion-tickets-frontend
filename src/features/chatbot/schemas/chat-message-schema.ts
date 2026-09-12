import { z } from 'zod'

export const chatMessageSchema = z.string()
  .trim()
  .min(1, 'Escribe una consulta.')
  .max(2000, 'La consulta no puede superar 2000 caracteres.')
