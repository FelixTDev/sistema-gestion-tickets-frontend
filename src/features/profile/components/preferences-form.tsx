import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../../../lib/api-client'
import { Button } from '../../../components/ui/button'
import { Checkbox, Field, Input, Select } from '../../../components/ui/form-controls'
import type { PreferencesRead, PreferencesUpdate } from '../types/profile-types'
import { useUpdatePreferencesMutation } from '../hooks/use-profile'

const preferencesSchema = z.object({
  in_app_enabled: z.boolean(),
  email_enabled: z.boolean(),
  assignment_enabled: z.boolean(),
  status_change_enabled: z.boolean(),
  comment_enabled: z.boolean(),
  sla_enabled: z.boolean(),
  preferred_language: z.enum(['es', 'en']),
  timezone: z.string().trim().min(1, 'La zona horaria es obligatoria.'),
})

type PreferencesFormValues = z.infer<typeof preferencesSchema>

function preferencesError(error: unknown): string {
  return error instanceof ApiError && error.status === 422 ? 'Revisa las preferencias ingresadas.' : 'No fue posible actualizar tus preferencias. Inténtalo nuevamente.'
}

export function PreferencesForm({ preferences }: { preferences: PreferencesRead }) {
  const mutation = useUpdatePreferencesMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const { handleSubmit, reset, setValue, watch, register, formState: { errors } } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferences,
  })
  const values = watch()

  useEffect(() => {
    reset(preferences)
  }, [preferences, reset])

  const submit = async (data: PreferencesFormValues) => {
    setServerError(null)
    const payload: PreferencesUpdate = { ...data, security_events_enabled: true }
    try { await mutation.mutateAsync(payload) } catch (error: unknown) { setServerError(preferencesError(error)) }
  }

  return <div className="space-y-4">
    {serverError && <p role="alert" className="rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] px-4 py-3 text-[13.5px] text-[#8b1e1e]">{serverError}</p>}
    {mutation.isSuccess && <p role="status" className="rounded-[10px] border border-[#b9d991] bg-[#f3f9e9] px-4 py-3 text-[13.5px] text-[#3f6512]">Preferencias actualizadas correctamente.</p>}
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-[13px] font-semibold text-ink">Canales y eventos</legend>
        <Checkbox label="Notificaciones dentro del portal" checked={values.in_app_enabled} onChange={(value) => setValue('in_app_enabled', value)} />
        <Checkbox label="Notificaciones por correo" checked={values.email_enabled} onChange={(value) => setValue('email_enabled', value)} />
        <Checkbox label="Asignaciones de tickets" checked={values.assignment_enabled} onChange={(value) => setValue('assignment_enabled', value)} />
        <Checkbox label="Cambios de estado" checked={values.status_change_enabled} onChange={(value) => setValue('status_change_enabled', value)} />
        <Checkbox label="Comentarios" checked={values.comment_enabled} onChange={(value) => setValue('comment_enabled', value)} />
        <Checkbox label="Alertas de SLA" checked={values.sla_enabled} onChange={(value) => setValue('sla_enabled', value)} />
        <Checkbox label="Eventos de seguridad (siempre activos)" checked disabled onChange={() => undefined} />
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Idioma preferido" required error={errors.preferred_language?.message}><Select {...register('preferred_language')}><option value="es">Español</option><option value="en">English</option></Select></Field>
        <Field label="Zona horaria" required error={errors.timezone?.message}><Input {...register('timezone')} /></Field>
      </div>
      <Button type="submit" loading={mutation.isPending}>Guardar preferencias</Button>
    </form>
  </div>
}
