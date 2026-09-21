import { z } from 'zod'

export const passwordRule = z.string()
  .min(8, 'La contraseña debe cumplir las reglas.')
  .max(128, 'La contraseña debe cumplir las reglas.')
  .regex(/[A-Z]/, 'La contraseña debe cumplir las reglas.')
  .regex(/[a-z]/, 'La contraseña debe cumplir las reglas.')
  .regex(/[0-9]/, 'La contraseña debe cumplir las reglas.')

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Ingresa un correo válido.'),
})

export const passwordConfirmationSchema = z.object({
  new_password: passwordRule,
  confirmPassword: z.string().min(1, 'Confirma la contraseña.'),
}).refine((data) => data.new_password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Las contraseñas no coinciden.',
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'La contraseña actual es obligatoria.'),
  new_password: passwordRule,
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña.'),
}).refine((data) => data.new_password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Las contraseñas no coinciden.',
})
