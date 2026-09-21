import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../../../lib/api-client'
import { Button } from '../../../components/ui/button'
import { Field, Input } from '../../../components/ui/form-controls'
import type { ProfileRead, ProfileUpdate } from '../types/profile-types'
import { useUpdateProfileMutation } from '../hooks/use-profile'

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(150, 'El nombre es demasiado largo.'),
  phone: z.string().max(30, 'El teléfono es demasiado largo.').optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function profileError(error: unknown): string {
  return error instanceof ApiError && error.status === 422 ? 'Revisa los datos ingresados.' : 'No fue posible actualizar tu perfil. Inténtalo nuevamente.'
}

export function ProfileForm({ profile }: { profile: ProfileRead }) {
  const mutation = useUpdateProfileMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile.full_name, phone: profile.phone ?? '' },
  })

  useEffect(() => {
    reset({ full_name: profile.full_name, phone: profile.phone ?? '' })
  }, [profile, reset])

  const submit = async (values: ProfileFormValues) => {
    setServerError(null)
    const data: ProfileUpdate = { full_name: values.full_name.trim(), phone: values.phone?.trim() || null }
    try { await mutation.mutateAsync(data) } catch (error: unknown) { setServerError(profileError(error)) }
  }

  return <div className="space-y-4">
    {serverError && <p role="alert" className="rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] px-4 py-3 text-[13.5px] text-[#8b1e1e]">{serverError}</p>}
    {mutation.isSuccess && <p role="status" className="rounded-[10px] border border-[#b9d991] bg-[#f3f9e9] px-4 py-3 text-[13.5px] text-[#3f6512]">Perfil actualizado correctamente.</p>}
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <Field label="Nombre completo" required error={errors.full_name?.message}><Input autoComplete="name" {...register('full_name')} /></Field>
      <Field label="Correo electrónico" hint="No editable" error={undefined}><Input type="email" value={profile.email} disabled readOnly /></Field>
      <Field label="Teléfono" hint="Opcional" error={errors.phone?.message}><Input type="tel" autoComplete="tel" {...register('phone')} /></Field>
      <Button type="submit" loading={mutation.isPending}>Guardar perfil</Button>
    </form>
  </div>
}
